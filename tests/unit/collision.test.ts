import { describe, expect, it } from 'vitest';
import {
  COLLISION_TOLERANCE,
  createState,
  DEFAULT_SETTINGS,
  stepSimulation,
} from '../../src/simulation/model';
import type { Particle, SimulationState } from '../../src/simulation/types';

const particle = (overrides: Partial<Particle>): Particle => ({
  id: 1,
  x: 0.5,
  y: 0.5,
  vx: 0,
  vy: 0,
  radius: 0.01,
  density: 0.5,
  phase: 0,
  settled: false,
  collisions: 0,
  ...overrides,
});
const withParticle = (value: Particle): SimulationState => ({
  ...createState(),
  particles: [value],
  nextId: 2,
  released: 1,
});

describe('vessel collisions', () => {
  it('settles a direct floor hit outside the solid', () => {
    const next = stepSimulation(
      withParticle(particle({ y: 0.88, vy: 1 })),
      DEFAULT_SETTINGS,
      0.05,
    );
    expect(next.particles[0]?.settled).toBe(true);
    expect(next.particles[0]?.y).toBeLessThanOrEqual(
      0.89 - COLLISION_TOLERANCE,
    );
  });

  it('slides a glancing floor hit', () => {
    const next = stepSimulation(
      withParticle(particle({ y: 0.887, vx: 1, vy: 0.1 })),
      DEFAULT_SETTINGS,
      0.05,
    );
    expect(next.particles[0]?.settled).toBe(false);
    expect(next.particles[0]?.vx).toBeGreaterThan(0);
    expect(next.particles[0]?.collisions).toBeGreaterThan(0);
  });

  it('deflects from a wall/floor corner without invalid values', () => {
    const next = stepSimulation(
      withParticle(particle({ x: 0.95, y: 0.7, vx: 1, vy: 1 })),
      DEFAULT_SETTINGS,
      0.05,
    );
    const result = next.particles[0];
    expect(result?.x).toBeLessThan(0.95);
    expect(
      [result?.x, result?.y, result?.vx, result?.vy].every(Number.isFinite),
    ).toBe(true);
  });

  it('resolves an initial wall overlap', () => {
    const next = stepSimulation(
      withParticle(particle({ x: -1 })),
      DEFAULT_SETTINGS,
      0.01,
    );
    expect(next.particles[0]?.x).toBeGreaterThanOrEqual(0.05);
  });

  it('uses substeps to prevent high-speed tunnelling', () => {
    const next = stepSimulation(
      withParticle(particle({ x: 0.9, y: 0.5, vx: 100 })),
      DEFAULT_SETTINGS,
      0.05,
    );
    expect(next.particles[0]?.x).toBeLessThan(0.95);
    expect(next.particles[0]?.vx).toBeLessThan(0);
  });

  it('allows a complete crossing through the outlet aperture', () => {
    const next = stepSimulation(
      withParticle(particle({ x: 0.94, y: 0.2, vx: 1 })),
      DEFAULT_SETTINGS,
      0.05,
    );
    expect(next.particles).toHaveLength(0);
    expect(next.overflowed).toBe(1);
  });
});
