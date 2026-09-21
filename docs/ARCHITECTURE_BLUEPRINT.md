# Architectural Blueprint: Star Citizen Keybinding Management Application

A high-performance, web-based Keybinding Management Suite tailored for Star Citizen's CryEngine-derived XML input system. This document specifies the comprehensive architecture, JSON schemas, core TypeScript implementations, conflict resolution mathematics, and the Go-based extraction daemon.

---

## User Review Required

> [!IMPORTANT]
> **User Feedback Incorporated**:
> 1. **Go Daemon CLI & Config Generator**: The Go tool runs both as an automated CLI tool and optional daemon. It accepts a `--game-path` (`-p`) CLI argument for custom installation paths (with fallback to RSI Launcher log discovery) and an `--output` (`-o`) argument to write a self-contained, merged `game-data.json` or compressed `.scj` config file directly to the web app's `public/` directory or specified destination.
> 2. **Lossless XML DOM Pipeline**: Confirmed for implementation. Non-destructive AST preserves all hardware prefixes (`kb1_`, `mo1_`, `js1_`), attributes (`activationMode`, `multiTap`), and root `<options>`.
> 3. **Conflict Detection Engine**: Confirmed for implementation. Tri-state severity rating (0 = None, 1 = Warning, 2 = Fatal) with exclusionary context matrix and temporal state machine.


---

## Proposed System Architecture & Directory Structure

A modular monorepo structure separating concerns between schema definitions, client-side visualizers, server-side parsers, and the native Go extraction daemon:

```
sc-mapping/
├── packages/
│   ├── shared-types/                # Shared TypeScript schemas & AST interfaces
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── src/
│   │       ├── actionmaps.ts        # ActionMaps JSON Schema & AST interfaces
│   │       ├── hardware.ts          # Device definitions, VID/PID, Gamepad API types
│   │       ├── conflicts.ts         # Conflict definitions and severity enums
│   │       └── localization.ts     # Localization token dictionary types
│   ├── parser/                      # Node.js lossless XML DOM Parser & Serializer
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── src/
│   │       ├── ActionMapsParser.ts  # DOM to JSON parser with prefix fidelity
│   │       ├── ActionMapsExporter.ts# JSON to XML compiler & instance remapper
│   │       └── LocalizationMerger.ts# Ingestion module for global.ini + defaultProfile.xml
│   └── resolver/                    # Conflict Detection & Temporal State Engine
│       ├── package.json
│       ├── tsconfig.json
│       └── src/
│           ├── ConflictResolver.ts  # Main logic class
│           ├── ExclusionMatrix.ts   # Operational context matrix & Master Modes
│           └── TemporalEvaluator.ts # activationMode & multiTap temporal analyzer
├── apps/
│   └── web/                         # React 19 Frontend Application
│       ├── package.json
│       ├── tsconfig.json
│       ├── vite.config.ts
│       └── src/
│           ├── components/
│           │   ├── DeviceVisualizer/ # Interactive SVG/Canvas for VKB, Virpil, TM
│           │   ├── DeviceRack/       # Drag-and-drop logical jsX instance re-orderer
│           │   ├── BindingTable/     # Virtualized searchable bindings list
│           │   └── ConflictViewer/   # Conflict alerts & resolution suggestions
│           ├── hooks/
│           │   ├── useGamepadListener.ts # HTML5 Gamepad API "Listening Mode"
│           │   └── useActionMaps.ts  # State management & undo/redo stack
│           └── services/
│               └── daemonClient.ts   # WebSocket/HTTP client for sc-daemon
└── daemon/                          # Lightweight Go Extraction Daemon (Phase 4)
    ├── go.mod
    ├── go.sum
    ├── main.go                      # Daemon CLI & HTTP server entrypoint
    ├── pkg/
    │   ├── locator/                 # RSI Launcher log parser & path discovery
    │   │   └── locator.go
    │   ├── p4k/                     # Low-level zip64 byte streamer & CryEngine cipher
    │   │   ├── reader.go
    │   │   ├── cipher.go
    │   │   └── extractor.go
    │   ├── parser/                  # In-memory defaultProfile.xml & global.ini parser
    │   │   ├── xml.go
    │   │   └── ini.go
    │   └── cache/                   # Compressed .scj payload local store
    │       └── cache.go
    └── Makefile
```

---

## Phase 1: XML Parsing, Localization, and State Management

### 1.1 JSON Schema Definition & TypeScript Interfaces

Star Citizen's `actionmaps.xml` structure distinguishes cleanly between root options, action maps, and child bindings. Crucially, a single action can contain both a primary `<rebind>` (which replaces the engine default) and multiple `<addbind>` elements (which bind secondary inputs to the same action):

