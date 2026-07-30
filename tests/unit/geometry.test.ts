import { describe, expect, it } from 'vitest';
import {
  floorAt,
  GEOMETRIES,
  migrateGeometry,
  validateGeometry,
} from '../../src/simulation/geometry';

describe('floorAt', () => {
  it('interpolates between geometry points', () => {
    expect(floorAt(GEOMETRIES.classic, 0.37)).toBeCloseTo(0.84, 5);
  });

  it('returns a bounded floor at the edges', () => {
    expect(floorAt(GEOMETRIES['deep-symmetric'], -1)).toBeCloseTo(0.68);
    expect(floorAt(GEOMETRIES['deep-symmetric'], 2)).toBeCloseTo(0.68);
  });
});

describe('geometry presets', () => {
  it('keeps the versioned definitions stable', () => {
    expect(GEOMETRIES).toMatchSnapshot();
  });

  it.each(Object.values(GEOMETRIES))('$name passes validation', (geometry) => {
    expect(validateGeometry(geometry)).toEqual([]);
  });

  it('reports invalid dimensions, overlap, bounds, clearance, and obstructions', () => {
    const invalid = {
      ...GEOMETRIES.classic,
      inletHeight: Number.NaN,
      weirHeight: 0.7,
      floor: [
        { x: 0.04, y: 0.15 },
        { x: 0.03, y: 1.2 },
        { x: 0.96, y: 0.75 },
      ],
    };
    const codes = validateGeometry(invalid).map((issue) => issue.code);
    expect(codes).toEqual(
      expect.arrayContaining([
        'invalid-dimension',
        'out-of-bounds',
        'overlap',
        'minimum-clearance',
        'outlet-obstructed',
      ]),
    );
  });

  it('migrates each legacy identifier into schema version 1', () => {
    const legacy = {
      id: 'deep' as const,
      label: 'Deep sump',
      inletHeight: 0.25,
      weirHeight: 0.3,
      floor: [
        { x: 0.04, y: 0.68 },
        { x: 0.96, y: 0.7 },
      ],
    };
    expect(migrateGeometry(legacy)).toMatchInlineSnapshot(`
      {
        "description": "Migrated legacy geometry preset.",
        "floor": [
          {
            "x": 0.04,
            "y": 0.68,
          },
          {
            "x": 0.96,
            "y": 0.7,
          },
        ],
        "id": "deep-symmetric",
        "inletHeight": 0.25,
        "name": "Deep sump",
        "schemaVersion": 1,
        "weirHeight": 0.3,
      }
    `);
  });
});
