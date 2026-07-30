import type { Geometry, GeometryId, Point } from './types';

export const GEOMETRY_SCHEMA_VERSION = 1 as const;
export const VESSEL_BOUNDS = {
  left: 0.04,
  right: 0.96,
  ceiling: 0.12,
  bottom: 0.98,
} as const;
export const MIN_FLOW_CLEARANCE = 0.1;

const preset = (
  id: GeometryId,
  name: string,
  description: string,
  floor: readonly Point[],
  inletHeight: number,
  weirHeight: number,
): Geometry => ({
  schemaVersion: GEOMETRY_SCHEMA_VERSION,
  id,
  name,
  description,
  floor,
  inletHeight,
  weirHeight,
});

/** Versioned, immutable presets in normalized vessel coordinates. */
export const GEOMETRIES: Readonly<Record<GeometryId, Geometry>> = {
  custom: preset(
    'custom',
    'Custom geometry',
    'Editable copy of the selected preset.',
    [
      { x: 0.04, y: 0.72 },
      { x: 0.24, y: 0.78 },
      { x: 0.5, y: 0.9 },
      { x: 0.76, y: 0.78 },
      { x: 0.96, y: 0.72 },
    ],
    0.28,
    0.32,
  ),
  classic: preset(
    'classic',
    'Classic',
    'Balanced reference profile with a centered settling pocket.',
    [
      { x: 0.04, y: 0.72 },
      { x: 0.24, y: 0.78 },
      { x: 0.5, y: 0.9 },
      { x: 0.76, y: 0.78 },
      { x: 0.96, y: 0.72 },
    ],
    0.28,
    0.32,
  ),
  'simple-slope': preset(
    'simple-slope',
    'Simple slope',
    'Minimal two-point floor for a predictable baseline.',
    [
      { x: 0.04, y: 0.72 },
      { x: 0.96, y: 0.82 },
    ],
    0.28,
    0.32,
  ),
  'deep-symmetric': preset(
    'deep-symmetric',
    'Deep symmetric',
    'Mirrored sides lead into a deep central sump.',
    [
      { x: 0.04, y: 0.68 },
      { x: 0.28, y: 0.82 },
      { x: 0.5, y: 0.95 },
      { x: 0.72, y: 0.82 },
      { x: 0.96, y: 0.68 },
    ],
    0.25,
    0.3,
  ),
  asymmetric: preset(
    'asymmetric',
    'Asymmetric',
    'Offset sump compares uneven approach and discharge slopes.',
    [
      { x: 0.04, y: 0.69 },
      { x: 0.2, y: 0.76 },
      { x: 0.39, y: 0.94 },
      { x: 0.73, y: 0.83 },
      { x: 0.96, y: 0.7 },
    ],
    0.27,
    0.31,
  ),
  'narrow-clearance': preset(
    'narrow-clearance',
    'Narrow clearance',
    'Raised floor leaves the minimum supported inlet and outlet clearance.',
    [
      { x: 0.04, y: 0.48 },
      { x: 0.35, y: 0.59 },
      { x: 0.7, y: 0.58 },
      { x: 0.96, y: 0.48 },
    ],
    0.36,
    0.37,
  ),
  'stress-test': preset(
    'stress-test',
    'Stress test',
    'Dense zig-zag profile exercises repeated collision transitions.',
    [
      { x: 0.04, y: 0.7 },
      { x: 0.17, y: 0.86 },
      { x: 0.31, y: 0.73 },
      { x: 0.47, y: 0.94 },
      { x: 0.62, y: 0.75 },
      { x: 0.79, y: 0.87 },
      { x: 0.96, y: 0.69 },
    ],
    0.26,
    0.3,
  ),
};

export type GeometryValidationCode =
  | 'schema-version'
  | 'invalid-dimension'
  | 'out-of-bounds'
  | 'overlap'
  | 'minimum-clearance'
  | 'inlet-obstructed'
  | 'outlet-obstructed';

export interface GeometryValidationIssue {
  code: GeometryValidationCode;
  path: string;
  message: string;
}