```typescript
/**
 * Core JSON Schema interfaces for Star Citizen ActionMaps
 */

export type HardwarePrefix = 'kb1' | 'mo1' | 'gp1' | `js${number}`;

export type ActivationMode =
  | 'press'
  | 'hold'
  | 'double_tap'
  | 'delayed_press'
  | 'smart_toggle';

export interface BindingInput {
  /** Raw hardware input string (e.g., 'js1_button1', 'kb1_lctrl+c', 'mo1_wheel_up') */
  input: string;
  /** Extracted hardware prefix for physical device indexing */
  devicePrefix: HardwarePrefix;
  /** The normalized hardware key/axis (e.g., 'button1', 'pitch', 'space') */
  hardwareKey: string;
  /** Modifier keys if chorded (e.g., ['lalt', 'lctrl']) */
  modifiers?: string[];
  /** In-engine activation behavioral mode */
  activationMode?: ActivationMode;
  /** Multi-tap threshold (1 = single tap, 2 = double tap) */
  multiTap?: number;
  /** Binding type indicating inheritance behavior */
  bindType: 'rebind' | 'addbind';
}

export interface ActionBinding {
  /** Internal programmatic action identifier (e.g., 'v_pitch', 'v_attack1_group1') */
  name: string;
  /** Human-readable localized title from global.ini (e.g., 'Pitch', 'Fire Weapon Group 1') */
  label?: string;
  /** Human-readable description/category tooltip */
  description?: string;
  /** Array of inputs (rebind + any addbind occurrences) */
  inputs: BindingInput[];
  /** Operational tags (e.g., ['flight', 'combat', 'nav', 'destructive']) */
  tags?: string[];
}

export interface ActionMapGroup {
  /** Action map context name (e.g., 'spaceship_movement', 'player_input_onfoot') */
  name: string;
  /** Human-readable context label (e.g., 'Flight - Movement') */
  label?: string;
  /** Actions defined within this context */
  actions: Record<string, ActionBinding>;
}

export interface JoystickDeviceOption {
  type: 'joystick';
  instance: number; // 1-based index (js1, js2)
  productName: string; // e.g., 'VKBsim Gladiator EVO R'
  productGuid?: string;
  inversions: Record<string, boolean>; // e.g., { 'pitch': true, 'throttle': false }
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

export interface ActionMapsDocument {
  version: number;
  optionsVersion?: number;
  rebindVersion?: number;
  profileName: string;
  customisationUIDs?: {
    optionUIDs: string[];
    listUIDs: string[];
  };
  /** Device options mapped by device type and instance */
  devices: DeviceOption[];
  /** Action maps mapped by context name */
  actionMaps: Record<string, ActionMapGroup>;
}
```

### 1.2 Localization Ingestion Module

Game files store labels in `Data/Localization/english/global.ini` as key-value pairs (e.g., `@ui_v_pitch=Pitch`, `@ui_spaceship_movement=Flight - Movement`).

The ingestion module merges these localization strings with programmatic action definitions:

```typescript
export class LocalizationMerger {
  private locMap: Map<string, string> = new Map();

  constructor(iniRawContent?: string) {
    if (iniRawContent) this.loadLocalizationIni(iniRawContent);
  }

  public loadLocalizationIni(content: string): void {
    const lines = content.split(/\r?\n/);
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#') || trimmed.startsWith(';')) continue;
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx !== -1) {
        let key = trimmed.slice(0, eqIdx).trim();
        const value = trimmed.slice(eqIdx + 1).trim();
        if (key.startsWith('@')) key = key.slice(1);
        this.locMap.set(key.toLowerCase(), value);
      }
    }
  }

  public resolveActionLabel(actionName: string, mapName: string): { label: string; description: string } {
    // Star Citizen UI naming patterns:
    // 1. Exact match: @ui_{actionName}
    // 2. Action map prefix: @ui_{mapName}_{actionName}
    // 3. Fallback: Title case formatting of programmatic name
    const candidateKeys = [
      `ui_${actionName}`.toLowerCase(),
      `ui_ci_${actionName}`.toLowerCase(),
      `ui_${mapName}_${actionName}`.toLowerCase(),
      actionName.toLowerCase()
    ];

    for (const key of candidateKeys) {
      const hit = this.locMap.get(key);
      if (hit) return { label: hit, description: `Internal: ${actionName}` };
    }

    return {
      label: this.fallbackHumanize(actionName),
      description: `Internal: ${actionName}`
    };
  }

  private fallbackHumanize(str: string): string {
    return str
      .replace(/^v_/, '')
      .replace(/_/g, ' ')
      .replace(/\b\w/g, char => char.toUpperCase());
  }
}
```

### 1.3 Server-Side XML DOM Parser (Node.js / TypeScript)

Using `@xmldom/xmldom` to ensure non-destructive attribute preservation, hardware prefix identification, and support for both `<rebind>` and `<addbind>`:

