export type GeometryId = 'classic' | 'deep' | 'shallow';

export interface Point {
  x: number;
  y: number;
}

export interface Geometry {
  id: GeometryId;
  label: string;
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
}

export interface Metrics {
  active: number;
  settled: number;
  overflowed: number;
  averageTravel: number;
}
