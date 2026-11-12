import { useEffect, useRef, useState, useCallback } from 'react';
import {
  ActionMapsParser,
  ActionMapsExporter,
  CatalogManager
} from '@sc-mapping/parser';
import {
  ConflictResolver,
  ConflictSeverity
} from '@sc-mapping/resolver';
import type {
  ActionMapsDocument,
  ActionBinding,
  BindingInput,
  ConflictDetails,
  ConflictReport,
  JoystickDeviceOption,
  ActivationMode,
  BindType
} from '@sc-mapping/shared-types';

export interface WebMCPJsonSchema {
  type: 'object';
  properties: Record<string, {
    type: string;
    description?: string;
    enum?: string[];
    default?: unknown;
    items?: Record<string, unknown>;
  }>;
  required?: string[];
  additionalProperties?: boolean;
}

export interface WebMCPToolDefinition<TInput = any, TOutput = unknown> {
  name: string;
  title?: string;
  description: string;
  inputSchema: WebMCPJsonSchema;
  readOnlyHint?: boolean;
  execute: (input: TInput) => Promise<TOutput> | TOutput;
}

export interface ModelContextContainer {
  registerTool: (tool: WebMCPToolDefinition<any, any>, options?: Record<string, unknown>) => Promise<void> | void;
  unregisterTool?: (name: string) => Promise<void> | void;
  getTools: () => WebMCPToolDefinition<any, any>[];
  executeTool: (name: string, input?: Record<string, any>) => Promise<unknown>;
  provideContext?: (context: { tools: WebMCPToolDefinition<any, any>[] }) => Promise<void> | void;
  __isPolyfill?: boolean;
}

declare global {
  interface Document {
    modelContext?: ModelContextContainer;
  }
  interface Navigator {
    modelContext?: ModelContextContainer;
  }
}

export interface UseWebMCPOptions {
  doc: ActionMapsDocument | null;
  activePreset: string;
  gameVersion: string;
  gameBranch: string;
  gameBuildDate: string;
  suiteVersion: string;
  hardwareMapping: Map<number, number>;
  conflictReport: ConflictReport | null;
  deviceScope: string;
  activeTab: 'matrix' | 'inspector' | 'conflicts';
  searchQuery: string;
  onSetActiveTab: (tab: 'matrix' | 'inspector' | 'conflicts') => void;
  onSetSearchQuery: (query: string) => void;
  onSetDeviceScope: (scope: string) => void;
  onSetHardwareMapping: (mapping: Map<number, number>) => void;
  onApplyDeviceOptions: (device: JoystickDeviceOption) => void;
  onSaveActionInputs: (mapName: string, actionName: string, inputs: BindingInput[], label?: string) => void;
  onAutoFixConflict: (conflict: ConflictDetails) => void;
  onLoadSamplePreset: (fileName: string, presetName: string) => Promise<void>;
}

/**
 * Ensures `document.modelContext` and `navigator.modelContext` exist with a unified
 * registry and execution bridge for W3C WebMCP browser AI agents and E2E testing.
 */
