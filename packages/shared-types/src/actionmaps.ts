/**
 * Core JSON Schema interfaces for Star Citizen ActionMaps
 * Accurately models CryEngine-derived XML input hierarchies
 */

export type HardwarePrefix = 'kb1' | 'mo1' | 'gp1' | `js${number}`;

export type ActivationMode =
  | 'press'
  | 'hold'
  | 'double_tap'
  | 'delayed_press'
  | 'smart_toggle';

export type BindType = 'rebind' | 'addbind';

export interface BindingInput {
  /** Raw hardware input string (e.g. 'js1_button1', 'kb1_lctrl+c', 'mo1_wheel_up') */
  input: string;
  /** Extracted hardware prefix for physical device indexing (e.g. 'js1', 'kb1') */
  devicePrefix: HardwarePrefix;
  /** The normalized hardware key or axis (e.g. 'button1', 'pitch', 'space') */
  hardwareKey: string;
  /** Modifier keys if chorded (e.g. ['lalt', 'lctrl']) */
  modifiers?: string[];
  /** In-engine activation behavioral mode (press, hold, double_tap, etc.) */
  activationMode?: ActivationMode;
  /** Multi-tap threshold (1 = single tap, 2 = double tap concurrent) */
  multiTap?: number;
  /** Vital distinction: 'rebind' replaces default, 'addbind' appends secondary input */
  bindType: BindType;
}

export interface ActionBinding {
  /** Internal programmatic action identifier (e.g. 'v_pitch', 'v_attack1_group1') */
  name: string;
  /** Human-readable localized title from global.ini (e.g. 'Pitch', 'Fire Weapon Group 1') */
  label?: string;
  /** Human-readable description / category explanation */
  description?: string;
  /** Array of inputs (primary rebind + secondary addbinds) */
  inputs: BindingInput[];
  /** Operational tags (e.g. ['flight', 'combat', 'nav', 'destructive']) */
  tags?: string[];
}

export interface ActionMapGroup {
  /** Action map context name (e.g. 'spaceship_movement', 'player_input_onfoot') */
  name: string;
  /** Human-readable context label (e.g. 'Flight - Movement') */
  label?: string;
  /** Actions defined within this context */
  actions: Record<string, ActionBinding>;
}

export interface JoystickInversions {
  [axisName: string]: boolean;
}

export interface JoystickDeviceOption {
  type: 'joystick';
  instance: number; // 1-based index (e.g. js1, js2)
  productName: string; // e.g. 'VKBsim Gladiator EVO R', 'T.16000M'
  productGuid?: string;
  inversions: JoystickInversions;
  deadzones?: Record<string, number>;
  sensitivities?: Record<string, number>;
}

export interface KeyboardDeviceOption {
  type: 'keyboard';
  instance: 1;
  inversions?: Record<string, boolean>;
}

export interface MouseDeviceOption {
  type: 'mouse';
  instance: 1;
  sensitivity?: number;
  inversions?: Record<string, boolean>;
}

export type DeviceOption = JoystickDeviceOption | KeyboardDeviceOption | MouseDeviceOption;

export interface CustomisationUIDs {
  optionUIDs: string[];
  listUIDs: string[];
}

export interface ActionMapsDocument {
  version: number;
  optionsVersion?: number;
  rebindVersion?: number;
  profileName: string;
  customisationUIDs?: CustomisationUIDs;
  /** Device options mapped by device type and instance */
  devices: DeviceOption[];
  /** Action maps mapped by context name */
  actionMaps: Record<string, ActionMapGroup>;
}
