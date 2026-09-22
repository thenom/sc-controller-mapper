/**
 * gamepadHatDecoder.ts
 *
 * Decodes DirectInput 8-position POV Hat switches mapped to Gamepad API axes on Windows.
 *
 * Background:
 * On Windows Chromium, non-XInput flight controllers (VKB, Virpil, Thrustmaster, etc.)
 * expose DirectInput POV hat switches as a single analog axis (e.g., axis 9).
 * The driver encodes the 8 directions across [-1.0, 1.0] using (direction / 7) * 2 - 1,
 * and uses the 8th position as a sentinel to denote Center / At Rest:
 *   Sentinel = (8 / 7) * 2 - 1 = 9 / 7 ≈ 1.285714... (reported as ~1.29)
 *
 * This utility:
 * 1. Identifies Hat Axes by detecting the out-of-range sentinel (> 1.05).
 * 2. Decodes discrete deflection angles (0°, 45°, 90°, 135°, 180°, 225°, 270°, 315°).
 * 3. Translates deflections to Star Citizen DirectInput hat switch codes (e.g. jsX_hat1_up).
 */

export type HatDirection =
  | 'up'
  | 'up_right'
  | 'right'
  | 'down_right'
  | 'down'
  | 'down_left'
  | 'left'
  | 'up_left';

export interface DecodedHatState {
  /** True if this value matches a known POV hat signature */
  isHatAxis: boolean;
  /** True if the hat is centered / released / at rest */
  isCentered: boolean;
  /** Compass direction name if deflected, null if centered */
  direction: HatDirection | null;
  /** Star Citizen input suffix, e.g. "hat1_up" or "hat1_up_right", null if centered */
  scInputSuffix: string | null;
  /** Compass angle in degrees (0 - 315) if deflected, null if centered */
  angleDeg: number | null;
  /** Primary cardinal and secondary directions for diagonal coverage */
  cardinals: string[];
}

/**
 * DirectInput POV Hat direction sectors and mathematical midpoints.
 * Midpoints: -0.857, -0.571, -0.286, 0.0, 0.286, 0.571, 0.857, 1.05
 */
const HAT_SECTORS: Array<{
  maxVal: number;
  direction: HatDirection;
  angleDeg: number;
  cardinals: (hatIndex: number) => string[];
}> = [
  {
    maxVal: -0.8571,
    direction: 'up',
    angleDeg: 0,
    cardinals: (h) => [`hat${h}_up`]
  },
  {
    maxVal: -0.5714,
    direction: 'up_right',
    angleDeg: 45,
    cardinals: (h) => [`hat${h}_up`, `hat${h}_right`]
  },
  {
    maxVal: -0.2857,
    direction: 'right',
    angleDeg: 90,
    cardinals: (h) => [`hat${h}_right`]
  },
  {
    maxVal: 0.0,
    direction: 'down_right',
    angleDeg: 135,
    cardinals: (h) => [`hat${h}_down`, `hat${h}_right`]
  },
  {
    maxVal: 0.2857,
    direction: 'down',
    angleDeg: 180,
    cardinals: (h) => [`hat${h}_down`]
  },
  {
    maxVal: 0.5714,
    direction: 'down_left',
    angleDeg: 225,
    cardinals: (h) => [`hat${h}_down`, `hat${h}_left`]
  },
  {
    maxVal: 0.8571,
    direction: 'left',
    angleDeg: 270,
    cardinals: (h) => [`hat${h}_left`]
  },
  {
    maxVal: 1.05,
    direction: 'up_left',
    angleDeg: 315,
    cardinals: (h) => [`hat${h}_up`, `hat${h}_left`]
  }
];

/**
 * Check if a raw axis value represents the DirectInput POV hat resting sentinel (~1.2857).
 */
export function isHatRestSentinel(val: number): boolean {
  return val > 1.05 && val < 1.45;
}

/**
 * Decode a raw axis value from a POV hat axis into a structured Star Citizen hat state.
 *
 * @param val The raw axis value from Gamepad.axes[i]
 * @param hatIndex 1-based hat switch index (defaults to 1 for hat1)
 */
export function decodeHatAxis(val: number, hatIndex: number = 1): DecodedHatState {
  // 1. Check for At Rest / Centered (sentinel ~1.2857 or anything > 1.05)
  if (val > 1.05) {
    return {
      isHatAxis: true,
      isCentered: true,
      direction: null,
      scInputSuffix: null,
      angleDeg: null,
      cardinals: []
    };
  }

  // 2. Out of physical range lower bound check
  if (val < -1.05) {
    return {
      isHatAxis: false,
      isCentered: false,
      direction: null,
      scInputSuffix: null,
      angleDeg: null,
      cardinals: []
    };
  }

  // 3. Match against discrete compass sectors
  for (const sector of HAT_SECTORS) {
    if (val <= sector.maxVal) {
      return {
        isHatAxis: true,
        isCentered: false,
        direction: sector.direction,
        scInputSuffix: `hat${hatIndex}_${sector.direction}`,
        angleDeg: sector.angleDeg,
        cardinals: sector.cardinals(hatIndex)
      };
    }
  }

  // Fallback for edge cases exactly around 1.0 - 1.05
  return {
    isHatAxis: true,
    isCentered: false,
    direction: 'up_left',
    scInputSuffix: `hat${hatIndex}_up_left`,
    angleDeg: 315,
    cardinals: [`hat${hatIndex}_up`, `hat${hatIndex}_left`]
  };
}
