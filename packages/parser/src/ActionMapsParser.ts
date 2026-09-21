import { DOMParser } from '@xmldom/xmldom';
import type {
  ActionMapsDocument,
  ActionMapGroup,
  ActionBinding,
  BindingInput,
  JoystickDeviceOption,
  DeviceOption,
  HardwarePrefix,
  ActivationMode,
  BindType
} from '@sc-mapping/shared-types';

/**
 * Server-side / Node.js DOM parser for Star Citizen actionmaps.xml
 * Preserves hardware prefixes, rebind vs addbind arrays, and device metadata.
 */
export class ActionMapsParser {
  /**
   * Parse raw XML string into typed ActionMapsDocument AST
   */
  public static parseXML(xmlContent: string): ActionMapsDocument {
    const parser = new DOMParser({
      errorHandler: {
        warning: () => {},
        error: (msg: string) => {
          throw new Error(`XML Parse Error: ${msg}`);
        },
        fatalError: (msg: string) => {
          throw new Error(`XML Fatal Error: ${msg}`);
        }
      }
    });

    const doc = parser.parseFromString(xmlContent, 'text/xml');
    const root = doc.documentElement;

    if (!root || (root.tagName !== 'ActionMaps' && root.tagName !== 'profile')) {
      throw new Error("Invalid Star Citizen XML: Root element must be <ActionMaps> or <profile>");
    }

    const result: ActionMapsDocument = {
      version: parseInt(root.getAttribute('version') || '1', 10),
      optionsVersion: root.hasAttribute('optionsVersion') 
        ? parseInt(root.getAttribute('optionsVersion')!, 10) 
        : 2,
      rebindVersion: root.hasAttribute('rebindVersion') 
        ? parseInt(root.getAttribute('rebindVersion')!, 10) 
        : 2,
      profileName: root.getAttribute('profileName') || (root.tagName === 'profile' ? 'defaultProfile' : 'custom'),
      devices: [],
      actionMaps: {}
    };

    // 1. Parse <CustomisationUIDs> if present
    const customUIDNodes = root.getElementsByTagName('CustomisationUIDs');
    if (customUIDNodes.length > 0) {
      const cNode = customUIDNodes[0];
      const optionUIDs: string[] = [];
      const listUIDs: string[] = [];

      const optNodes = cNode.getElementsByTagName('OptionUID');
      for (let i = 0; i < optNodes.length; i++) {
        const text = optNodes[i].getAttribute('text');
        if (text) optionUIDs.push(text);
      }

      const lNodes = cNode.getElementsByTagName('ListUID');
      for (let i = 0; i < lNodes.length; i++) {
        const text = lNodes[i].getAttribute('text');
        if (text) listUIDs.push(text);
      }

      result.customisationUIDs = { optionUIDs, listUIDs };
    }

    // 2. Parse <options> nodes (Joysticks, Keyboards, Mice)
    const optionsNodes = root.getElementsByTagName('options');
    for (let i = 0; i < optionsNodes.length; i++) {
      const opt = optionsNodes[i];
      const type = opt.getAttribute('type');

      if (type === 'joystick') {
        const instance = parseInt(opt.getAttribute('instance') || '1', 10);
        const product = opt.getAttribute('Product') || `Joystick ${instance}`;
        const guid = opt.getAttribute('ProductGUID') || undefined;

        const inversions: Record<string, boolean> = {};
        const invertNodes = opt.getElementsByTagName('invert');
        for (let j = 0; j < invertNodes.length; j++) {
          const inv = invertNodes[j];
          const axis = inv.getAttribute('axis');
          const val = inv.getAttribute('val');
          if (axis) {
            inversions[axis] = val === '1' || val === 'true';
          }
        }

        const joyDevice: JoystickDeviceOption = {
          type: 'joystick',
          instance,
          productName: product,
          productGuid: guid,
          inversions
        };
        result.devices.push(joyDevice);
      } else if (type === 'keyboard') {
        result.devices.push({
          type: 'keyboard',
          instance: 1
        });
      } else if (type === 'mouse') {
        result.devices.push({
          type: 'mouse',
          instance: 1
        });
      }
    }

    // 3. Parse <actionmap> groupings
    const actionmapNodes = root.getElementsByTagName('actionmap');
    for (let i = 0; i < actionmapNodes.length; i++) {
      const amNode = actionmapNodes[i];
      const mapName = amNode.getAttribute('name');
      if (!mapName) continue;

      const group: ActionMapGroup = {
        name: mapName,
        label: amNode.getAttribute('UILabel') || undefined,
        actions: {}
      };

      const actionNodes = amNode.getElementsByTagName('action');
      for (let j = 0; j < actionNodes.length; j++) {
        const actNode = actionNodes[j];
        const actionName = actNode.getAttribute('name');
        if (!actionName) continue;

        const actionBinding: ActionBinding = {
          name: actionName,
          label: actNode.getAttribute('UILabel') || undefined,
          description: actNode.getAttribute('UIDescription') || undefined,
          inputs: []
        };

        // Direct device attributes (e.g. defaultProfile.xml keyboard="...", mouse="...", etc.)
        const deviceAttrs: Array<{ attr: string; prefix: string }> = [
          { attr: 'keyboard', prefix: 'kb1_' },
          { attr: 'mouse', prefix: 'mo1_' },
          { attr: 'gamepad', prefix: 'gp1_' },
          { attr: 'joystick', prefix: 'js1_' }
        ];

        for (const { attr, prefix } of deviceAttrs) {
          const val = actNode.getAttribute(attr)?.trim();
          if (val && val !== '') {
            const rawInput = val.includes('_') ? val : prefix + val;
            actionBinding.inputs.push(this.parseInputDescriptor(rawInput, 'rebind', actNode));
          }
        }

        // Extract <rebind>, <addbind>, and device-specific child elements
        const childNodes = actNode.childNodes;
        for (let k = 0; k < childNodes.length; k++) {
          const child = childNodes[k] as Element;
          if (child.nodeType !== 1) continue; // Skip text and comment nodes

          const tagName = child.tagName;
          if (tagName === 'rebind' || tagName === 'addbind') {
            const rawInput = child.getAttribute('input')?.trim();
            if (!rawInput) continue;

            const parsedInput = this.parseInputDescriptor(
              rawInput,
              tagName as BindType,
              child
            );
            actionBinding.inputs.push(parsedInput);
          } else if (tagName === 'keyboard' || tagName === 'mouse' || tagName === 'gamepad' || tagName === 'joystick') {
            const rawInput = child.getAttribute('input')?.trim();
            if (rawInput && rawInput !== '') {
              const prefix = tagName === 'keyboard' ? 'kb1_' : tagName === 'mouse' ? 'mo1_' : tagName === 'gamepad' ? 'gp1_' : 'js1_';
              const inputStr = rawInput.includes('_') ? rawInput : prefix + rawInput;
              actionBinding.inputs.push(this.parseInputDescriptor(inputStr, 'rebind', child));
            }
          }
        }

        group.actions[actionName] = actionBinding;
      }

      result.actionMaps[mapName] = group;
    }

    return result;
  }

