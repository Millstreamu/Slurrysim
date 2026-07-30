import { describe, expect, it } from 'vitest';
import { floorAt, GEOMETRIES } from '../../src/simulation/geometry';

describe('floorAt', () => {
  it('interpolates between geometry points', () => {
    expect(floorAt(GEOMETRIES.classic, 0.37)).toBeCloseTo(0.84, 5);
  });

  it('returns a bounded floor at the edges', () => {
    expect(floorAt(GEOMETRIES.deep, -1)).toBeCloseTo(0.68);
    expect(floorAt(GEOMETRIES.deep, 2)).toBeCloseTo(0.7);
  });
});