export function validateGeometry(value: unknown): GeometryValidationIssue[] {
  const issues: GeometryValidationIssue[] = [];
  if (!value || typeof value !== 'object')
    return [
      {
        code: 'invalid-dimension',
        path: '',
        message: 'Geometry must be an object.',
      },
    ];
  const geometry = value as Partial<Geometry>;
  if (geometry.schemaVersion !== GEOMETRY_SCHEMA_VERSION)
    issues.push({
      code: 'schema-version',
      path: 'schemaVersion',
      message: `Expected schema version ${GEOMETRY_SCHEMA_VERSION}.`,
    });
  for (const key of ['id', 'name', 'description'] as const) {
    if (typeof geometry[key] !== 'string' || geometry[key].trim() === '')
      issues.push({
        code: 'invalid-dimension',
        path: key,
        message: `${key} must be a non-empty string.`,
      });
  }
  const floor = Array.isArray(geometry.floor) ? geometry.floor : [];
  if (floor.length < 2)
    issues.push({
      code: 'invalid-dimension',
      path: 'floor',
      message: 'Floor requires at least two points.',
    });
  floor.forEach((point, index) => {
    if (!point || !Number.isFinite(point.x) || !Number.isFinite(point.y)) {
      issues.push({
        code: 'invalid-dimension',
        path: `floor.${index}`,
        message: 'Point coordinates must be finite numbers.',
      });
      return;
    }
    if (
      point.x < VESSEL_BOUNDS.left ||
      point.x > VESSEL_BOUNDS.right ||
      point.y <= VESSEL_BOUNDS.ceiling ||
      point.y > VESSEL_BOUNDS.bottom
    )
      issues.push({
        code: 'out-of-bounds',
        path: `floor.${index}`,
        message: 'Floor point is outside vessel bounds.',
      });
    if (index > 0 && point.x <= floor[index - 1]!.x)
      issues.push({
        code: 'overlap',
        path: `floor.${index}.x`,
        message: 'Floor segments must progress left-to-right without overlap.',
      });
  });
  if (
    floor[0]?.x !== VESSEL_BOUNDS.left ||
    floor.at(-1)?.x !== VESSEL_BOUNDS.right
  )
    issues.push({
      code: 'out-of-bounds',
      path: 'floor',
      message: 'Floor must span both vessel walls.',
    });
  const inlet = geometry.inletHeight;
  const weir = geometry.weirHeight;
  for (const [key, height] of [
    ['inletHeight', inlet],
    ['weirHeight', weir],
  ] as const) {
    if (!Number.isFinite(height))
      issues.push({
        code: 'invalid-dimension',
        path: key,
        message: `${key} must be finite.`,
      });
    else if (
      height! <= VESSEL_BOUNDS.ceiling ||
      height! >= VESSEL_BOUNDS.bottom
    )
      issues.push({
        code: 'out-of-bounds',
        path: key,
        message: `${key} is outside vessel bounds.`,
      });
  }
  const leftFloor = floor[0]?.y;
  const rightFloor = floor.at(-1)?.y;
  if (
    Number.isFinite(inlet) &&
    Number.isFinite(leftFloor) &&
    leftFloor! - inlet! < MIN_FLOW_CLEARANCE
  )
    issues.push({
      code: 'inlet-obstructed',
      path: 'inletHeight',
      message: `Inlet needs ${MIN_FLOW_CLEARANCE} normalized units of floor clearance.`,
    });
  if (
    Number.isFinite(weir) &&
    Number.isFinite(rightFloor) &&
    rightFloor! - weir! < MIN_FLOW_CLEARANCE
  )
    issues.push({
      code: 'outlet-obstructed',
      path: 'weirHeight',
      message: `Outlet needs ${MIN_FLOW_CLEARANCE} normalized units of floor clearance.`,
    });
  if (
    floor.some(
      (point) =>
        Number.isFinite(point?.y) &&
        point.y - VESSEL_BOUNDS.ceiling < MIN_FLOW_CLEARANCE,
    )
  )
    issues.push({
      code: 'minimum-clearance',
      path: 'floor',
      message: `Floor needs ${MIN_FLOW_CLEARANCE} normalized units of ceiling clearance.`,
    });
  return issues;
}

interface LegacyGeometry {
  id: 'classic' | 'deep' | 'shallow';
  label: string;
  floor: readonly Point[];
  inletHeight: number;
  weirHeight: number;
}

/** Migrates the unversioned P2.2 format. Current documents are returned unchanged. */
export function migrateGeometry(value: Geometry | LegacyGeometry): Geometry {
  if ('schemaVersion' in value) return value;
  const id: GeometryId =
    value.id === 'deep'
      ? 'deep-symmetric'
      : value.id === 'shallow'
        ? 'simple-slope'
        : 'classic';
  return {
    schemaVersion: 1,
    id,
    name: value.label,
    description: 'Migrated legacy geometry preset.',
    floor: value.floor.map((point) => ({ ...point })),
    inletHeight: value.inletHeight,
    weirHeight: value.weirHeight,
  };
}

export function floorAt(geometry: Geometry, x: number): number {
  const clamped = Math.max(geometry.floor[0]?.x ?? 0, Math.min(1, x));
  for (let index = 1; index < geometry.floor.length; index += 1) {
    const left = geometry.floor[index - 1];
    const right = geometry.floor[index];
    if (left && right && clamped <= right.x) {
      const span = right.x - left.x;
      const progress = span === 0 ? 0 : (clamped - left.x) / span;
      return left.y + (right.y - left.y) * progress;
    }
  }
  return geometry.floor.at(-1)?.y ?? 0.8;
}