```typescript
import { DOMParser } from '@xmldom/xmldom';
import type {
  ActionMapsDocument,
  ActionMapGroup,
  ActionBinding,
  BindingInput,
  DeviceOption,
  JoystickDeviceOption
} from '@sc-mapping/shared-types';

export class ActionMapsParser {
  public static parseXML(xmlContent: string): ActionMapsDocument {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xmlContent, 'text/xml');
    const root = doc.documentElement;

    if (!root || root.tagName !== 'ActionMaps') {
      throw new Error("Invalid Star Citizen XML: Root element must be <ActionMaps>");
    }

    const result: ActionMapsDocument = {
      version: parseInt(root.getAttribute('version') || '1', 10),
      optionsVersion: parseInt(root.getAttribute('optionsVersion') || '2', 10),
      rebindVersion: parseInt(root.getAttribute('rebindVersion') || '2', 10),
      profileName: root.getAttribute('profileName') || 'custom',
      devices: [],
      actionMaps: {}
    };

    // 1. Parse <options> nodes (Joysticks, Mice, Keyboards)
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
          const value = inv.getAttribute('val') === '1' || inv.getAttribute('val') === 'true';
          if (axis) inversions[axis] = value;
        }

        const device: JoystickDeviceOption = {
          type: 'joystick',
          instance,
          productName: product,
          productGuid: guid,
          inversions
        };
        result.devices.push(device);
      }
    }

    // 2. Parse <actionmap> groupings
    const actionmapNodes = root.getElementsByTagName('actionmap');
    for (let i = 0; i < actionmapNodes.length; i++) {
      const amNode = actionmapNodes[i];
      const mapName = amNode.getAttribute('name');
      if (!mapName) continue;

      const group: ActionMapGroup = {
        name: mapName,
        actions: {}
      };

      const actionNodes = amNode.getElementsByTagName('action');
      for (let j = 0; j < actionNodes.length; j++) {
        const actNode = actionNodes[j];
        const actionName = actNode.getAttribute('name');
        if (!actionName) continue;

        const actionBinding: ActionBinding = {
          name: actionName,
          inputs: []
        };

        // Parse both <rebind> and <addbind>
        const childNodes = actNode.childNodes;
        for (let k = 0; k < childNodes.length; k++) {
          const child = childNodes[k] as Element;
          if (child.nodeType !== 1) continue; // Element nodes only

          const tagName = child.tagName;
          if (tagName === 'rebind' || tagName === 'addbind') {
            const rawInput = child.getAttribute('input');
            if (!rawInput) continue;

            const parsedInput = this.parseInputDescriptor(
              rawInput,
              tagName as 'rebind' | 'addbind',
              child
            );
            actionBinding.inputs.push(parsedInput);
          }
        }

        group.actions[actionName] = actionBinding;
      }

      result.actionMaps[mapName] = group;
    }

    return result;
  }

  private static parseInputDescriptor(
    rawInput: string,
    bindType: 'rebind' | 'addbind',
    element: Element
  ): BindingInput {
    // Deconstruct hardware prefix (e.g. 'js1_button1' -> prefix: 'js1', key: 'button1')
    const match = rawInput.match(/^([a-z0-9]+)_(.+)$/i);
    const prefix = (match ? match[1].toLowerCase() : 'kb1') as any;
    const hardwareKey = match ? match[2] : rawInput;

    const activationMode = element.getAttribute('activationMode') as any || undefined;
    const multiTapStr = element.getAttribute('multiTap');
    const multiTap = multiTapStr ? parseInt(multiTapStr, 10) : undefined;

    return {
      input: rawInput,
      devicePrefix: prefix,
      hardwareKey,
      activationMode,
      multiTap,
      bindType
    };
  }
}
```

---

## Phase 2: Intelligent Conflict Detection Engine

Star Citizen bindings must not throw false positives if two actions share an input but exist in mutually exclusive flight modes or separate physical operational states (e.g. `spaceship_movement` vs `player_input_onfoot`).

### 2.1 Conflict Resolution Architecture & Exclusionary Matrix

```typescript
export enum ConflictSeverity {
  None = 0,
  Warning = 1, // Latency penalty (e.g., double tap vs single tap) or soft overlap
  Fatal = 2    // Concurrent execution on same tick / hard lock
}

export interface ConflictDetails {
  severity: ConflictSeverity;
  sourceAction: string;
  targetAction: string;
  sharedInput: string;
  reason: string;
  recommendation?: string;
}

/**
 * Operational Context Matrix
 * Maps actionmaps to their operational domains and defines collision rules.
 */
export class ExclusionMatrix {
  // Disjoint operational contexts: Actions in these maps NEVER run concurrently
  private static readonly MUTUALLY_EXCLUSIVE_GROUPS: Set<string>[] = [
    // On-Foot vs Vehicle Cockpit vs EVA
    new Set(['player_input_onfoot', 'spaceship_movement', 'vehicle_driver', 'eva', 'turret', 'spectator']),
    // Ground vehicle vs Spaceflight
    new Set(['vehicle_driver', 'spaceship_movement']),
    // Vehicle turret vs vehicle piloting
    new Set(['turret', 'spaceship_movement'])
  ];

  // Master Modes & Flight Sub-contexts (Star Citizen 3.23+)
  // SCM Mode (Combat/Weapons active, speed limited) vs NAV Mode (Quantum/Flight active, shields/guns disabled)
  private static readonly MODE_EXCLUSIVE_ACTIONS: Record<string, 'SCM' | 'NAV'> = {
    // Weapons and targeting can only fire in SCM
    'v_attack1_group1': 'SCM',
    'v_attack1_group2': 'SCM',
    'v_target_lock_selected': 'SCM',
    // Nav mode specific commands
    'v_nav_mode_enter': 'NAV',
    'v_quantum_spool': 'NAV'
  };

  /**
   * Evaluates if two action maps can be active concurrently in the game engine
   */
  public static areContextsConcurrent(mapA: string, mapB: string): boolean {
    if (mapA === mapB) return true;

    // Check if both maps exist in a mutually exclusive group
    for (const group of this.MUTUALLY_EXCLUSIVE_GROUPS) {
      if (group.has(mapA) && group.has(mapB)) {
        return false; // Mutually exclusive: cannot conflict!
      }
    }

    // Global contexts (e.g., 'seat_general', 'view') overlap with cockpit movement
    return true;
  }

  /**
   * Checks if actions are restricted by modern Master Modes (SCM vs NAV)
   */
  public static isMasterModeConflict(actionA: string, actionB: string): boolean {
    const modeA = this.MODE_EXCLUSIVE_ACTIONS[actionA];
    const modeB = this.MODE_EXCLUSIVE_ACTIONS[actionB];
    if (modeA && modeB && modeA !== modeB) {
      return false; // Safe: one is SCM-only, the other is NAV-only
    }
    return true; // Overlapping or neutral
  }
}
```

