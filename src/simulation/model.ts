import { floorAt, GEOMETRIES } from './geometry';
import type { Metrics, Particle, Settings, SimulationState } from './types';

export const DEFAULT_SETTINGS: Settings = {
  geometry: 'classic',
  flowRate: 55,
  pressure: 40,
  batchSize: 34,
  turbulence: 40,
  density: 68,
};

const clamp = (value: number, minimum: number, maximum: number): number =>
  Math.max(minimum, Math.min(maximum, value));

export function clampSettings(settings: Settings): Settings {
  return {
    ...settings,
    flowRate: clamp(settings.flowRate, 0, 100),
    pressure: clamp(settings.pressure, 0, 100),
    batchSize: Math.round(clamp(settings.batchSize, 1, 60)),
    turbulence: clamp(settings.turbulence, 0, 100),
    density: clamp(settings.density, 20, 100),
  };
}

export function createState(): SimulationState {
  return { particles: [], elapsed: 0, nextId: 1, released: 0, overflowed: 0 };
}

function hash(seed: number): number {
  const value = Math.sin(seed * 12.9898) * 43758.5453;
  return value - Math.floor(value);
}

export function releaseBatch(
  state: SimulationState,
  rawSettings: Settings,
): SimulationState {
  const settings = clampSettings(rawSettings);
  const particles: Particle[] = [];
  for (let index = 0; index < settings.batchSize; index += 1) {
    const id = state.nextId + index;
    particles.push({
      id,
      x: 0.055 + hash(id) * 0.045,
      y: 0.25 + hash(id + 11) * 0.13,
      vx: 0.02 + hash(id + 23) * 0.015,
      vy: -0.01 + hash(id + 37) * 0.02,
      radius: 0.007 + hash(id + 43) * 0.008,
      density: settings.density / 100,
      phase: hash(id + 59) * Math.PI * 2,
      settled: false,
    });
  }
  return {
    ...state,
    particles: [...state.particles, ...particles],
    nextId: state.nextId + particles.length,
    released: state.released + particles.length,
  };
}

export function stepSimulation(
  state: SimulationState,
  rawSettings: Settings,
  rawDeltaTime: number,
): SimulationState {
  const settings = clampSettings(rawSettings);
  const geometry = GEOMETRIES[settings.geometry];
  const deltaTime = clamp(rawDeltaTime, 0, 0.05);
  let overflowed = state.overflowed;
  const particles: Particle[] = [];

  for (const particle of state.particles) {
    if (particle.settled) {
      particles.push(particle);
      continue;
    }

    const floor = floorAt(geometry, particle.x) - particle.radius;
    const eddy = Math.sin(state.elapsed * 5 + particle.phase + particle.x * 8);
    const flow = 0.035 + settings.flowRate * 0.0013;
    const suspension = settings.pressure * 0.00075;
    const gravity = 0.17 + particle.density * 0.23 - suspension;
    const turbulence = (settings.turbulence / 100) * 0.075;
    const vx =
      particle.vx * 0.987 + flow * deltaTime + eddy * turbulence * deltaTime;
    const vy = particle.vy * 0.985 + (gravity + eddy * turbulence) * deltaTime;
    const x = particle.x + vx * deltaTime;
    const y = particle.y + vy * deltaTime;

    if (x > 1.02) {
      overflowed += 1;
      continue;
    }

    if (y >= floor) {
      particles.push({
        ...particle,
        x: clamp(x, 0.03, 0.97),
        y: floor,
        vx: 0,
        vy: 0,
        settled: true,
      });
    } else {
      particles.push({ ...particle, x, y: Math.max(0.12, y), vx, vy });
    }
  }

  return {
    ...state,
    particles,
    elapsed: state.elapsed + deltaTime,
    overflowed,
  };
}

export function getMetrics(state: SimulationState): Metrics {
  const settled = state.particles.filter((particle) => particle.settled).length;
  const averageTravel = state.particles.length
    ? state.particles.reduce((sum, particle) => sum + particle.x, 0) /
      state.particles.length
    : 0;
  return {
    active: state.particles.length - settled,
    settled,
    overflowed: state.overflowed,
    averageTravel,
  };
}
