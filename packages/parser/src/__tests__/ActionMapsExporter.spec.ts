import { describe, it, expect } from 'vitest';
import { ActionMapsParser } from '../ActionMapsParser';
import { ActionMapsExporter } from '../ActionMapsExporter';
import type { JoystickDeviceOption } from '@sc-mapping/shared-types';

describe('ActionMapsExporter', () => {
  const baseXml = `<?xml version="1.0" encoding="utf-8"?>
<ActionMaps version="1" optionsVersion="2" rebindVersion="2" profileName="dual_vkb_swap_test">
  <options type="joystick" instance="1" Product="VKBsim Gladiator EVO R">
    <invert axis="pitch" val="1"/>
  </options>
  <options type="joystick" instance="2" Product="VKBsim Gladiator EVO L">
  </options>
  <actionmap name="spaceship_movement">
    <action name="v_pitch">
      <rebind input="js1_pitch"/>
      <addbind input="js2_button1" activationMode="press"/>
    </action>
    <action name="v_yaw">
      <rebind input="lalt+js1_yaw"/>
    </action>
  </actionmap>
</ActionMaps>`;

  it('should round-trip XML without data loss when no re-indexing is applied', () => {
    const parsed = ActionMapsParser.parseXML(baseXml);
    const exported = ActionMapsExporter.exportToXML(parsed);

    const reParsed = ActionMapsParser.parseXML(exported);
    expect(reParsed.profileName).toBe('dual_vkb_swap_test');
    expect(reParsed.devices).toHaveLength(2);
    const dev0 = reParsed.devices[0] as JoystickDeviceOption;
    expect(dev0.productName).toBe('VKBsim Gladiator EVO R');
    expect(dev0.inversions?.['pitch']).toBe(true);

    const pitchAction = reParsed.actionMaps['spaceship_movement'].actions['v_pitch'];
    expect(pitchAction.inputs).toHaveLength(2);
    expect(pitchAction.inputs[0].input).toBe('js1_pitch');
    expect(pitchAction.inputs[1].input).toBe('js2_button1');
  });

  it('should cleanly rewrite jsX_ hardware prefixes and swap device options when re-indexing', () => {
    const parsed = ActionMapsParser.parseXML(baseXml);

    // Swap Joystick 1 and Joystick 2
    const swapMapping = new Map<number, number>([
      [1, 2],
      [2, 1]
    ]);

    const exported = ActionMapsExporter.exportToXML(parsed, swapMapping);
    const reParsed = ActionMapsParser.parseXML(exported);

    // Verify devices were swapped in instance numbers
    const newDev2 = reParsed.devices.find((d): d is JoystickDeviceOption => d.type === 'joystick' && d.productName === 'VKBsim Gladiator EVO R');
    expect(newDev2?.instance).toBe(2);

    const newDev1 = reParsed.devices.find((d): d is JoystickDeviceOption => d.type === 'joystick' && d.productName === 'VKBsim Gladiator EVO L');
    expect(newDev1?.instance).toBe(1);

    // Verify input prefixes were rewritten
    const pitchAction = reParsed.actionMaps['spaceship_movement'].actions['v_pitch'];
    expect(pitchAction.inputs[0].input).toBe('js2_pitch'); // was js1_pitch
    expect(pitchAction.inputs[1].input).toBe('js1_button1'); // was js2_button1

    // Verify chorded modifier was rewritten
    const yawAction = reParsed.actionMaps['spaceship_movement'].actions['v_yaw'];
    expect(yawAction.inputs[0].input).toBe('lalt+js2_yaw'); // was lalt+js1_yaw
  });

  it('should preserve and round-trip CustomisationUIHeader and native Star Citizen axis inversions across multiple joysticks', () => {
    const scProfileXml = `<?xml version="1.0" encoding="utf-8"?>
<ActionMaps version="1" optionsVersion="2" rebindVersion="2" profileName="TheNomV1">
  <CustomisationUIHeader label="TheNomV1" description="Test profile" image="">
    <devices>
      <keyboard instance="1"/>
      <mouse instance="1"/>
      <joystick instance="1"/>
      <joystick instance="2"/>
      <joystick instance="3"/>
    </devices>
    <categories>
      <category label="@ui_CCSeatGeneral"/>
      <category label="@ui_CCSpaceFlight"/>
    </categories>
  </CustomisationUIHeader>
  <options type="joystick" instance="1" Product="VKB Stick R">
    <flight_move_yaw invert="1"/>
    <flight_strafe_longitudinal invert="1"/>
  </options>
  <options type="joystick" instance="2" Product="VKB Stick L">
    <flight_move_pitch invert="0"/>
  </options>
  <options type="joystick" instance="3" Product="MFG Crosswind Pedals">
  </options>
  <modifiers />
  <actionmap name="spaceship_movement">
    <action name="v_yaw">
      <rebind input="js1_yaw"/>
    </action>
    <action name="v_strafe_vertical">
      <rebind input="js3_z"/>
    </action>
  </actionmap>
</ActionMaps>`;

    const parsed = ActionMapsParser.parseXML(scProfileXml);
    expect(parsed.customisationUIHeader).toBeDefined();
    expect(parsed.customisationUIHeader?.label).toBe('TheNomV1');
    expect(parsed.customisationUIHeader?.devices).toHaveLength(5);
    expect(parsed.modifiers).toBe(true);

    const dev1 = parsed.devices.find((d): d is JoystickDeviceOption => d.type === 'joystick' && d.instance === 1);
    expect(dev1?.inversions['flight_move_yaw']).toBe(true);
    expect(dev1?.inversions['flight_strafe_longitudinal']).toBe(true);

    // Export with swap between js1 and js2
    const swapMapping = new Map<number, number>([[1, 2], [2, 1]]);
    const exported = ActionMapsExporter.exportToXML(parsed, swapMapping);

    expect(exported).toContain('<CustomisationUIHeader label="TheNomV1"');
    expect(exported).toContain('<flight_move_yaw invert="1"/>');
    expect(exported).toContain('<modifiers />');
    expect(exported).toContain('input="js2_yaw"');
    expect(exported).toContain('input="js3_z"'); // js3 remains untouched

    const reParsed = ActionMapsParser.parseXML(exported);
    expect(reParsed.customisationUIHeader?.label).toBe('TheNomV1');
    expect(reParsed.customisationUIHeader?.devices.find(d => d.type === 'joystick' && d.instance === 2)).toBeDefined();
  });
});
