import { describe, expect, it } from 'vitest';
import {
  clampSettings,
  createState,
  DEFAULT_SETTINGS,
  getMetrics,
  releaseBatch,
  stepSimulation,
} from '../../src/simulation/model';

describe('simulation model', () => {
  it('creates deterministic batches', () => {
    const first = releaseBatch(createState(), DEFAULT_SETTINGS);
    const second = releaseBatch(createState(), DEFAULT_SETTINGS);
    expect(first).toEqual(second);
    expect(first.particles).toHaveLength(DEFAULT_SETTINGS.batchSize);
  });

  it('clamps values to supported ranges', () => {
    expect(
      clampSettings({
        ...DEFAULT_SETTINGS,
        flowRate: 120,
        pressure: -5,
        batchSize: 3.6,
        density: 1,
      }),
    ).toMatchObject({ flowRate: 100, pressure: 0, batchSize: 4, density: 20 });
  });

  it('moves particles forward while preserving valid state', () => {
    const initial = releaseBatch(createState(), {
      ...DEFAULT_SETTINGS,
      batchSize: 1,
    });
    const next = stepSimulation(initial, DEFAULT_SETTINGS, 0.02);
    expect(next.elapsed).toBeCloseTo(0.02);
    expect(next.particles[0]?.x).toBeGreaterThan(initial.particles[0]?.x ?? 0);
    expect(next.particles[0]?.y).toBeGreaterThanOrEqual(0.12);
  });

  it('limits very large time steps for stable animation', () => {
    const next = stepSimulation(createState(), DEFAULT_SETTINGS, 10);
    expect(next.elapsed).toBe(0.05);
  });

  it('reports settled and overflow metrics', () => {
    const state = {
      ...createState(),
      overflowed: 2,
      released: 4,
      elapsed: 2,
      particles: [
        {
          id: 1,
          x: 0.5,
          y: 0.8,
          vx: 0,
          vy: 0,
          radius: 0.01,
          density: 0.5,
          phase: 0,
          settled: true,
          collisions: 1,
        },
        {
          id: 2,
          x: 0.3,
          y: 0.4,
          vx: 0.1,
          vy: 0.1,
          radius: 0.01,
          density: 0.5,
          phase: 1,
          settled: false,
          collisions: 0,
        },
      ],
    };
    expect(getMetrics(state)).toEqual({
      active: 1,
      settled: 1,
      overflowed: 2,
      averageTravel: 0.4,
      elapsedSeconds: 2,
      released: 4,
      retained: 2,
      discarded: 0,
      settlingFraction: 0.25,
      overflowFraction: 0.5,
      settlingRate: 0.5,
      overflowRate: 1,
    });
  });

  it('uses explicit empty metric states and conserves particle accounting', () => {
    const empty = getMetrics(createState());
    expect(empty.settlingFraction).toBeNull();
    expect(empty.overflowRate).toBeNull();

    let state = createState();
    for (let index = 0; index < 11; index += 1)
      state = releaseBatch(state, { ...DEFAULT_SETTINGS, batchSize: 60 });
    const metrics = getMetrics(state);
    expect(metrics.released).toBe(
      metrics.retained + metrics.overflowed + metrics.discarded,
    );
    expect(metrics.discarded).toBe(60);
  });
});
