/**
 * Hardware translation and input listening types
 */

export interface PhysicalDeviceMapping {
  currentLogicalInstance: number;  // 1, 2, 3... (js1, js2)
  targetLogicalInstance: number;   // Reassigned instance
  productName: string;             // e.g. "VKBsim Gladiator EVO R"
  productGuid?: string;
  connected: boolean;
}

export interface HardwareMappingTable {
  joysticks: PhysicalDeviceMapping[];
}

export interface GamepadDetectedInput {
  gamepadIndex: number;
  logicalDeviceInstance: number; // mapped to js1, js2
  scInputString: string;         // e.g. "js1_button1", "js2_rotx"
  inputType: 'button' | 'axis';
  rawValue: number;
}