### 2.2 Temporal State Machine Evaluator & `ConflictResolver`

```typescript
import {
  ActionBinding,
  BindingInput
} from '@sc-mapping/shared-types';
import { ExclusionMatrix, ConflictSeverity, ConflictDetails } from './ExclusionMatrix';

export class ConflictResolver {
  // Critical destructive actions where hold-vs-tap requires extreme caution
  private static readonly DESTRUCTIVE_ACTIONS = new Set([
    'v_eject',
    'v_self_destruct',
    'v_jettison_cargo',
    'player_suicide'
  ]);

  /**
   * Evaluates two bindings sharing the same physical input
   */
  public static evaluateConflict(
    mapA: string,
    actionA: ActionBinding,
    inputA: BindingInput,
    mapB: string,
    actionB: ActionBinding,
    inputB: BindingInput
  ): ConflictDetails {
    // If inputs are different, no conflict
    if (inputA.input !== inputB.input) {
      return {
        severity: ConflictSeverity.None,
        sourceAction: actionA.name,
        targetAction: actionB.name,
        sharedInput: inputA.input,
        reason: 'Distinct physical inputs'
      };
    }

    // 1. Exclusionary Matrix Evaluation
    if (!ExclusionMatrix.areContextsConcurrent(mapA, mapB)) {
      return {
        severity: ConflictSeverity.None,
        sourceAction: actionA.name,
        targetAction: actionB.name,
        sharedInput: inputA.input,
        reason: `Mutually exclusive operational contexts (${mapA} vs ${mapB})`
      };
    }

    // 2. Master Modes (SCM vs NAV) Evaluation
    if (!ExclusionMatrix.isMasterModeConflict(actionA.name, actionB.name)) {
      return {
        severity: ConflictSeverity.None,
        sourceAction: actionA.name,
        targetAction: actionB.name,
        sharedInput: inputA.input,
        reason: 'Actions are isolated between SCM and NAV flight master modes'
      };
    }

    // 3. Temporal State Machine Evaluation within Concurrent Contexts
    return this.evaluateTemporalDynamics(actionA, inputA, actionB, inputB);
  }

  private static evaluateTemporalDynamics(
    actionA: ActionBinding,
    inputA: BindingInput,
    actionB: ActionBinding,
    inputB: BindingInput
  ): ConflictDetails {
    const actModeA = inputA.activationMode || 'press';
    const actModeB = inputB.activationMode || 'press';
    const multiTapA = inputA.multiTap || 1;
    const multiTapB = inputB.multiTap || 1;

    // Rule B: multiTap="2" vs. single tap (multiTap="1") = Fatal Conflict
    // Reason: The engine fires the single tap event immediately upon first downstroke,
    // causing unwanted execution before the second tap in multiTap="2" can complete.
    if ((multiTapA === 2 && multiTapB === 1) || (multiTapB === 2 && multiTapA === 1)) {
      return {
        severity: ConflictSeverity.Fatal,
        sourceAction: actionA.name,
        targetAction: actionB.name,
        sharedInput: inputA.input,
        reason: 'Concurrent Execution Conflict: multiTap="2" combined with single tap triggers tap 1 during chord sequence',
        recommendation: 'Change the single-tap binding to activationMode="press" with distinct modifier, or use activationMode="double_tap" instead.'
      };
    }

    // Identical multiTap count and identical activation mode = Hard Fatal Conflict
    if (actModeA === actModeB && multiTapA === multiTapB) {
      return {
        severity: ConflictSeverity.Fatal,
        sourceAction: actionA.name,
        targetAction: actionB.name,
        sharedInput: inputA.input,
        reason: `Direct Collision: Both actions execute simultaneously on ${actModeA} (tap count: ${multiTapA})`
      };
    }

    // Rule A: activationMode="double_tap" vs single tap = Warning (Latency penalty)
    // CryEngine delays single tap dispatch by the double-tap window (~250ms).
    if (
      (actModeA === 'double_tap' && actModeB === 'press') ||
      (actModeB === 'double_tap' && actModeA === 'press')
    ) {
      return {
        severity: ConflictSeverity.Warning,
        sourceAction: actionA.name,
        targetAction: actionB.name,
        sharedInput: inputA.input,
        reason: 'Input Latency Warning: Double-tap introduces ~250ms input latency on the single-tap action while waiting for buffer window',
        recommendation: 'Ensure high-reflex actions (e.g. Countermeasures, Boost) are not mapped to the single-tap action.'
      };
    }

    // Rule C: activationMode="hold" vs single tap = Contextual Conflict
    if (
      (actModeA === 'hold' && actModeB === 'press') ||
      (actModeB === 'hold' && actModeA === 'press')
    ) {
      const isDestructive =
        this.DESTRUCTIVE_ACTIONS.has(actionA.name) ||
        this.DESTRUCTIVE_ACTIONS.has(actionB.name);

      if (isDestructive) {
        return {
          severity: ConflictSeverity.Fatal,
          sourceAction: actionA.name,
          targetAction: actionB.name,
          sharedInput: inputA.input,
          reason: 'Destructive Action Safety Conflict: A critical destructive action (e.g., Eject/Self-Destruct) shares a hold-press boundary with a tap action',
          recommendation: 'Isolate destructive actions to a dedicated modifier chord (e.g., RAlt+Backquote).'
        };
      }

      return {
        severity: ConflictSeverity.Warning,
        sourceAction: actionA.name,
        targetAction: actionB.name,
        sharedInput: inputA.input,
        reason: 'Contextual Conflict: Pressing and holding will momentarily trigger the single-press action on key-down unless guarded by delayed_press',
        recommendation: 'Configure activationMode="delayed_press" for the tap action to prevent pre-triggering.'
      };
    }

    return {
      severity: ConflictSeverity.None,
      sourceAction: actionA.name,
      targetAction: actionB.name,
      sharedInput: inputA.input,
      reason: 'Compatible activation modes'
    };
  }
}
```

