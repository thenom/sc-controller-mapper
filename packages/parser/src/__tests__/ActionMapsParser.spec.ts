import { describe, it, expect } from 'vitest';
import { ActionMapsParser } from '../ActionMapsParser';
import type { JoystickDeviceOption } from '@sc-mapping/shared-types';

describe('ActionMapsParser', () => {
  const sampleXml = `<?xml version="1.0" encoding="utf-8"?>
<ActionMaps version="1" optionsVersion="2" rebindVersion="2" profileName="custom_vkb">
  <options type="joystick" instance="1" Product="VKBsim Gladiator EVO R">
    <invert axis="pitch" val="1"/>
    <invert axis="throttle" val="0"/>
  </options>
  <options type="joystick" instance="2" Product="VKBsim Gladiator EVO L">
  </options>
  <actionmap name="spaceship_movement">
    <action name="v_pitch">
      <rebind input="js1_pitch"/>
      <addbind input="js2_button1" activationMode="press"/>
    </action>
    <action name="v_boost">
      <rebind input="js1_button4" activationMode="press"/>
    </action>
    <action name="v_spacebreak">
      <rebind input="js1_button4" activationMode="double_tap"/>
    </action>
  </actionmap>
</ActionMaps>`;

  it('should parse root ActionMaps metadata correctly', () => {
    const doc = ActionMapsParser.parseXML(sampleXml);
    expect(doc.profileName).toBe('custom_vkb');
    expect(doc.version).toBe(1);
    expect(doc.optionsVersion).toBe(2);
    expect(doc.rebindVersion).toBe(2);
  });

  it('should parse device options and axis inversions accurately', () => {
    const doc = ActionMapsParser.parseXML(sampleXml);
    expect(doc.devices).toHaveLength(2);

    const dev1 = doc.devices.find((d): d is JoystickDeviceOption => d.instance === 1 && d.type === 'joystick');
    expect(dev1).toBeDefined();
    expect(dev1?.productName).toBe('VKBsim Gladiator EVO R');
    expect(dev1?.inversions?.['pitch']).toBe(true);
    expect(dev1?.inversions?.['throttle']).toBe(false);

    const dev2 = doc.devices.find((d): d is JoystickDeviceOption => d.instance === 2 && d.type === 'joystick');
    expect(dev2).toBeDefined();
    expect(dev2?.productName).toBe('VKBsim Gladiator EVO L');
  });

  it('should preserve rebind and addbind distinctly without collapsing inputs', () => {
    const doc = ActionMapsParser.parseXML(sampleXml);
    const pitchAction = doc.actionMaps['spaceship_movement'].actions['v_pitch'];

    expect(pitchAction).toBeDefined();
    expect(pitchAction.inputs).toHaveLength(2);
    expect(pitchAction.inputs[0].bindType).toBe('rebind');
    expect(pitchAction.inputs[0].input).toBe('js1_pitch');
    expect(pitchAction.inputs[1].bindType).toBe('addbind');
    expect(pitchAction.inputs[1].input).toBe('js2_button1');
    expect(pitchAction.inputs[1].activationMode).toBe('press');
  });

  it('should parse chorded modifiers and activation modes correctly', () => {
    const chordXml = `<ActionMaps version="1">
      <actionmap name="flight">
        <action name="boost">
          <rebind input="lalt+js1_button5" activationMode="hold" multiTap="1"/>
        </action>
      </actionmap>
    </ActionMaps>`;

    const doc = ActionMapsParser.parseXML(chordXml);
    const action = doc.actionMaps['flight'].actions['boost'];
    expect(action.inputs[0].input).toBe('lalt+js1_button5');
    expect(action.inputs[0].activationMode).toBe('hold');
    expect(action.inputs[0].multiTap).toBe(1);
  });

  it('should throw an informative error on malformed or empty XML', () => {
    expect(() => ActionMapsParser.parseXML('')).toThrow();
    expect(() => ActionMapsParser.parseXML('<BrokenXml')).toThrow();
  });

  it('should normalize legacy or mock aliases like v_quantum_travel to canonical v_toggle_qdrive_engagement', () => {
    const xml = `<ActionMaps version="1">
      <actionmap name="spaceship_quantum">
        <action name="v_quantum_travel">
          <rebind input="js2_button3"/>
        </action>
      </actionmap>
    </ActionMaps>`;

    const doc = ActionMapsParser.parseXML(xml);
    const action = doc.actionMaps['spaceship_quantum'].actions['v_toggle_qdrive_engagement'];
    expect(action).toBeDefined();
    expect(action.inputs).toHaveLength(1);
    expect(action.inputs[0].input).toBe('js2_button3');
    // Ensure the fake name is not present as a separate action
    expect(doc.actionMaps['spaceship_quantum'].actions['v_quantum_travel']).toBeUndefined();
  });
});