  /**
   * Deconstruct raw input string into hardware prefix, key, modifiers, and temporal attributes
   * e.g. "js1_button1" -> prefix: "js1", key: "button1"
   * e.g. "kb1_lalt+c" -> prefix: "kb1", modifiers: ["lalt"], key: "c"
   */
  public static parseInputDescriptor(
    rawInput: string,
    bindType: BindType,
    element?: Element
  ): BindingInput {
    let devicePrefix: HardwarePrefix = 'kb1';
    let hardwareKey = rawInput;
    let modifiers: string[] | undefined = undefined;

    // Detect hardware prefix (e.g. js1_, kb1_, mo1_, gp1_)
    const prefixMatch = rawInput.match(/^([a-z0-9]+)_(.+)$/i);
    if (prefixMatch) {
      devicePrefix = prefixMatch[1].toLowerCase() as HardwarePrefix;
      hardwareKey = prefixMatch[2];
    }

    // Detect chorded modifiers (e.g. lalt+space, rctrl+x)
    if (hardwareKey.includes('+')) {
      const parts = hardwareKey.split('+');
      modifiers = parts.slice(0, -1);
      hardwareKey = parts[parts.length - 1];
    }

    let activationMode: ActivationMode | undefined = undefined;
    let multiTap: number | undefined = undefined;

    if (element) {
      const actAttr = element.getAttribute('activationMode');
      if (actAttr) {
        activationMode = actAttr as ActivationMode;
      }
      const mtAttr = element.getAttribute('multiTap');
      if (mtAttr) {
        multiTap = parseInt(mtAttr, 10);
      }
    }

    return {
      input: rawInput,
      devicePrefix,
      hardwareKey,
      modifiers,
      activationMode,
      multiTap,
      bindType
    };
  }
}
