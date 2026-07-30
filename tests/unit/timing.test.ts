import { describe, expect, it, vi } from 'vitest';
import { advanceClock, FIXED_TIME_STEP } from '../../src/simulation/timing';

describe('fixed simulation clock', () => {
  it('produces the same updates for equivalent frame durations', () => {
    const updateA = vi.fn();
    const updateB = vi.fn();
    const clock = advanceClock(
      { accumulator: 0 },
      FIXED_TIME_STEP * 3,
      false,
      updateA,
    );
    let splitClock = { accumulator: 0 };
    for (let index = 0; index < 3; index += 1)
      splitClock = advanceClock(splitClock, FIXED_TIME_STEP, false, updateB);
    expect(updateA).toHaveBeenCalledTimes(3);
    expect(updateB).toHaveBeenCalledTimes(3);
    expect(clock.accumulator).toBeCloseTo(splitClock.accumulator);
  });

  it('does not accumulate or update while paused', () => {
    const update = vi.fn();
    const clock = advanceClock({ accumulator: 0.004 }, 1, true, update);
    expect(clock).toEqual({ accumulator: 0.004 });
    expect(update).not.toHaveBeenCalled();
  });
});