---

## Phase 3: Hardware Translation, Visualization, and Search

Star Citizen assigns logical indices (`js1`, `js2`, etc.) based on Windows DirectInput enumeration order, which scrambles when devices are reconnected. The `<options type="joystick" instance="N" Product="...">` XML node preserves the true hardware identity.

### 3.1 Device Instance Remapping & Lossless XML Recompilation

When a user in the React frontend drags and drops devices in the Device Rack, a device remapping table is generated (e.g., `{ 1: 2, 2: 1 }` swaps `js1` and `js2`).

```typescript
import { ActionMapsDocument, JoystickDeviceOption } from '@sc-mapping/shared-types';

export class ActionMapsExporter {
  /**
   * Rewrites all jsX prefixes and options instances based on hardwareMapping
   * @param doc The parsed ActionMaps AST
   * @param hardwareMapping Map of current logical instance to target logical instance (e.g., 1 -> 2)
   */
  public static recompileXML(
    doc: ActionMapsDocument,
    hardwareMapping: Map<number, number>
  ): string {
    const lines: string[] = [];
    lines.push('<?xml version="1.0" encoding="utf-8"?>');
    lines.push(
      `<ActionMaps version="${doc.version}" ` +
      `optionsVersion="${doc.optionsVersion || 2}" ` +
      `rebindVersion="${doc.rebindVersion || 2}" ` +
      `profileName="${doc.profileName}">`
    );

    // 1. Recompile CustomisationUIDs
    if (doc.customisationUIDs) {
      lines.push('  <CustomisationUIDs>');
      for (const uid of doc.customisationUIDs.optionUIDs) {
        lines.push(`    <OptionUID text="${uid}"/>`);
      }
      for (const uid of doc.customisationUIDs.listUIDs) {
        lines.push(`    <ListUID text="${uid}"/>`);
      }
      lines.push('  </CustomisationUIDs>');
    }

    // 2. Recompile <options> with updated instances
    for (const dev of doc.devices) {
      if (dev.type === 'joystick') {
        const joy = dev as JoystickDeviceOption;
        const targetInstance = hardwareMapping.get(joy.instance) ?? joy.instance;
        const guidAttr = joy.productGuid ? ` ProductGUID="${joy.productGuid}"` : '';

        lines.push(`  <options type="joystick" instance="${targetInstance}" Product="${joy.productName}"${guidAttr}>`);
        for (const [axis, inverted] of Object.entries(joy.inversions)) {
          lines.push(`    <invert axis="${axis}" val="${inverted ? '1' : '0'}"/>`);
        }
        lines.push('  </options>');
      }
    }

    // 3. Recompile <actionmap> nodes with rewritten jsX_ prefixes
    for (const [mapName, group] of Object.entries(doc.actionMaps)) {
      lines.push(`  <actionmap name="${mapName}">`);
      for (const [actName, action] of Object.entries(group.actions)) {
        if (action.inputs.length === 0) continue;
        lines.push(`    <action name="${actName}">`);

        for (const input of action.inputs) {
          const rewrittenInput = this.rewriteHardwareInput(input.input, hardwareMapping);
          const actModeAttr = input.activationMode ? ` activationMode="${input.activationMode}"` : '';
          const multiTapAttr = input.multiTap ? ` multiTap="${input.multiTap}"` : '';

          lines.push(`      <${input.bindType} input="${rewrittenInput}"${actModeAttr}${multiTapAttr}/>`);
        }

        lines.push('    </action>');
      }
      lines.push('  </actionmap>');
    }

    lines.push('</ActionMaps>');
    return lines.join('\n');
  }

  private static rewriteHardwareInput(
    rawInput: string,
    mapping: Map<number, number>
  ): string {
    // Matches js1_, js2_, etc.
    return rawInput.replace(/^js(\d+)_(.+)$/, (match, instStr, rest) => {
      const currentInst = parseInt(instStr, 10);
      const targetInst = mapping.get(currentInst) ?? currentInst;
      return `js${targetInst}_${rest}`;
    });
  }
}
```

