import { ActionMapsParser, ActionMapsExporter, LocalizationMerger } from '@sc-mapping/parser';
import { ConflictResolver, ExclusionMatrix, ConflictSeverity } from './index.js';
import type { ActionMapsDocument, ActionBinding } from '@sc-mapping/shared-types';

console.log('=== RUNNING VERIFICATION SUITE ===\n');

// 1. Test XML Parsing & Preservation of Rebind/Addbind & Hardware Prefixes
const testXml = `<?xml version="1.0" encoding="utf-8"?>
<ActionMaps version="1" optionsVersion="2" rebindVersion="2" profileName="custom_profile">
  <options type="joystick" instance="1" Product="VKBsim Gladiator EVO R">
    <invert axis="pitch" val="1"/>
    <invert axis="throttle" val="0"/>
  </options>
  <options type="joystick" instance="2" Product="VKBsim STECS Throttle">
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
    <action name="v_eject">
      <rebind input="js1_button5" activationMode="hold"/>
    </action>
    <action name="v_lights_toggle">
      <rebind input="js1_button5" activationMode="press"/>
    </action>
  </actionmap>
  <actionmap name="spaceship_weapons">
    <action name="v_attack1_group1">
      <rebind input="js1_button1"/>
    </action>
  </actionmap>
  <actionmap name="player_input_onfoot">
    <action name="fire">
      <rebind input="js1_button1"/>
    </action>
  </actionmap>
</ActionMaps>`;

const parsed = ActionMapsParser.parseXML(testXml);

console.log('✓ ActionMapsParser parsed root:', parsed.profileName, 'version:', parsed.version);
console.log('✓ Devices parsed:', parsed.devices.length);
const joy1 = parsed.devices[0] as any;
if (joy1.productName !== 'VKBsim Gladiator EVO R' || joy1.inversions.pitch !== true) {
  throw new Error('Device parsing failed!');
}
console.log('✓ Device 1 inversions verified:', joy1.inversions);

const pitchAction = parsed.actionMaps['spaceship_movement'].actions['v_pitch'];
if (pitchAction.inputs.length !== 2) {
  throw new Error(`Expected 2 inputs (1 rebind, 1 addbind), got ${pitchAction.inputs.length}`);
}
if (pitchAction.inputs[0].bindType !== 'rebind' || pitchAction.inputs[1].bindType !== 'addbind') {
  throw new Error('Bind type distinction (rebind vs addbind) failed!');
}
console.log('✓ Rebind and Addbind parsed cleanly for v_pitch:', pitchAction.inputs);

// 2. Test Localization Merger
const merger = new LocalizationMerger();
merger.loadIni(`
ui_v_pitch=Pitch (Elevator)
ui_v_boost=Engine Afterburner / Boost
ui_v_spacebreak=Space Brake
ui_spaceship_movement=Flight - Movement Controls
`);
merger.enrichDocument(parsed);
if (pitchAction.label !== 'Pitch (Elevator)') {
  throw new Error(`Localization merge failed! Expected 'Pitch (Elevator)', got '${pitchAction.label}'`);
}
console.log('✓ Localization enriched label:', pitchAction.label);

// 3. Test Conflict Detection: Rule A (double_tap vs press = Warning)
const boostAction = parsed.actionMaps['spaceship_movement'].actions['v_boost'];
const brakeAction = parsed.actionMaps['spaceship_movement'].actions['v_spacebreak'];
const ruleAResult = ConflictResolver.evaluateActions('spaceship_movement', boostAction, 'spaceship_movement', brakeAction);
console.log('\n--- Evaluating Rule A (double_tap vs single tap) ---');
console.log('Result severity:', ruleAResult.severity, 'Reason:', ruleAResult.reason);
if (ruleAResult.severity !== ConflictSeverity.Warning) {
  throw new Error(`Expected Warning (1) for Rule A, got ${ruleAResult.severity}`);
}
console.log('✓ Rule A passed (Severity 1 - Warning)');

