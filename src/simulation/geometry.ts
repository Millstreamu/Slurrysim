import type { Geometry, GeometryId } from './types';

export const GEOMETRIES: Record<GeometryId, Geometry> = {
  classic: {
    id: 'classic',
    label: 'Classic',
    inletHeight: 0.28,
    weirHeight: 0.32,
    floor: [
      { x: 0.04, y: 0.72 },
      { x: 0.24, y: 0.78 },
      { x: 0.5, y: 0.9 },
      { x: 0.76, y: 0.78 },
      { x: 0.96, y: 0.72 },
    ],
  },
  deep: {
    id: 'deep',
    label: 'Deep sump',
    inletHeight: 0.25,
    weirHeight: 0.3,
    floor: [
      { x: 0.04, y: 0.68 },
      { x: 0.24, y: 0.82 },
      { x: 0.44, y: 0.95 },
      { x: 0.72, y: 0.84 },
      { x: 0.96, y: 0.7 },
    ],
  },
  shallow: {
    id: 'shallow',
    label: 'Shallow',
    inletHeight: 0.32,
    weirHeight: 0.36,
    floor: [
      { x: 0.04, y: 0.72 },
      { x: 0.28, y: 0.78 },
      { x: 0.68, y: 0.79 },
      { x: 0.96, y: 0.7 },
    ],
  },
};

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