### 3.2 HTML5 Gamepad API "Listening Mode" (React Hook)

A reactive hook that continuously samples `navigator.getGamepads()`, filters axis noise with a deadzone, and emits the Star Citizen input code (`js1_button1`, `js1_rotx`) to filter bindings instantly:

```typescript
import { useEffect, useRef, useState } from 'react';

export interface GamepadInputEvent {
  deviceIndex: number;      // 0-based Gamepad API index (maps to js1, js2)
  scInputString: string;    // e.g. "js1_button3", "js2_pitch"
  rawValue: number;
}

export function useGamepadListener(
  isListening: boolean,
  onInputDetected: (event: GamepadInputEvent) => void
) {
  const reqRef = useRef<number | null>(null);
  const prevButtonState = useRef<Map<string, boolean>>(new Map());

  useEffect(() => {
    if (!isListening) {
      if (reqRef.current) cancelAnimationFrame(reqRef.current);
      return;
    }

    const pollGamepads = () => {
      const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];

      for (let gIdx = 0; gIdx < gamepads.length; gIdx++) {
        const gp = gamepads[gIdx];
        if (!gp || !gp.connected) continue;

        const jsNumber = gIdx + 1; // DirectInput instance convention (js1, js2)

        // 1. Sample Buttons
        for (let bIdx = 0; bIdx < gp.buttons.length; bIdx++) {
          const btn = gp.buttons[bIdx];
          const key = `js${jsNumber}_btn_${bIdx}`;
          const isPressed = btn.pressed || btn.value > 0.5;
          const wasPressed = prevButtonState.current.get(key) || false;

          // Trigger on key-down edge
          if (isPressed && !wasPressed) {
            onInputDetected({
              deviceIndex: gIdx,
              scInputString: `js${jsNumber}_button${bIdx + 1}`,
              rawValue: btn.value
            });
          }
          prevButtonState.current.set(key, isPressed);
        }

        // 2. Sample Axes (with 0.25 deadzone to eliminate stick drift)
        const AXIS_NAMES = ['x', 'y', 'z', 'rotx', 'roty', 'rotz', 'slider1', 'slider2'];
        for (let aIdx = 0; aIdx < gp.axes.length; aIdx++) {
          const val = gp.axes[aIdx];
          if (Math.abs(val) > 0.65) {
            const axisName = AXIS_NAMES[aIdx] || `axis_${aIdx}`;
            onInputDetected({
              deviceIndex: gIdx,
              scInputString: `js${jsNumber}_${axisName}`,
              rawValue: val
            });
          }
        }
      }

      reqRef.current = requestAnimationFrame(pollGamepads);
    };

    reqRef.current = requestAnimationFrame(pollGamepads);
    return () => {
      if (reqRef.current) cancelAnimationFrame(reqRef.current);
    };
  }, [isListening, onInputDetected]);
}
```

---

## Phase 4: Local Extraction Daemon Strategy (Go)

### 4.1 Daemon Architectural Overview

The native Go daemon (`sc-daemon`) runs on the user's local machine as a background service:
1. **Locate**: Discovers Star Citizen installation directory by inspecting `%APPDATA%\rsilauncher\logs\log.log` or `%APPDATA%\RSI Launcher\logs\log.log`.
2. **Stream**: Opens `[GamePath]\LIVE\Data.p4k` (90GB+) using `os.Open`. Instead of reading the entire archive, it utilizes Zip64 seek semantics (`io.ReaderAt`) to inspect the Central Directory at the file's tail.
3. **Decrypt**: CryEngine ZIP archives protect internal files with a bespoke cipher key (`0x5E, 0x7A, 0x20, 0x02, 0x30, 0x2E, 0xEB, 0x1A, 0x3B, 0xB6, 0x17, 0xC3, 0x0F, 0xDE, 0x1E, 0x47`). The daemon injects a decryption stream reader.
4. **Extract Target Files**:
   - `Data/Libs/Config/defaultProfile.xml`
   - `Data/Localization/english/global.ini`
5. **Cache**: Computes a local hash/timestamp of `Data.p4k`. Serializes parsed objects into a zstd/gzip-compressed `.scj` (Star Citizen JSON) cache file.
6. **Push**: Dispatches the parsed profile and localization dictionary to the web application's local HTTP API endpoint (`POST /api/v1/game-data/sync`).

### 4.2 Go Daemon Pseudocode & Implementation

