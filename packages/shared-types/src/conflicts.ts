/**
 * Conflict Detection Engine types and severity spectrum
 */

export enum ConflictSeverity {
  None = 0,
  Warning = 1, // Latency penalty (e.g. double_tap vs press) or non-destructive soft overlap
  Fatal = 2    // Concurrent execution on same tick / hard event collision
}

export type MasterFlightMode = 'SCM' | 'NAV' | 'ANY';

export interface ConflictDetails {
  severity: ConflictSeverity;
  sourceContext: string;
  sourceAction: string;
  targetContext: string;
  targetAction: string;
  sharedInput: string;
  reason: string;
  recommendation?: string;
}

export interface ConflictReport {
  hasFatalConflicts: boolean;
  warningCount: number;
  fatalCount: number;
  conflicts: ConflictDetails[];
}
