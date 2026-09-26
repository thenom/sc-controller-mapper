/**
 * Action Catalog Interfaces
 * Represents the comprehensive universe of actions available in Star Citizen,
 * including actions that are currently unbound in a user's sparse XML profile.
 */

export interface ActionCatalogEntry {
  /** Internal programmatic action identifier (e.g. 'v_pitch', 'v_eject', 'v_ping') */
  name: string;
  /** Human-readable display label (e.g. 'Pitch', 'Eject', 'Radar Ping') */
  label: string;
  /** Category or subsystem group (e.g. 'Flight', 'Weapons', 'Targeting', 'Industrial') */
  category?: string;
  /** Detailed description or tooltip */
  description?: string;
  /** Default activation mode if known ('press', 'hold', 'delayed_press', 'tap', 'double_tap') */
  defaultActivationMode?: string;
  /** Inherent multiTap count if known (e.g. 1 for single tap/press, 2 for double tap) */
  defaultMultiTap?: number;
  /** Whether this action is exclusive to a specific flight mode (e.g. 'SCM' or 'NAV') */
  masterFlightMode?: 'SCM' | 'NAV';
}

export interface ActionMapCatalog {
  /** Action map identifier (e.g. 'spaceship_movement', 'spaceship_weapons') */
  mapName: string;
  /** Human-readable display label (e.g. 'Spaceship Movement', 'Ship Weapons') */
  label: string;
  /** Operational domain (e.g. 'spaceship', 'ground_vehicle', 'onfoot', 'turret') */
  domain: string;
  /** Actions available under this action map */
  actions: ActionCatalogEntry[];
}

export type MasterActionCatalog = Record<string, ActionMapCatalog>;

export interface UnboundActionItem {
  mapName: string;
  mapLabel: string;
  actionName: string;
  actionLabel: string;
  category?: string;
  description?: string;
  isBound: boolean;
}