// 4. Test Conflict Detection: Rule B (multiTap="2" vs single tap = Fatal Conflict)
const testActionTap1: ActionBinding = {
  name: 'test_tap1',
  inputs: [{ input: 'js1_button10', devicePrefix: 'js1', hardwareKey: 'button10', bindType: 'rebind', multiTap: 1 }]
};
const testActionTap2: ActionBinding = {
  name: 'test_tap2',
  inputs: [{ input: 'js1_button10', devicePrefix: 'js1', hardwareKey: 'button10', bindType: 'rebind', multiTap: 2 }]
};
const ruleBResult = ConflictResolver.evaluateActions('spaceship_movement', testActionTap1, 'spaceship_movement', testActionTap2);
console.log('\n--- Evaluating Rule B (multiTap="2" vs single tap) ---');
console.log('Result severity:', ruleBResult.severity, 'Reason:', ruleBResult.reason);
if (ruleBResult.severity !== ConflictSeverity.Fatal) {
  throw new Error(`Expected Fatal (2) for Rule B, got ${ruleBResult.severity}`);
}
console.log('✓ Rule B passed (Severity 2 - Fatal)');

// 5. Test Conflict Detection: Rule C (hold vs press on Destructive action = Fatal)
const ejectAction = parsed.actionMaps['spaceship_movement'].actions['v_eject'];
const lightsAction = parsed.actionMaps['spaceship_movement'].actions['v_lights_toggle'];
const ruleCResult = ConflictResolver.evaluateActions('spaceship_movement', ejectAction, 'spaceship_movement', lightsAction);
console.log('\n--- Evaluating Rule C (hold vs press on Destructive action: v_eject) ---');
console.log('Result severity:', ruleCResult.severity, 'Reason:', ruleCResult.reason);
if (ruleCResult.severity !== ConflictSeverity.Fatal) {
  throw new Error(`Expected Fatal (2) for destructive Rule C, got ${ruleCResult.severity}`);
}
console.log('✓ Rule C passed (Severity 2 - Fatal on Destructive Action)');

// 6. Test Exclusionary Matrix (spaceship_weapons vs player_input_onfoot sharing js1_button1)
const shipWeapon = parsed.actionMaps['spaceship_weapons'].actions['v_attack1_group1'];
const onfootFire = parsed.actionMaps['player_input_onfoot'].actions['fire'];
const exclusionResult = ConflictResolver.evaluateActions('spaceship_weapons', shipWeapon, 'player_input_onfoot', onfootFire);
console.log('\n--- Evaluating Exclusionary Matrix (Flight vs On-Foot) ---');
console.log('Result severity:', exclusionResult.severity, 'Reason:', exclusionResult.reason);
if (exclusionResult.severity !== ConflictSeverity.None) {
  throw new Error(`Expected None (0) for mutually exclusive contexts, got ${exclusionResult.severity}`);
}
console.log('✓ Exclusionary Matrix passed (Severity 0 - None)');

// 7. Test Hardware Reassignment & Recompilation Export
console.log('\n--- Testing Hardware Reassignment (Swap js1 <-> js2) ---');
const swapMap = new Map<number, number>([
  [1, 2],
  [2, 1]
]);
const recompiledXml = ActionMapsExporter.exportToXML(parsed, swapMap);
if (!recompiledXml.includes('instance="2" Product="VKBsim Gladiator EVO R"')) {
  throw new Error('Device 1 was not remapped to instance 2 in XML options!');
}
if (!recompiledXml.includes('input="js2_pitch"')) {
  throw new Error('js1_pitch was not rewritten to js2_pitch!');
}
console.log('✓ Hardware Recompiler rewritten js1 -> js2 successfully!');

console.log('\n=== ALL VERIFICATION CHECKS PASSED SUCCESSFULLY ===');
