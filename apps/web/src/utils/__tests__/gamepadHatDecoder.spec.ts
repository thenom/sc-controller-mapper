import { describe, it, expect } from 'vitest';
import { decodeHatAxis, isHatRestSentinel } from '../gamepadHatDecoder';

describe('gamepadHatDecoder', () => {
  describe('isHatRestSentinel', () => {
    it('identifies the ~1.2857 sentinel value as rest', () => {
      expect(isHatRestSentinel(1.285714)).toBe(true);
      expect(isHatRestSentinel(1.29)).toBe(true);
      expect(isHatRestSentinel(1.06)).toBe(true);
    });

    it('rejects standard axis ranges', () => {
      expect(isHatRestSentinel(0.0)).toBe(false);
      expect(isHatRestSentinel(1.0)).toBe(false);
      expect(isHatRestSentinel(-1.0)).toBe(false);
      expect(isHatRestSentinel(0.5)).toBe(false);
    });
  });

  describe('decodeHatAxis - Rest / Centered', () => {
    it('correctly treats 1.29 and 1.2857 as centered at rest', () => {
      const state1 = decodeHatAxis(1.29);
      expect(state1.isHatAxis).toBe(true);
      expect(state1.isCentered).toBe(true);
      expect(state1.direction).toBeNull();
      expect(state1.scInputSuffix).toBeNull();

      const state2 = decodeHatAxis(1.285714);
      expect(state2.isCentered).toBe(true);
      expect(state2.direction).toBeNull();
    });
  });

  describe('decodeHatAxis - Discrete 8 Compass Sectors', () => {
    it('resolves 0° (Up) at -1.00', () => {
      const res = decodeHatAxis(-1.0);
      expect(res.isCentered).toBe(false);
      expect(res.direction).toBe('up');
      expect(res.scInputSuffix).toBe('hat1_up');
      expect(res.angleDeg).toBe(0);
      expect(res.cardinals).toEqual(['hat1_up']);
    });

    it('resolves 45° (Up-Right) at -0.71 / -0.72', () => {
      const res1 = decodeHatAxis(-0.714);
      expect(res1.direction).toBe('up_right');
      expect(res1.scInputSuffix).toBe('hat1_up_right');
      expect(res1.angleDeg).toBe(45);
      expect(res1.cardinals).toEqual(['hat1_up', 'hat1_right']);

      const res2 = decodeHatAxis(-0.72);
      expect(res2.direction).toBe('up_right');
    });

    it('resolves 90° (Right) at -0.43', () => {
      const res = decodeHatAxis(-0.4285);
      expect(res.direction).toBe('right');
      expect(res.scInputSuffix).toBe('hat1_right');
      expect(res.angleDeg).toBe(90);
      expect(res.cardinals).toEqual(['hat1_right']);
    });

    it('resolves 135° (Down-Right) at -0.14 without being swallowed by deadzone', () => {
      const res = decodeHatAxis(-0.1428);
      expect(res.direction).toBe('down_right');
      expect(res.scInputSuffix).toBe('hat1_down_right');
      expect(res.angleDeg).toBe(135);
      expect(res.cardinals).toEqual(['hat1_down', 'hat1_right']);
    });

    it('resolves 180° (Down) at +0.14 without being swallowed by deadzone', () => {
      const res = decodeHatAxis(0.1428);
      expect(res.direction).toBe('down');
      expect(res.scInputSuffix).toBe('hat1_down');
      expect(res.angleDeg).toBe(180);
      expect(res.cardinals).toEqual(['hat1_down']);
    });

    it('resolves 225° (Down-Left) at +0.43', () => {
      const res = decodeHatAxis(0.4285);
      expect(res.direction).toBe('down_left');
      expect(res.scInputSuffix).toBe('hat1_down_left');
      expect(res.angleDeg).toBe(225);
      expect(res.cardinals).toEqual(['hat1_down', 'hat1_left']);
    });

    it('resolves 270° (Left) at +0.71', () => {
      const res = decodeHatAxis(0.7142);
      expect(res.direction).toBe('left');
      expect(res.scInputSuffix).toBe('hat1_left');
      expect(res.angleDeg).toBe(270);
      expect(res.cardinals).toEqual(['hat1_left']);
    });

    it('resolves 315° (Up-Left) at +1.00', () => {
      const res = decodeHatAxis(1.0);
      expect(res.direction).toBe('up_left');
      expect(res.scInputSuffix).toBe('hat1_up_left');
      expect(res.angleDeg).toBe(315);
      expect(res.cardinals).toEqual(['hat1_up', 'hat1_left']);
    });
  });

  describe('decodeHatAxis - Multi-Hat Support', () => {
    it('supports custom hat index (e.g. hat2)', () => {
      const res = decodeHatAxis(-1.0, 2);
      expect(res.direction).toBe('up');
      expect(res.scInputSuffix).toBe('hat2_up');
      expect(res.cardinals).toEqual(['hat2_up']);
    });
  });
});
