/**
 * Conflict Detection Engine types and severity spectrum
 */

export enum ConflictSeverity {
  None = 0,
  Warning = 1,   // Latency penalty (e.g. double_tap vs press) or non-destructive soft overlap
  Fatal = 2,     // Concurrent execution on same tick / hard event collision
  Redundant = 3  // Subsumed actions (e.g. v_flightready + v_power_set_on) or deprecated actions in current game version
}

export type MasterFlightMode = 'SCM' | 'NAV' | 'ANY';

export type ConflictType = 'collision' | 'latency' | 'redundancy' | 'deprecated' | 'obsolete_collision';

export interface ConflictDetails {
  severity: ConflictSeverity;
  sourceContext: string;
  sourceAction: string;
  targetContext: string;
  targetAction: string;
  sharedInput: string;
  reason: string;
  recommendation?: string;
  conflictType?: ConflictType;
  /** Name of the deprecated/obsolete action if this collision was caused by legacy bindings */
  deprecatedAction?: string;
  /** Action that is the primary root-cause of the conflict */
  rootCauseAction?: string;
}

export interface ConflictReport {
  hasFatalConflicts: boolean;
  warningCount: number;
  fatalCount: number;
  redundantCount: number;
  conflicts: ConflictDetails[];
}
