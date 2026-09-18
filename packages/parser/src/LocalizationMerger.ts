import type {
  ActionMapsDocument,
  LocalizedActionMetadata
} from '@sc-mapping/shared-types';

/**
 * Ingestion module that merges extracted English localization strings (global.ini)
 * with programmatic ActionMaps action names, populating human-readable labels and descriptions.
 */
export class LocalizationMerger {
  private locMap: Map<string, string> = new Map();

  constructor(iniRawContent?: string) {
    if (iniRawContent) {
      this.loadIni(iniRawContent);
    }
  }

  /**
   * Load key-value pairs from Star Citizen global.ini
   */
  public loadIni(content: string): void {
    const lines = content.split(/\r?\n/);
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#') || trimmed.startsWith(';')) {
        continue;
      }
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx !== -1) {
        let key = trimmed.slice(0, eqIdx).trim();
        const value = trimmed.slice(eqIdx + 1).trim();
        // Remove leading @ prefix if present
        if (key.startsWith('@')) {
          key = key.slice(1);
        }
        this.locMap.set(key.toLowerCase(), value);
      }
    }
  }

  /**
   * Load pre-parsed dictionary object (from Go daemon or cached JSON)
   */
  public loadDictionary(dict: Record<string, string>): void {
    for (const [k, v] of Object.entries(dict)) {
      const cleanKey = k.startsWith('@') ? k.slice(1) : k;
      this.locMap.set(cleanKey.toLowerCase(), v);
    }
  }

  /**
   * Resolve human-readable label and tooltip for a given action and actionmap
   */
  public resolveActionMetadata(actionName: string, mapName: string): LocalizedActionMetadata {
    // Star Citizen localization key candidate heuristics:
    // 1. Direct match: @ui_{actionName}
    // 2. Cloud Imperium variant: @ui_ci_{actionName}
    // 3. Map contextual variant: @ui_{mapName}_{actionName}
    // 4. Exact raw key match
    const candidateKeys = [
      `ui_${actionName}`.toLowerCase(),
      `ui_ci_${actionName}`.toLowerCase(),
      `ui_${mapName}_${actionName}`.toLowerCase(),
      actionName.toLowerCase()
    ];

    for (const key of candidateKeys) {
      const localized = this.locMap.get(key);
      if (localized) {
        return {
          label: localized,
          description: `Internal: ${actionName} (${mapName})`,
          category: this.formatMapCategory(mapName)
        };
      }
    }

    // Fallback: Generate clean, humanized title from programmatic action name
    return {
      label: this.humanizeActionName(actionName),
      description: `Internal: ${actionName} (${mapName})`,
      category: this.formatMapCategory(mapName)
    };
  }

  /**
   * Enrich an ActionMapsDocument in-place by attaching labels and descriptions
   */
  public enrichDocument(doc: ActionMapsDocument): void {
    for (const [mapName, group] of Object.entries(doc.actionMaps)) {
      group.label = this.formatMapCategory(mapName);

      for (const [actionName, action] of Object.entries(group.actions)) {
        const meta = this.resolveActionMetadata(actionName, mapName);
        action.label = meta.label;
        action.description = meta.description;
      }
    }
  }

  /**
   * Format camelCase or snake_case action names into readable text
   * e.g. "v_attack1_group1" -> "Attack 1 Group 1"
   * e.g. "v_strafe_vertical" -> "Strafe Vertical"
   */
  public humanizeActionName(name: string): string {
    return name
      .replace(/^v_/, '')
      .replace(/_/g, ' ')
      .replace(/\b[a-z]/g, (c) => c.toUpperCase());
  }

  /**
   * Format actionmap context names into human-readable titles
   */
  public formatMapCategory(mapName: string): string {
    const directLookup = this.locMap.get(`ui_${mapName}`.toLowerCase());
    if (directLookup) return directLookup;

    return mapName
      .replace(/_/g, ' ')
      .replace(/\b[a-z]/g, (c) => c.toUpperCase());
  }
}
