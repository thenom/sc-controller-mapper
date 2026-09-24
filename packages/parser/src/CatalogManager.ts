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
  private catalog: MasterActionCatalog;

  constructor(customCatalog?: MasterActionCatalog) {
    this.catalog = customCatalog || MASTER_ACTION_CATALOG;
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