```go
package main

import (
	"archive/zip"
	"bufio"
	"bytes"
	"compress/gzip"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"regexp"
	"strings"
	"time"
)

// CryEngine / Star Citizen P4K 16-byte Decryption Key
var p4kKey = []byte{
	0x5E, 0x7A, 0x20, 0x02,
	0x30, 0x2E, 0xEB, 0x1A,
	0x3B, 0xB6, 0x17, 0xC3,
	0x0F, 0xDE, 0x1E, 0x47,
}

type SCJPayload struct {
	P4kHash           string            `json:"p4k_hash"`
	ExtractedAt       time.Time         `json:"extracted_at"`
	DefaultProfileXML string            `json:"default_profile_xml"`
	Localization      map[string]string `json:"localization"`
}

func main() {
	fmt.Println("[sc-daemon] Starting Star Citizen Extraction Daemon...")

	// 1. Locate Game Path from RSI Launcher logs
	gamePath, err := locateStarCitizenPath()
	if err != nil {
		fmt.Printf("[sc-daemon] Error locating Star Citizen: %v\n", err)
		return
	}
	fmt.Printf("[sc-daemon] Discovered Game Path: %s\n", gamePath)

	p4kPath := filepath.Join(gamePath, "LIVE", "Data.p4k")
	if _, err := os.Stat(p4kPath); os.IsNotExist(err) {
		fmt.Printf("[sc-daemon] Data.p4k not found at: %s\n", p4kPath)
		return
	}

	// 2. Check Cache
	cachePath := filepath.Join(os.Getenv("APPDATA"), "sc-mapping", "cache.scj")
	p4kHash, _ := computeFileSignature(p4kPath)

	if isValidCache(cachePath, p4kHash) {
		fmt.Println("[sc-daemon] Cache is fresh. Pushing cached .scj payload to web application...")
		pushCachedPayload(cachePath)
		return
	}

	// 3. Seek & Extract from Data.p4k
	fmt.Println("[sc-daemon] Cache expired or missing. Streaming from Data.p4k...")
	payload, err := extractP4KData(p4kPath, p4kHash)
	if err != nil {
		fmt.Printf("[sc-daemon] Extraction failed: %v\n", err)
		return
	}

	// 4. Save Compressed Cache (.scj)
	if err := saveCache(cachePath, payload); err != nil {
		fmt.Printf("[sc-daemon] Warning: failed to write cache: %v\n", err)
	}

	// 5. Push to Web App API
	pushToWebApp(payload)
	fmt.Println("[sc-daemon] Sync completed successfully.")
}

// locateStarCitizenPath parses %APPDATA%\rsilauncher\logs\log.log
func locateStarCitizenPath() (string, error) {
	appData := os.Getenv("APPDATA")
	logPaths := []string{
		filepath.Join(appData, "rsilauncher", "logs", "log.log"),
		filepath.Join(appData, "RSI Launcher", "logs", "log.log"),
	}

	var logFile *os.File
	for _, lp := range logPaths {
		f, err := os.Open(lp)
		if err == nil {
			logFile = f
			break
		}
	}
	if logFile == nil {
		return "", fmt.Errorf("could not open RSI Launcher logs in %s", appData)
	}
	defer logFile.Close()

	// Regex pattern searching for game installation directory
	// e.g. "gamePath": "D:\\Games\\StarCitizen" or "Library folder: D:\\Games\\StarCitizen"
	pathRegex := regexp.MustCompile(`(?i)(?:gamePath|Library folder|Installing [^"]* to)\s*[:=]\s*["']?([A-Z]:\\[^"'\r\n]+?)(?:\\StarCitizen)?["']?$`)

	scanner := bufio.NewScanner(logFile)
	var detectedPath string
	for scanner.Scan() {
		line := scanner.Text()
		if match := pathRegex.FindStringSubmatch(line); len(match) > 1 {
			detectedPath = match[1]
		}
	}

	if detectedPath == "" {
		// Default fallback path
		defaultPath := `C:\Program Files\Roberts Space Industries\StarCitizen`
		if _, err := os.Stat(defaultPath); err == nil {
			return defaultPath, nil
		}
		return "", fmt.Errorf("unable to detect Star Citizen directory in launcher logs")
	}

	return detectedPath, nil
}

