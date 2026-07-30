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

export const MAX_PARTICLES = 600;
export const COLLISION_TOLERANCE = 0.0005;
const LEFT_WALL = 0.04;
const RIGHT_WALL = 0.96;
const SURFACE_FRICTION = 0.82;
const MAX_SPEED = 1.5;

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
      collisions: 0,
    });
  }
  return {
    ...state,
    particles: [...state.particles, ...particles].slice(-MAX_PARTICLES),
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
  const deltaTime = clamp(
    Number.isFinite(rawDeltaTime) ? rawDeltaTime : 0,
    0,
    0.05,
  );
  let overflowed = state.overflowed;
  const particles: Particle[] = [];

  for (const particle of state.particles) {
    if (particle.settled) {
      particles.push(particle);
      continue;
    }

    const eddy = Math.sin(state.elapsed * 5 + particle.phase + particle.x * 8);
    const flow = 0.035 + settings.flowRate * 0.0013;
    const suspension = settings.pressure * 0.00075;
    const gravity = 0.17 + particle.density * 0.23 - suspension;
    const turbulence = (settings.turbulence / 100) * 0.075;
    let vx =
      particle.vx * 0.987 + flow * deltaTime + eddy * turbulence * deltaTime;
    let vy = particle.vy * 0.985 + (gravity + eddy * turbulence) * deltaTime;
    vx = clamp(Number.isFinite(vx) ? vx : 0, -MAX_SPEED, MAX_SPEED);
    vy = clamp(Number.isFinite(vy) ? vy : 0, -MAX_SPEED, MAX_SPEED);

    // Substeps keep a fast particle from tunnelling through a thin boundary.
    const distance = Math.hypot(vx, vy) * deltaTime;
    const substeps = Math.max(
      1,
      Math.ceil(distance / Math.max(particle.radius * 0.5, 0.002)),
    );
    const step = deltaTime / substeps;
    let x = Number.isFinite(particle.x)
      ? particle.x
      : LEFT_WALL + particle.radius;
    let y = Number.isFinite(particle.y) ? particle.y : geometry.inletHeight;
    let collisions = particle.collisions ?? 0;
    let settled = false;
    let exited = false;

    for (let index = 0; index < substeps; index += 1) {
      x += vx * step;
      y += vy * step;

      const minimumX = LEFT_WALL + particle.radius;
      if (x < minimumX) {
        x = minimumX + COLLISION_TOLERANCE;
        vx = Math.abs(vx) * SURFACE_FRICTION;
        collisions += 1;
      }
      const ceiling = 0.12 + particle.radius;
      if (y < ceiling) {
        y = ceiling + COLLISION_TOLERANCE;
        vy = Math.abs(vy) * SURFACE_FRICTION;
        collisions += 1;
      }

      const canExit = y + particle.radius <= geometry.weirHeight;
      if (canExit && x - particle.radius > RIGHT_WALL) {
        exited = true;
        break;
      }
      if (!canExit && x > RIGHT_WALL - particle.radius) {
        x = RIGHT_WALL - particle.radius - COLLISION_TOLERANCE;
        vx = -Math.abs(vx) * SURFACE_FRICTION;
        collisions += 1;
      }

      const floor = floorAt(geometry, x) - particle.radius;
      if (y >= floor - COLLISION_TOLERANCE) {
        y = floor - COLLISION_TOLERANCE;
        collisions += 1;
        // A direct/slow hit settles; a glancing hit slides along the rock face.
        if (Math.abs(vy) > Math.abs(vx) * 0.45 || Math.hypot(vx, vy) < 0.04) {
          vx = 0;
          vy = 0;
          settled = true;
          break;
        }
        vx *= SURFACE_FRICTION;
        vy = -Math.abs(vy) * 0.12;
      }
    }

    if (exited) overflowed += 1;
    else particles.push({ ...particle, x, y, vx, vy, settled, collisions });
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
