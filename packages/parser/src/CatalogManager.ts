import type {
  ActionBinding,
  ActionMapsDocument,
  ActionCatalogEntry,
  ActionMapCatalog,
  MasterActionCatalog,
  UnboundActionItem,
  BindingInput
} from '@sc-mapping/shared-types';
import { MASTER_ACTION_CATALOG } from './catalog/defaultCatalog.js';

export class CatalogManager {
  private static defaultIndex: Map<string, ActionCatalogEntry> | null = null;
  private catalog: MasterActionCatalog;
  private instanceIndex: Map<string, ActionCatalogEntry> | null = null;

  constructor(customCatalog?: MasterActionCatalog) {
    this.catalog = customCatalog || MASTER_ACTION_CATALOG;
  }

  private static getDefaultIndex(): Map<string, ActionCatalogEntry> {
    if (!CatalogManager.defaultIndex) {
      CatalogManager.defaultIndex = new Map();
      for (const mapCatalog of Object.values(MASTER_ACTION_CATALOG)) {
        for (const action of mapCatalog.actions) {
          CatalogManager.defaultIndex.set(action.name.toLowerCase(), action);
        }
      }
    }
    return CatalogManager.defaultIndex;
  }

  /**
   * Get an action definition from the canonical game-extracted default catalog.
   */
  public static getActionEntry(actionName: string): ActionCatalogEntry | undefined {
    return CatalogManager.getDefaultIndex().get(actionName.toLowerCase());
  }

  /**
   * Get the engine-default activation mode for an action ('delayed_press', 'tap', 'press', etc.).
   */
  public static getDefaultActivationMode(actionName: string): string | undefined {
    return CatalogManager.getActionEntry(actionName)?.defaultActivationMode;
  }

  /**
   * Get the inherent multiTap count for an action (1 for single tap/press, 2 for double tap).
   */
  public static getDefaultMultiTap(actionName: string): number | undefined {
    return CatalogManager.getActionEntry(actionName)?.defaultMultiTap;
  }

  /**
   * Get the Master Flight Mode ('SCM' | 'NAV') if the action is exclusive to one.
   */
  public static getMasterFlightMode(actionName: string): 'SCM' | 'NAV' | undefined {
    return CatalogManager.getActionEntry(actionName)?.masterFlightMode;
  }

  /**
   * Instance lookup for action definition.
   */
  public getActionEntry(actionName: string): ActionCatalogEntry | undefined {
    if (this.catalog === MASTER_ACTION_CATALOG) {
      return CatalogManager.getActionEntry(actionName);
    }
    if (!this.instanceIndex) {
      this.instanceIndex = new Map();
      for (const mapCatalog of Object.values(this.catalog)) {
        for (const action of mapCatalog.actions) {
          this.instanceIndex.set(action.name.toLowerCase(), action);
        }
      }
    }
    return this.instanceIndex.get(actionName.toLowerCase());
  }

  public getDefaultActivationMode(actionName: string): string | undefined {
    return this.getActionEntry(actionName)?.defaultActivationMode;
  }

  public getDefaultMultiTap(actionName: string): number | undefined {
    return this.getActionEntry(actionName)?.defaultMultiTap;
  }

  public getMasterFlightMode(actionName: string): 'SCM' | 'NAV' | undefined {
    return this.getActionEntry(actionName)?.masterFlightMode;
  }

  /**
   * Return the active master action catalog.
   */
  public getCatalog(): MasterActionCatalog {
    return this.catalog;
  }

  /**
   * Get an ActionMap by programmatic name (e.g. 'spaceship_movement').
   */
  public getActionMap(mapName: string): ActionMapCatalog | undefined {
    return this.catalog[mapName.toLowerCase()];
  }

  /**
   * Get all ActionMaps in the catalog.
   */
  public getAllActionMaps(): ActionMapCatalog[] {
    return Object.values(this.catalog);
  }

  /**
   * Get a flat list of all actions across all ActionMaps in the catalog.
   */
  public getAllActions(): Array<{
    mapName: string;
    mapLabel: string;
    domain: string;
    action: ActionCatalogEntry;
  }> {
    const list: Array<{
      mapName: string;
      mapLabel: string;
      domain: string;
      action: ActionCatalogEntry;
    }> = [];

    for (const group of Object.values(this.catalog)) {
      for (const action of group.actions) {
        list.push({
          mapName: group.mapName,
          mapLabel: group.label,
          domain: group.domain,
          action
        });
      }
    }

    return list;
  }

  /**
   * Search actions by name, label, category, or description.
   */
  public search(
    query: string,
    mapFilter?: string
  ): Array<{
    mapName: string;
    mapLabel: string;
    action: ActionCatalogEntry;
  }> {
    const q = query.toLowerCase().trim();
    const results: Array<{
      mapName: string;
      mapLabel: string;
      action: ActionCatalogEntry;
    }> = [];

    for (const group of Object.values(this.catalog)) {
      if (mapFilter && mapFilter !== 'all' && group.mapName.toLowerCase() !== mapFilter.toLowerCase()) {
        continue;
      }

      for (const action of group.actions) {
        const matches =
          !q ||
          action.name.toLowerCase().includes(q) ||
          action.label.toLowerCase().includes(q) ||
          (action.category && action.category.toLowerCase().includes(q)) ||
          (action.description && action.description.toLowerCase().includes(q)) ||
          group.mapName.toLowerCase().includes(q) ||
          group.label.toLowerCase().includes(q);

        if (matches) {
          results.push({
            mapName: group.mapName,
            mapLabel: group.label,
            action
          });
        }
      }
    }

    return results;
  }

  /**
   * Identify all actions in the catalog that are unbound in the given ActionMapsDocument.
   */
  public getUnboundActions(
    doc: ActionMapsDocument,
    mapFilter?: string
  ): UnboundActionItem[] {
    const unbound: UnboundActionItem[] = [];

    for (const group of Object.values(this.catalog)) {
      if (mapFilter && mapFilter !== 'all' && group.mapName.toLowerCase() !== mapFilter.toLowerCase()) {
        continue;
      }

      const activeGroup = doc.actionMaps[group.mapName];

      for (const action of group.actions) {
        const boundAction = activeGroup?.actions[action.name];
        const physicalInputs = (boundAction?.inputs || []).filter(
          i => i.input && !i.input.trim().endsWith('_') && i.hardwareKey && i.hardwareKey.trim() !== '' && i.input.trim().toLowerCase() !== 'none'
        );
        const isBound = physicalInputs.length > 0;

        if (!isBound) {
          unbound.push({
            mapName: group.mapName,
            mapLabel: group.label,
            actionName: action.name,
            actionLabel: action.label,
            category: action.category,
            description: action.description,
            isBound: false
          });
        }
      }
    }

    return unbound;
  }

  /**
   * Helper to construct a clean ActionBinding model.
   */
  public createActionBinding(
    name: string,
    label?: string,
    inputs: BindingInput[] = []
  ): ActionBinding {
    return {
      name,
      label,
      inputs
    };
  }
}