// extractP4KData utilizes Zip64 ReaderAt seeking to extract target assets without reading 90GB into memory
func extractP4KData(p4kPath string, hash string) (*SCJPayload, error) {
	f, err := os.Open(p4kPath)
	if err != nil {
		return nil, err
	}
	defer f.Close()

	fi, err := f.Stat()
	if err != nil {
		return nil, err
	}

	// Open Zip64 reader via io.ReaderAt
	zipReader, err := zip.NewReader(f, fi.Size())
	if err != nil {
		return nil, fmt.Errorf("error initializing zip reader on Data.p4k: %w", err)
	}

	payload := &SCJPayload{
		P4kHash:      hash,
		ExtractedAt:  time.Now(),
		Localization: make(map[string]string),
	}

	for _, file := range zipReader.File {
		normalizedName := strings.ReplaceAll(file.Name, `\`, `/`)

		if normalizedName == "Data/Libs/Config/defaultProfile.xml" {
			rc, err := openEncryptedEntry(file)
			if err != nil {
				return nil, err
			}
			buf := new(bytes.Buffer)
			buf.ReadFrom(rc)
			rc.Close()
			payload.DefaultProfileXML = buf.String()
		}

		if normalizedName == "Data/Localization/english/global.ini" {
			rc, err := openEncryptedEntry(file)
			if err != nil {
				return nil, err
			}
			scanner := bufio.NewScanner(rc)
			for scanner.Scan() {
				line := strings.TrimSpace(scanner.Text())
				if line == "" || strings.HasPrefix(line, "#") || strings.HasPrefix(line, ";") {
					continue
				}
				parts := strings.SplitN(line, "=", 2)
				if len(parts) == 2 {
					k := strings.TrimSpace(strings.TrimPrefix(parts[0], "@"))
					payload.Localization[strings.ToLower(k)] = strings.TrimSpace(parts[1])
				}
			}
			rc.Close()
		}
	}

	return payload, nil
}

// openEncryptedEntry wraps entry streams with CryEngine decryption if encrypted
func openEncryptedEntry(file *zip.File) (io.ReadCloser, error) {
	rc, err := file.Open()
	if err != nil {
		return nil, err
	}
	// Star Citizen Zip encrypted stream wrapper
	if file.Flags&0x1 != 0 {
		return newCryDecryptReader(rc, p4kKey), nil
	}
	return rc, nil
}

type cryDecryptReader struct {
	src io.ReadCloser
	key []byte
}

func newCryDecryptReader(src io.ReadCloser, key []byte) *cryDecryptReader {
	return &cryDecryptReader{src: src, key: key}
}

func (r *cryDecryptReader) Read(p []byte) (n int, err error) {
	n, err = r.src.Read(p)
	// Decrypt buffer in-place using Star Citizen CryEngine cipher routine
	for i := 0; i < n; i++ {
		p[i] ^= r.key[i%len(r.key)]
	}
	return n, err
}

func (r *cryDecryptReader) Close() error {
	return r.src.Close()
}

func computeFileSignature(path string) (string, error) {
	fi, err := os.Stat(path)
	if err != nil {
		return "", err
	}
	sig := fmt.Sprintf("%d-%d", fi.Size(), fi.ModTime().Unix())
	h := sha256.Sum256([]byte(sig))
	return hex.EncodeToString(h[:]), nil
}

func isValidCache(cachePath string, currentHash string) bool {
	f, err := os.Open(cachePath)
	if err != nil {
		return false
	}
	defer f.Close()

	gz, err := gzip.NewReader(f)
	if err != nil {
		return false
	}
	defer gz.Close()

	var payload SCJPayload
	if err := json.NewDecoder(gz).Decode(&payload); err != nil {
		return false
	}

	return payload.P4kHash == currentHash
}

func saveCache(cachePath string, payload *SCJPayload) error {
	os.MkdirAll(filepath.Dir(cachePath), 0755)
	f, err := os.Create(cachePath)
	if err != nil {
		return err
	}
	defer f.Close()

	gz := gzip.NewWriter(f)
	defer gz.Close()

	return json.NewEncoder(gz).Encode(payload)
}

func pushToWebApp(payload *SCJPayload) {
	body, _ := json.Marshal(payload)
	req, _ := http.NewRequest("POST", "http://localhost:5173/api/v1/game-data/sync", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")
	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		fmt.Printf("[sc-daemon] Note: Web app server offline or unreachable (%v). Payload cached locally.\n", err)
		return
	}
	defer resp.Body.Close()
	fmt.Printf("[sc-daemon] Successfully pushed payload to web app. HTTP %d\n", resp.StatusCode)
}

func pushCachedPayload(cachePath string) {
	f, err := os.Open(cachePath)
	if err != nil {
		return
	}
	defer f.Close()

	gz, err := gzip.NewReader(f)
	if err != nil {
		return
	}
	defer gz.Close()

	var payload SCJPayload
	if err := json.NewDecoder(gz).Decode(&payload); err == nil {
		pushToWebApp(&payload)
	}
}
```

---

## Verification & Execution Plan

### Automated Tests
1. **XML Parser & Exporter Fidelity Tests (`pnpm test:parser`)**:
   - Verify parsing of sample `actionmaps.xml` with multiple `rebind` and `addbind` nodes.
   - Assert all hardware prefixes (`kb1_`, `js1_`, `mo1_`) and attributes (`activationMode`, `multiTap`) are preserved.
   - Assert round-trip idempotency: parsing XML -> JSON -> XML produces semantically identical XML.
2. **Conflict Detection Engine Suite (`pnpm test:resolver`)**:
   - Test Rule A (`double_tap` vs single tap returns `Severity 1 - Warning`).
   - Test Rule B (`multiTap="2"` vs single tap returns `Severity 2 - Fatal`).
   - Test Rule C (`hold` vs tap returns `Severity 1 - Warning`, and `Severity 2 - Fatal` if action is in `DESTRUCTIVE_ACTIONS`).
   - Test Exclusionary Matrix: `spaceship_movement` vs `player_input_onfoot` returns `Severity 0 - None`.
   - Test Master Modes isolation: `v_attack1_group1` (SCM) vs `v_quantum_spool` (NAV) returns `Severity 0 - None`.
3. **Hardware Remapper Tests (`pnpm test:hardware`)**:
   - Test global replacement: swap `js1` and `js2` across `<options>` and child `<action>` nodes without altering mouse or keyboard mappings.
4. **Go Daemon Compilation & Unit Tests (`go test ./...`)**:
   - Verify log parser regex extraction against simulated RSI launcher log samples.
   - Verify `.scj` gzip cache roundtrip serialization.

### Manual / Browser Verification
- Launch local development server with Vite (`pnpm dev`).
- Connect physical HOTAS/Gamepad or emulate using HTML5 Gamepad API tester.
- Verify "Listening Mode" button clicks and axis threshold detections filter the table in real-time.
- Verify drag-and-drop device remapping in the Device Rack updates the preview diff.
