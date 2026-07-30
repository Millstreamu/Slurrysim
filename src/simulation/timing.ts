export const FIXED_TIME_STEP = 1 / 120;
export const MAX_FRAME_TIME = 0.1;

export interface SimulationClock {
  accumulator: number;
}

export function advanceClock(
  clock: SimulationClock,
  frameSeconds: number,
  paused: boolean,
  update: (step: number) => void,
): SimulationClock {
  if (paused) return clock;
  let accumulator =
    clock.accumulator + Math.max(0, Math.min(MAX_FRAME_TIME, frameSeconds));
  while (accumulator >= FIXED_TIME_STEP) {
    update(FIXED_TIME_STEP);
    accumulator -= FIXED_TIME_STEP;
  }
  return { accumulator };
}
