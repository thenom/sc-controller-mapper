import type {
  ActionMapsDocument,
  JoystickDeviceOption
} from '@sc-mapping/shared-types';

/**
 * Lossless XML Recompiler for Star Citizen actionmaps.xml
 * Supports global hardware instance swapping (rewriting jsX_ prefixes)
 */
export class ActionMapsExporter {
  /**
   * Recompiles ActionMapsDocument AST into engine-compliant XML
   * @param doc The parsed ActionMaps AST
   * @param hardwareMapping Optional mapping from original logical instance to target logical instance (e.g. Map(1 => 2, 2 => 1))
   */
  public static exportToXML(
    doc: ActionMapsDocument,
    hardwareMapping?: Map<number, number>
  ): string {
    const mapping = hardwareMapping || new Map<number, number>();
    const lines: string[] = [];

    lines.push('<?xml version="1.0" encoding="utf-8"?>');
    lines.push(
      `<ActionMaps version="${doc.version}" ` +
      `optionsVersion="${doc.optionsVersion ?? 2}" ` +
      `rebindVersion="${doc.rebindVersion ?? 2}" ` +
      `profileName="${this.escapeXml(doc.profileName)}">`
    );

    // 1. Serialize <CustomisationUIDs> if present
    if (doc.customisationUIDs) {
      lines.push('  <CustomisationUIDs>');
      for (const uid of doc.customisationUIDs.optionUIDs) {
        lines.push(`    <OptionUID text="${this.escapeXml(uid)}"/>`);
      }
      for (const uid of doc.customisationUIDs.listUIDs) {
        lines.push(`    <ListUID text="${this.escapeXml(uid)}"/>`);
      }
      lines.push('  </CustomisationUIDs>');
    }

    // 2. Serialize <options> nodes with reassigned instances
    for (const dev of doc.devices) {
      if (dev.type === 'joystick') {
        const joy = dev as JoystickDeviceOption;
        const targetInstance = mapping.get(joy.instance) ?? joy.instance;
        const guidAttr = joy.productGuid ? ` ProductGUID="${this.escapeXml(joy.productGuid)}"` : '';

        lines.push(
          `  <options type="joystick" instance="${targetInstance}" ` +
          `Product="${this.escapeXml(joy.productName)}"${guidAttr}>`
        );

        if (joy.inversions && Object.keys(joy.inversions).length > 0) {
          for (const [axis, inverted] of Object.entries(joy.inversions)) {
            lines.push(`    <invert axis="${this.escapeXml(axis)}" val="${inverted ? '1' : '0'}"/>`);
          }
        }
        lines.push('  </options>');
      } else if (dev.type === 'keyboard') {
        lines.push('  <options type="keyboard" instance="1"/>');
      } else if (dev.type === 'mouse') {
        lines.push('  <options type="mouse" instance="1"/>');
      }
    }

    // 3. Serialize <actionmap> groups and child <action> bindings
    for (const [mapName, group] of Object.entries(doc.actionMaps)) {
      lines.push(`  <actionmap name="${this.escapeXml(mapName)}">`);

      for (const [actionName, action] of Object.entries(group.actions)) {
        if (!action.inputs || action.inputs.length === 0) continue;

        lines.push(`    <action name="${this.escapeXml(actionName)}">`);

        for (const input of action.inputs) {
          const rewrittenInput = this.rewriteHardwareInput(input.input, mapping);
          const actModeAttr = input.activationMode
            ? ` activationMode="${this.escapeXml(input.activationMode)}"`
            : '';
          const multiTapAttr = input.multiTap !== undefined && input.multiTap > 1
            ? ` multiTap="${input.multiTap}"`
            : '';

          lines.push(
            `      <${input.bindType} input="${this.escapeXml(rewrittenInput)}"${actModeAttr}${multiTapAttr}/>`
          );
        }

        lines.push('    </action>');
      }

      lines.push('  </actionmap>');
    }

    lines.push('</ActionMaps>');
    return lines.join('\n');
  }

  /**
   * Search and replace hardware joystick prefixes (e.g. js1_ -> js2_)
   */
  public static rewriteHardwareInput(
    rawInput: string,
    mapping: Map<number, number>
  ): string {
    if (mapping.size === 0) return rawInput;

    return rawInput.replace(/\bjs(\d+)_/gi, (_match, instStr) => {
      const currentInst = parseInt(instStr, 10);
      const targetInst = mapping.get(currentInst) ?? currentInst;
      return `js${targetInst}_`;
    });
  }

  private static escapeXml(unsafe: string): string {
    return unsafe
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }
}