export function ensureModelContextHost(): ModelContextContainer {
  const toolRegistry = new Map<string, WebMCPToolDefinition<any, any>>();

  const existingDocCtx = typeof document !== 'undefined' ? document.modelContext : undefined;
  const existingNavCtx = typeof navigator !== 'undefined' ? navigator.modelContext : undefined;

  if (existingDocCtx && typeof existingDocCtx.getTools === 'function' && typeof existingDocCtx.executeTool === 'function') {
    return existingDocCtx;
  }

  const wrapForNativeMcp = (tool: WebMCPToolDefinition<any, any>): WebMCPToolDefinition<any, any> => ({
    ...tool,
    async execute(input: any) {
      const res = await tool.execute(input);
      if (res && typeof res === 'object' && 'content' in (res as Record<string, unknown>)) {
        return res;
      }
      return {
        ...(typeof res === 'object' && res !== null ? res : { result: res }),
        content: [
          {
            type: 'text',
            text: JSON.stringify(res, null, 2)
          }
        ]
      };
    }
  });

  const container: ModelContextContainer = {
    __isPolyfill: !existingDocCtx && !existingNavCtx,
    async registerTool(tool: WebMCPToolDefinition<any, any>, options?: Record<string, unknown>) {
      if (!tool || !tool.name || typeof tool.execute !== 'function') {
        throw new Error('Invalid WebMCP tool definition: name and execute() are required');
      }
      toolRegistry.set(tool.name, tool);
      const nativeTool = wrapForNativeMcp(tool);
      if (existingDocCtx && existingDocCtx !== container && typeof existingDocCtx.registerTool === 'function') {
        try {
          await existingDocCtx.registerTool(nativeTool, options);
        } catch {
          // Ignore duplicate native registration errors on hot-reload
        }
      }
      if (existingNavCtx && existingNavCtx !== container && typeof existingNavCtx.registerTool === 'function') {
        try {
          await existingNavCtx.registerTool(nativeTool, options);
        } catch {
          // Ignore duplicate native registration errors on hot-reload
        }
      }
    },
    async unregisterTool(name: string) {
      toolRegistry.delete(name);
      if (existingDocCtx && existingDocCtx !== container && typeof existingDocCtx.unregisterTool === 'function') {
        try {
          await existingDocCtx.unregisterTool(name);
        } catch {
          // Ignore if already unregistered
        }
      }
      if (existingNavCtx && existingNavCtx !== container && typeof existingNavCtx.unregisterTool === 'function') {
        try {
          await existingNavCtx.unregisterTool(name);
        } catch {
          // Ignore if already unregistered
        }
      }
    },
    getTools() {
      return Array.from(toolRegistry.values());
    },
    async executeTool(name: string, input: Record<string, any> = {}) {
      const tool = toolRegistry.get(name);
      if (!tool) {
        throw new Error(`WebMCP tool not found: '${name}'`);
      }
      return await tool.execute(input || {});
    },
    async provideContext(ctx: { tools: WebMCPToolDefinition<any, any>[] }) {
      toolRegistry.clear();
      for (const tool of ctx.tools || []) {
        await container.registerTool(tool);
      }
    }
  };

  if (typeof document !== 'undefined') {
    try {
      document.modelContext = container;
    } catch {
      Object.defineProperty(document, 'modelContext', {
        value: container,
        configurable: true,
        writable: true
      });
    }
  }

  if (typeof navigator !== 'undefined') {
    try {
      if (!navigator.modelContext) {
        Object.defineProperty(navigator, 'modelContext', {
          value: container,
          configurable: true,
          writable: true
        });
      }
    } catch {
      // Ignore read-only navigator environments
    }
  }

  return container;
}

const severityLabel = (sev: ConflictSeverity): string => {
  switch (sev) {
    case ConflictSeverity.Fatal:
      return 'Fatal';
    case ConflictSeverity.Warning:
      return 'Warning';
    case ConflictSeverity.Redundant:
      return 'Redundant';
    default:
      return 'None';
  }
};

