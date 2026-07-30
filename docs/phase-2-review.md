# Phase 2 review gate

Review date: 2026-07-30. Phase 2 is an interactive conceptual prototype, not an
engineering calculation.

## Metric definitions

- **In motion** and **settled** are instantaneous retained-particle counts.
- **Overflowed** is the cumulative count that crossed the outlet.
- **Settling/overflow fraction** is the respective cumulative count divided by
  all particles released. A dash represents an empty denominator.
- **Settling/overflow rate** is the respective cumulative count divided by
  elapsed simulation seconds. It is an average cumulative rate, not an
  instantaneous rate; a dash represents zero elapsed time.
- Resource-cap discards are tracked separately in the model so released equals
  retained plus overflowed plus discarded. They are not falsely classified as
  overflow.

Displayed fractions round to one decimal percentage point, rates to two decimal
particles/second, and elapsed time to one decimal second. Reset, preset changes,
and accepted editor changes begin a fresh clock and accumulator. Pause freezes
simulation time.

## Manual accessibility and responsive checklist

- [x] Keyboard-only: logical Tab order, editor operations, shortcuts dialog,
      Escape/Close, and focus restoration checked.
- [x] Semantics: headings, landmarks, labels, descriptions, dialog name,
      validation text, restrained action announcements, and canvas alternative name
      checked; animation frames are not announced.
- [x] Visible focus and no focus traps checked in normal and editor modes.
- [x] Reduced-motion behavior checked using the operating-system preference.
- [x] Browser accessibility automation checked with axe-core.
- [x] Portrait phone (390 × 844), tablet (820 × 1180), desktop (1440 × 1000),
      and landscape phone (844 × 390) checked without horizontal page overflow.
- [x] 200% zoom/reflow and touch-sized primary actions checked.
- [x] Geometry remains normalized and pointer coordinates use the canvas's live
      bounding rectangle across resizing and orientation changes.

## Versioned Phase 3 regression scenarios

The following schema-v1 scenarios use seed behavior derived from particle IDs
and start with a single released batch. Record cumulative metrics at 10.0
simulation seconds (fixed 1/120-second steps) for future comparison:

| ID                           | Geometry           | Flow | Pressure | Batch | Turbulence | Density |
| ---------------------------- | ------------------ | ---: | -------: | ----: | ---------: | ------: |
| `p2-classic-default-v1`      | `classic`          |   55 |       40 |    34 |         40 |      68 |
| `p2-deep-low-flow-v1`        | `deep-symmetric`   |   20 |       25 |    34 |         20 |      80 |
| `p2-asymmetric-high-flow-v1` | `asymmetric`       |   90 |       70 |    60 |         75 |      40 |
| `p2-narrow-stress-v1`        | `narrow-clearance` |  100 |      100 |    60 |        100 |     100 |

## Review outcome and deferrals

All P2 controls are keyboard reachable, bundled geometry remains validated,
collision coverage includes boundary and tunneling cases, and responsive browser
tests cover narrow, medium, and wide layouts. No critical Phase 2 defects remain.

Deferred to Phase 3: physical units, externally validated equations, calibrated
material properties, uncertainty bounds, and engineering-grade rate definitions.
The current percentage controls and all calculated results therefore retain
explicit conceptual/not-validated labeling.
