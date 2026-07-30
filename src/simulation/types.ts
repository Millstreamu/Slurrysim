export type GeometryId =
  | 'custom'
  | 'classic'
  | 'simple-slope'
  | 'deep-symmetric'
  | 'asymmetric'
  | 'narrow-clearance'
  | 'stress-test';

export interface Point {
  x: number;
  y: number;
}

/** Serializable geometry schema. Increment when stored geometry meaning changes. */
export interface Geometry {
  schemaVersion: 1;
  id: GeometryId;
  name: string;
  description: string;
  floor: readonly Point[];
  inletHeight: number;
  weirHeight: number;
}

export interface Settings {
  geometry: GeometryId;
  flowRate: number;
  pressure: number;
  batchSize: number;
  turbulence: number;
  density: number;
}

export interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  density: number;
  phase: number;
  settled: boolean;
  collisions: number;
}

export interface SimulationState {
  particles: readonly Particle[];
  elapsed: number;
  nextId: number;
  released: number;
  overflowed: number;
  /** Particles removed only to enforce the visualization resource cap. */
  discarded: number;
}

export interface Metrics {
  active: number;
  settled: number;
  overflowed: number;
  averageTravel: number;
  elapsedSeconds: number;
  released: number;
  retained: number;
  discarded: number;
  settlingFraction: number | null;
  overflowFraction: number | null;
  settlingRate: number | null;
  overflowRate: number | null;
}