export function useWebMCP(options: UseWebMCPOptions) {
  const stateRef = useRef<UseWebMCPOptions>(options);
  stateRef.current = options;

  const [registeredTools, setRegisteredTools] = useState<WebMCPToolDefinition[]>([]);
  const [isNativeSupport, setIsNativeSupport] = useState<boolean>(false);
  const [lastToolCall, setLastToolCall] = useState<{
    toolName: string;
    timestamp: string;
    status: 'ok' | 'error';
  } | null>(null);

  const buildTools = useCallback((): WebMCPToolDefinition[] => {
    const wrapExecute = <TIn, TOut>(
      toolName: string,
      fn: (input: TIn) => Promise<TOut> | TOut
    ) => {
      return async (input: TIn): Promise<TOut> => {
        try {
          const result = await fn(input);
          setLastToolCall({
            toolName,
            timestamp: new Date().toISOString(),
            status: 'ok'
          });
          return result;
        } catch (err) {
          setLastToolCall({
            toolName,
            timestamp: new Date().toISOString(),
            status: 'error'
          });
          throw err;
        }
      };
    };

    const tools: WebMCPToolDefinition[] = [
      {
        name: 'get_profile_summary',
        title: 'Get Star Citizen Keybinding Profile Summary',
        description:
          'Returns telemetry for the currently loaded Star Citizen keybinding profile, including target game version, joystick devices, instance remapping table, action counts, and conflict summary.',
        readOnlyHint: true,
        inputSchema: {
          type: 'object',
          properties: {},
          additionalProperties: false
        },
        execute: wrapExecute('get_profile_summary', () => {
          const s = stateRef.current;
          const doc = s.doc;
          const joysticks = doc
            ? doc.devices.filter((d): d is JoystickDeviceOption => d.type === 'joystick')
            : [];

          let totalActions = 0;
          let boundActions = 0;
          if (doc) {
            for (const mapGroup of Object.values(doc.actionMaps)) {
              for (const act of Object.values(mapGroup.actions)) {
                totalActions++;
                if (act.inputs.some(inp => inp.input.trim() !== '')) {
                  boundActions++;
                }
              }
            }
          }

          const remapEntries: Record<string, string> = {};
          s.hardwareMapping.forEach((targetInst, sourceInst) => {
            remapEntries[`js${sourceInst}`] = `js${targetInst}`;
          });

          return {
            profileLoaded: Boolean(doc),
            profileName: doc?.profileName ?? null,
            activePreset: s.activePreset,
            suiteVersion: s.suiteVersion,
            targetGame: {
              branch: s.gameBranch,
              version: s.gameVersion,
              buildDate: s.gameBuildDate
            },
            uiState: {
              activeTab: s.activeTab,
              searchQuery: s.searchQuery,
              deviceScope: s.deviceScope
            },
            metrics: {
              actionMapCount: doc ? Object.keys(doc.actionMaps).length : 0,
              totalActionsInProfile: totalActions,
              boundActionsCount: boundActions
            },
            joystickDevices: joysticks.map(j => ({
              instance: j.instance,
              prefix: `js${j.instance}`,
              exportPrefix: `js${s.hardwareMapping.get(j.instance) ?? j.instance}`,
              productName: j.productName,
              productGuid: j.productGuid ?? null,
              inversions: j.inversions,
              deadzones: j.deadzones ?? {},
              sensitivities: j.sensitivities ?? {}
            })),
            hardwareRemapping: remapEntries,
            conflictSummary: {
              deviceScope: s.deviceScope,
              hasFatalConflicts: s.conflictReport?.hasFatalConflicts ?? false,
              totalConflicts: s.conflictReport?.conflicts.length ?? 0,
              fatalCount: s.conflictReport?.fatalCount ?? 0,
              warningCount: s.conflictReport?.warningCount ?? 0,
              redundantCount: s.conflictReport?.redundantCount ?? 0
            }
          };
        })
      },
      {
        name: 'audit_conflicts',
        title: 'Audit Keybinding Conflicts',
        description:
          'Runs the Star Citizen Temporal & Contextual Conflict Resolver on the active profile. Distinguishes between mutually exclusive domains/Master Modes (SCM vs NAV) and real Fatal collisions, Warning latencies, or Redundant/Obsolete bindings.',
        readOnlyHint: true,
        inputSchema: {
          type: 'object',
          properties: {
            deviceScope: {
              type: 'string',
              description: "Hardware filter scope: 'js' (joysticks only), 'kb' (keyboard/mouse), or 'all'.",
              enum: ['js', 'kb', 'all']
            },
            severity: {
              type: 'string',
              description: "Filter returned conflicts by severity tier: 'Fatal', 'Warning', 'Redundant', or 'all'.",
              enum: ['Fatal', 'Warning', 'Redundant', 'all']
            },
            limit: {
              type: 'number',
              description: 'Maximum number of conflict records to return (default 50).'
            }
          },
          additionalProperties: false
        },
        execute: wrapExecute('audit_conflicts', (input: {
          deviceScope?: string;
          severity?: string;
          limit?: number;
        }) => {
          const s = stateRef.current;
          if (!s.doc) {
            return { error: 'No keybinding profile is currently loaded.' };
          }

          const scope = input.deviceScope || s.deviceScope || 'js';
          const report = ConflictResolver.auditDocument(s.doc, { deviceFilter: scope });
          const maxItems = typeof input.limit === 'number' && input.limit > 0 ? input.limit : 50;

          const filtered = report.conflicts.filter(c => {
            if (!input.severity || input.severity === 'all') return true;
            return severityLabel(c.severity).toLowerCase() === input.severity.toLowerCase();
          });

          return {
            deviceScope: scope,
            hasFatalConflicts: report.hasFatalConflicts,
            counts: {
              total: report.conflicts.length,
              fatal: report.fatalCount,
              warning: report.warningCount,
              redundant: report.redundantCount,
              returned: Math.min(filtered.length, maxItems)
            },
            conflicts: filtered.slice(0, maxItems).map(c => ({
              severity: severityLabel(c.severity),
              conflictType: c.conflictType ?? 'collision',
              sharedInput: c.sharedInput,
              sourceContext: c.sourceContext,
              sourceAction: c.sourceAction,
              targetContext: c.targetContext,
              targetAction: c.targetAction,
              reason: c.reason,
              recommendation: c.recommendation ?? null,
              deprecatedAction: c.deprecatedAction ?? null
            }))
          };
        })
      },
      {
        name: 'search_bindings_and_catalog',
        title: 'Search Keybindings & Star Citizen Action Catalog',
        description:
          'Searches across all 50 Star Citizen action maps in both the loaded XML profile and the canonical Data.p4k catalog by keyword, action name, physical input (e.g. js1_button4), actionMap, or Master Flight Mode (SCM/NAV).',
        readOnlyHint: true,
        inputSchema: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description: 'Search term matching action name, localized label, description, or input string (e.g. "eject", "v_pitch", "js1_button5").'
            },
            mapName: {
              type: 'string',
              description: 'Optional case-insensitive ActionMap filter (e.g. "spaceship_movement", "spaceship_mining").'
            },
            masterFlightMode: {
              type: 'string',
              description: "Optional Master Flight Mode filter ('SCM' or 'NAV').",
              enum: ['SCM', 'NAV']
            },
            bindingState: {
              type: 'string',
              description: "Filter by whether the action is currently bound in the profile: 'bound', 'unbound', or 'all' (default 'all').",
              enum: ['bound', 'unbound', 'all']
            },
            limit: {
              type: 'number',
              description: 'Maximum results to return (default 40).'
            }
          },
          additionalProperties: false
        },
        execute: wrapExecute('search_bindings_and_catalog', (input: {
          query?: string;
          mapName?: string;
          masterFlightMode?: 'SCM' | 'NAV';
          bindingState?: 'bound' | 'unbound' | 'all';
          limit?: number;
        }) => {
          const s = stateRef.current;
          const doc = s.doc;
          const catalog = new CatalogManager();
          const q = (input.query || '').trim().toLowerCase();
          const mapFilter = (input.mapName || '').trim().toLowerCase();
          const stateFilter = input.bindingState || 'all';
          const limit = typeof input.limit === 'number' && input.limit > 0 ? input.limit : 40;

          const results: Array<{
            mapName: string;
            mapLabel: string;
            domain: string;
            actionName: string;
            label: string;
            defaultActivationMode?: string;
            defaultMultiTap?: number;
            masterFlightMode?: 'SCM' | 'NAV';
            isBound: boolean;
            inputs: BindingInput[];
          }> = [];

          const seenKeys = new Set<string>();

          // 1. Scan canonical catalog maps and merge with active profile bindings
          for (const mapCatalog of catalog.getAllActionMaps()) {
            if (mapFilter && mapCatalog.mapName.toLowerCase() !== mapFilter) {
              continue;
            }
            const docMap = doc
              ? Object.values(doc.actionMaps).find(
                  m => m.name.toLowerCase() === mapCatalog.mapName.toLowerCase()
                )
              : undefined;

            for (const catAction of mapCatalog.actions) {
              if (input.masterFlightMode && catAction.masterFlightMode !== input.masterFlightMode) {
                continue;
              }
              const docAction = docMap
                ? Object.values(docMap.actions).find(
                    a => a.name.toLowerCase() === catAction.name.toLowerCase()
                  )
                : undefined;

              const activeInputs = (docAction?.inputs || []).filter(i => i.input.trim() !== '');
              const isBound = activeInputs.length > 0;

              if (stateFilter === 'bound' && !isBound) continue;
              if (stateFilter === 'unbound' && isBound) continue;

              const matchText = [
                catAction.name,
                catAction.label,
                catAction.description || '',
                mapCatalog.mapName,
                mapCatalog.label,
                ...activeInputs.map(i => i.input)
              ]
                .join(' ')
                .toLowerCase();

              if (q && !matchText.includes(q)) continue;

              seenKeys.add(`${mapCatalog.mapName.toLowerCase()}::${catAction.name.toLowerCase()}`);
              results.push({
                mapName: docMap?.name || mapCatalog.mapName,
                mapLabel: mapCatalog.label,
                domain: mapCatalog.domain,
                actionName: docAction?.name || catAction.name,
                label: docAction?.label || catAction.label,
                defaultActivationMode: catAction.defaultActivationMode,
                defaultMultiTap: catAction.defaultMultiTap,
                masterFlightMode: catAction.masterFlightMode,
                isBound,
                inputs: docAction?.inputs || []
              });

              if (results.length >= limit) break;
            }
            if (results.length >= limit) break;
          }

          // 2. Also include custom profile actions not present in the base catalog
          if (doc && results.length < limit) {
            for (const docMap of Object.values(doc.actionMaps)) {
              if (mapFilter && docMap.name.toLowerCase() !== mapFilter) continue;
              for (const docAction of Object.values(docMap.actions)) {
                const key = `${docMap.name.toLowerCase()}::${docAction.name.toLowerCase()}`;
                if (seenKeys.has(key)) continue;

                const activeInputs = docAction.inputs.filter(i => i.input.trim() !== '');
                const isBound = activeInputs.length > 0;
                if (stateFilter === 'bound' && !isBound) continue;
                if (stateFilter === 'unbound' && isBound) continue;

                const matchText = [
                  docAction.name,
                  docAction.label || '',
                  docMap.name,
                  ...activeInputs.map(i => i.input)
                ]
                  .join(' ')
                  .toLowerCase();

                if (q && !matchText.includes(q)) continue;

                results.push({
                  mapName: docMap.name,
                  mapLabel: docMap.label || docMap.name,
                  domain: 'custom',
                  actionName: docAction.name,
                  label: docAction.label || docAction.name,
                  defaultActivationMode: CatalogManager.getDefaultActivationMode(docAction.name),
                  defaultMultiTap: CatalogManager.getDefaultMultiTap(docAction.name),
                  masterFlightMode: CatalogManager.getMasterFlightMode(docAction.name),
                  isBound,
                  inputs: docAction.inputs
                });

                if (results.length >= limit) break;
              }
              if (results.length >= limit) break;
            }
          }

          return {
            totalReturned: results.length,
            results
          };
        })
      },
      {
        name: 'find_unused_joystick_inputs',
        title: 'Find Unused Joystick Buttons & Axes',
        description:
          'Inspects a specific joystick instance (e.g. js1, js2) and lists physical buttons, hats, and axes that are currently unbound across the profile (or within a specific ActionMap).',
        readOnlyHint: true,
        inputSchema: {
          type: 'object',
          properties: {
            deviceInstance: {
              type: 'number',
              description: '1-based joystick instance number (e.g. 1 for js1, 2 for js2).'
            },
            maxButtons: {
              type: 'number',
              description: 'Total button count on the physical stick to check (default 32).'
            },
            mapName: {
              type: 'string',
              description: 'Optional ActionMap name to scope used/unused check to a single operational context.'
            }
          },
          required: ['deviceInstance'],
          additionalProperties: false
        },
        execute: wrapExecute('find_unused_joystick_inputs', (input: {
          deviceInstance: number;
          maxButtons?: number;
          mapName?: string;
        }) => {
          const s = stateRef.current;
          if (!s.doc) {
            return { error: 'No keybinding profile is currently loaded.' };
          }
          const inst = Number(input.deviceInstance) || 1;
          const prefix = `js${inst}`;
          const maxButtons = Math.min(Math.max(Number(input.maxButtons) || 32, 1), 128);
          const mapScope = (input.mapName || '').trim().toLowerCase();

          const usedHardwareKeys = new Map<string, Array<{ mapName: string; actionName: string; input: string }>>();

          for (const mapGroup of Object.values(s.doc.actionMaps)) {
            if (mapScope && mapGroup.name.toLowerCase() !== mapScope) continue;
            for (const act of Object.values(mapGroup.actions)) {
              for (const inp of act.inputs) {
                if (inp.devicePrefix.toLowerCase() === prefix.toLowerCase() && inp.hardwareKey) {
                  const hwKey = inp.hardwareKey.toLowerCase();
                  const list = usedHardwareKeys.get(hwKey) || [];
                  list.push({
                    mapName: mapGroup.name,
                    actionName: act.name,
                    input: inp.input
                  });
                  usedHardwareKeys.set(hwKey, list);
                }
              }
            }
          }

          const unusedButtons: string[] = [];
          const usedButtons: Array<{ input: string; bindings: Array<{ mapName: string; actionName: string; input: string }> }> = [];

          for (let b = 1; b <= maxButtons; b++) {
            const key = `button${b}`;
            const fullInput = `${prefix}_${key}`;
            const bindings = usedHardwareKeys.get(key);
            if (!bindings || bindings.length === 0) {
              unusedButtons.push(fullInput);
            } else {
              usedButtons.push({ input: fullInput, bindings });
            }
          }

          const standardAxes = ['x', 'y', 'z', 'rotx', 'roty', 'rotz', 'slider1', 'slider2'];
          const unusedAxes = standardAxes
            .filter(ax => !usedHardwareKeys.has(ax))
            .map(ax => `${prefix}_${ax}`);

          return {
            devicePrefix: prefix,
            scope: mapScope || 'entire_profile',
            unusedButtonCount: unusedButtons.length,
            unusedButtons,
            unusedAxes,
            usedButtonCount: usedButtons.length,
            usedButtons
          };
        })
      },
      {
        name: 'set_action_binding',
        title: 'Set or Clear Action Keybinding Inputs',
        description:
          'Updates the <rebind> and <addbind> inputs for a Star Citizen action in the loaded profile. Passing an empty inputs array clears the binding (producing an explicit <rebind input=""/> unbind node on XML export so Star Citizen does not revert to defaultProfile.xml).',
        inputSchema: {
          type: 'object',
          properties: {
            mapName: {
              type: 'string',
              description: 'ActionMap name (e.g. "spaceship_movement", "spaceship_weapons").'
            },
            actionName: {
              type: 'string',
              description: 'Programmatic action name (e.g. "v_pitch", "v_eject", "v_toggle_mining_mode").'
            },
            inputs: {
              type: 'array',
              description:
                'Array of binding descriptors. First item defaults to bindType "rebind", subsequent items default to "addbind". Pass [] to unbind.',
              items: {
                type: 'object',
                properties: {
                  input: {
                    type: 'string',
                    description: 'CryEngine input code (e.g. "js1_button5", "lalt+js2_button3", "kb1_space").'
                  },
                  bindType: {
                    type: 'string',
                    enum: ['rebind', 'addbind']
                  },
                  activationMode: {
                    type: 'string',
                    enum: ['press', 'hold', 'double_tap', 'delayed_press', 'smart_toggle']
                  },
                  multiTap: {
                    type: 'number',
                    description: 'Optional tap count (e.g. 2 for double-tap).'
                  }
                }
              }
            }
          },
          required: ['mapName', 'actionName', 'inputs'],
          additionalProperties: false
        },
        execute: wrapExecute('set_action_binding', (input: {
          mapName: string;
          actionName: string;
          inputs: Array<{
            input: string;
            bindType?: BindType;
            activationMode?: ActivationMode;
            multiTap?: number;
          }>;
        }) => {
          const s = stateRef.current;
          if (!s.doc) {
            throw new Error('No keybinding profile is currently loaded.');
          }
          if (!input.mapName || !input.actionName) {
            throw new Error('Both mapName and actionName are required.');
          }

          const rawList = Array.isArray(input.inputs) ? input.inputs : [];
          const normalizedInputs: BindingInput[] = rawList
            .filter(item => item && typeof item.input === 'string' && item.input.trim() !== '')
            .map((item, idx) => {
              const bindType: BindType = item.bindType || (idx === 0 ? 'rebind' : 'addbind');
              const parsed = ActionMapsParser.parseInputDescriptor(item.input.trim(), bindType);
              return {
                ...parsed,
                activationMode: item.activationMode,
                multiTap: item.multiTap && item.multiTap > 1 ? item.multiTap : undefined
              };
            });

          const catEntry = CatalogManager.getActionEntry(input.actionName);
          s.onSaveActionInputs(input.mapName, input.actionName, normalizedInputs, catEntry?.label);

          // Evaluate immediate conflicts for the newly bound action against the current document
          const candidateAction: ActionBinding = {
            name: input.actionName,
            label: catEntry?.label,
            inputs: normalizedInputs
          };

          const detectedConflicts: Array<{
            severity: string;
            targetContext: string;
            targetAction: string;
            sharedInput: string;
            reason: string;
          }> = [];

          for (const mapGroup of Object.values(s.doc.actionMaps)) {
            for (const otherAction of Object.values(mapGroup.actions)) {
              if (
                mapGroup.name.toLowerCase() === input.mapName.toLowerCase() &&
                otherAction.name.toLowerCase() === input.actionName.toLowerCase()
              ) {
                continue;
              }
              const evaluation = ConflictResolver.evaluateActions(
                input.mapName,
                candidateAction,
                mapGroup.name,
                otherAction
              );
              if (evaluation.severity !== ConflictSeverity.None) {
                detectedConflicts.push({
                  severity: severityLabel(evaluation.severity),
                  targetContext: evaluation.targetContext,
                  targetAction: evaluation.targetAction,
                  sharedInput: evaluation.sharedInput,
                  reason: evaluation.reason
                });
              }
            }
          }

          return {
            status: 'updated',
            mapName: input.mapName,
            actionName: input.actionName,
            label: catEntry?.label ?? input.actionName,
            unbindEmittedOnExport: normalizedInputs.length === 0,
            inputs: normalizedInputs,
            conflictsWithNewBinding: detectedConflicts
          };
        })
      },
      {
        name: 'auto_fix_obsolete_conflicts',
        title: 'Auto-Fix Obsolete Star Citizen Collisions',
        description:
          'Automatically strips deprecated legacy bindings (Rule R2 obsolete_collision, such as removed 3.x cruise control or quantum toggles) that collide with modern actions.',
        inputSchema: {
          type: 'object',
          properties: {
            deprecatedActionName: {
              type: 'string',
              description: 'Optional specific deprecated action name to strip. If omitted, fixes all obsolete_collision entries in the profile.'
            }
          },
          additionalProperties: false
        },
        execute: wrapExecute('auto_fix_obsolete_conflicts', (input: { deprecatedActionName?: string }) => {
          const s = stateRef.current;
          if (!s.doc) {
            throw new Error('No keybinding profile is currently loaded.');
          }

          const report = ConflictResolver.auditDocument(s.doc, { deviceFilter: 'all' });
          const targetFilter = (input.deprecatedActionName || '').trim().toLowerCase();

          const fixable = report.conflicts.filter(c => {
            if (!c.deprecatedAction) return false;
            if (!targetFilter) return true;
            return c.deprecatedAction.toLowerCase().includes(targetFilter);
          });

          for (const conflict of fixable) {
            s.onAutoFixConflict(conflict);
          }

          return {
            fixedCount: fixable.length,
            fixedConflicts: fixable.map(c => ({
              deprecatedAction: c.deprecatedAction,
              sharedInput: c.sharedInput,
              collidedWith: `${c.targetContext}.${c.targetAction}`
            }))
          };
        })
      },
      {
        name: 'remap_joystick_instances',
        title: 'Re-Index Joystick Hardware Instances (Bypass 4-Device Limit)',
        description:
          'Updates the joystick instance remapping table (js1..js8+) used when exporting XML, bypassing Star Citizen pp_resortdevices 4-device ceiling.',
        inputSchema: {
          type: 'object',
          properties: {
            mapping: {
              type: 'object',
              description:
                'Map of current 1-based joystick instance numbers to target 1-based instance numbers (e.g. { "1": 2, "2": 1 }).'
            },
            reset: {
              type: 'boolean',
              description: 'If true, resets all joystick instances back to identity (js1 -> js1, js2 -> js2).'
            }
          },
          additionalProperties: false
        },
        execute: wrapExecute('remap_joystick_instances', (input: {
          mapping?: Record<string, number>;
          reset?: boolean;
        }) => {
          const s = stateRef.current;
          const nextMap = new Map<number, number>();

          if (s.doc) {
            for (const dev of s.doc.devices) {
              if (dev.type === 'joystick') {
                nextMap.set(dev.instance, dev.instance);
              }
            }
          }

          if (!input.reset && input.mapping) {
            for (const [srcKey, targetVal] of Object.entries(input.mapping)) {
              const srcNum = parseInt(srcKey.replace(/^js/i, ''), 10);
              const dstNum = Number(targetVal);
              if (!Number.isNaN(srcNum) && !Number.isNaN(dstNum) && srcNum >= 1 && dstNum >= 1) {
                nextMap.set(srcNum, dstNum);
              }
            }
          }

          s.onSetHardwareMapping(nextMap);

          const applied: Record<string, string> = {};
          nextMap.forEach((dst, src) => {
            applied[`js${src}`] = `js${dst}`;
          });

          return {
            status: input.reset ? 'reset' : 'remapped',
            hardwareMapping: applied
          };
        })
      },
      {
        name: 'configure_joystick_options',
        title: 'Configure Joystick Options (Inversions, Deadzones, Sensitivities)',
        description:
          'Adds or updates an <options type="joystick"> hardware configuration block for a 1-based joystick instance, preserving axis inversions, deadzones, sensitivities, and ProductGUID.',
        inputSchema: {
          type: 'object',
          properties: {
            instance: {
              type: 'number',
              description: '1-based joystick instance number (e.g. 1 for js1, 2 for js2).'
            },
            productName: {
              type: 'string',
              description: 'Device Product name (e.g. "VKBsim Gladiator EVO R").'
            },
            productGuid: {
              type: 'string',
              description: 'Optional DirectInput ProductGUID.'
            },
            inversions: {
              type: 'object',
              description: 'Axis inversion booleans (e.g. { "pitch": true, "flight_move_strafe_longitudinal": true }).'
            },
            deadzones: {
              type: 'object',
              description: 'Axis deadzone numbers between 0.0 and 1.0 (e.g. { "x": 0.04, "y": 0.04 }).'
            },
            sensitivities: {
              type: 'object',
              description: 'Axis sensitivity curves/multipliers (e.g. { "pitch": 1.25 }).'
            }
          },
          required: ['instance'],
          additionalProperties: false
        },
        execute: wrapExecute('configure_joystick_options', (input: {
          instance: number;
          productName?: string;
          productGuid?: string;
          inversions?: Record<string, boolean>;
          deadzones?: Record<string, number>;
          sensitivities?: Record<string, number>;
        }) => {
          const s = stateRef.current;
          if (!s.doc) {
            throw new Error('No keybinding profile is currently loaded.');
          }
          const inst = Number(input.instance);
          if (!inst || inst < 1) {
            throw new Error('instance must be a 1-based positive integer.');
          }

          const existing = s.doc.devices.find(
            (d): d is JoystickDeviceOption => d.type === 'joystick' && d.instance === inst
          );

          const updatedDevice: JoystickDeviceOption = {
            type: 'joystick',
            instance: inst,
            productName: input.productName || existing?.productName || `Joystick ${inst}`,
            productGuid: input.productGuid ?? existing?.productGuid,
            inversions: {
              ...(existing?.inversions || {}),
              ...(input.inversions || {})
            },
            deadzones: {
              ...(existing?.deadzones || {}),
              ...(input.deadzones || {})
            },
            sensitivities: {
              ...(existing?.sensitivities || {}),
              ...(input.sensitivities || {})
            }
          };

          s.onApplyDeviceOptions(updatedDevice);

          return {
            status: 'configured',
            device: updatedDevice
          };
        })
      },
      {
        name: 'workspace_control',
        title: 'Control Cockpit UI Navigation, Presets & XML Export',
        description:
          'Navigates HUD tabs (matrix, inspector, conflicts), updates the live search filter, switches starter HOSAS/HOTAS presets, or exports the lossless CryEngine XML with all jsX_ remappings applied.',
        inputSchema: {
          type: 'object',
          properties: {
            activeTab: {
              type: 'string',
              description: "Switch the active HUD tab: 'matrix', 'inspector', or 'conflicts'.",
              enum: ['matrix', 'inspector', 'conflicts']
            },
            searchQuery: {
              type: 'string',
              description: 'Set the Keybinding Matrix search filter.'
            },
            deviceScope: {
              type: 'string',
              description: "Set the Conflict Diagnostics device scope: 'js', 'kb', or 'all'.",
              enum: ['js', 'kb', 'all']
            },
            loadPreset: {
              type: 'string',
              description: "Optional starter preset to load: 'vkb_omni', 'dual_vkb', or 'hotas_t16000m'.",
              enum: ['vkb_omni', 'dual_vkb', 'hotas_t16000m']
            },
            exportXml: {
              type: 'boolean',
              description: 'If true, serializes and returns the lossless Star Citizen ActionMaps XML string.'
            }
          },
          additionalProperties: false
        },
        execute: wrapExecute('workspace_control', async (input: {
          activeTab?: 'matrix' | 'inspector' | 'conflicts';
          searchQuery?: string;
          deviceScope?: string;
          loadPreset?: 'vkb_omni' | 'dual_vkb' | 'hotas_t16000m';
          exportXml?: boolean;
        }) => {
          const s = stateRef.current;

          if (input.loadPreset) {
            const presetMap: Record<string, { file: string; label: string }> = {
              vkb_omni: { file: 'vkb_evo_hosas_omni.xml', label: 'Dual VKB (Right + Omni Left)' },
              dual_vkb: { file: 'dual_vkb_evo_hosas.xml', label: 'Dual VKB HOSAS' },
              hotas_t16000m: { file: 'hotas_t16000m.xml', label: 'T.16000M HOTAS' }
            };
            const target = presetMap[input.loadPreset];
            if (target) {
              await s.onLoadSamplePreset(target.file, target.label);
            }
          }

          if (input.activeTab) {
            s.onSetActiveTab(input.activeTab);
          }
          if (typeof input.searchQuery === 'string') {
            s.onSetSearchQuery(input.searchQuery);
          }
          if (input.deviceScope) {
            s.onSetDeviceScope(input.deviceScope);
          }

          let exportedXml: string | undefined;
          if (input.exportXml && stateRef.current.doc) {
            exportedXml = ActionMapsExporter.exportToXML(
              stateRef.current.doc,
              stateRef.current.hardwareMapping
            );
          }

          return {
            activeTab: input.activeTab ?? s.activeTab,
            searchQuery: typeof input.searchQuery === 'string' ? input.searchQuery : s.searchQuery,
            deviceScope: input.deviceScope ?? s.deviceScope,
            loadedPreset: input.loadPreset ?? null,
            exportedXml: exportedXml ?? null
          };
        })
      }
    ];

    return tools;
  }, []);

  useEffect(() => {
    const host = ensureModelContextHost();
    setIsNativeSupport(!host.__isPolyfill);

    const tools = buildTools();
    setRegisteredTools(tools);

    for (const tool of tools) {
      host.registerTool(tool);
    }

    return () => {
      if (typeof host.unregisterTool === 'function') {
        for (const tool of tools) {
          host.unregisterTool(tool.name);
        }
      }
    };
  }, [buildTools]);

  const executeRegisteredTool = useCallback(async (name: string, input: Record<string, any> = {}) => {
    const host = ensureModelContextHost();
    return await host.executeTool(name, input);
  }, []);

  return {
    registeredTools,
    isNativeSupport,
    lastToolCall,
    executeRegisteredTool
  };
}
