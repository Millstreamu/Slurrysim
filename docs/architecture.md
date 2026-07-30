# Slurrysim architecture

## Goals

Slurrysim is a standalone static web application. It deliberately keeps the
simulation model independent from the DOM and canvas so physics changes can be
unit tested and the renderer can later be replaced without rewriting the model.

## Data flow

1. `ui/controls.ts` converts user input into typed `Settings`.
2. `simulation/model.ts` advances an immutable `SimulationState` in bounded time
   steps and exposes summary metrics.
3. `simulation/geometry.ts` describes normalized box profiles and interpolates
   their floors.
4. `simulation/renderer.ts` draws the latest state to a responsive canvas.
5. `main.ts` owns the animation loop and connects those modules.

Coordinates are normalized from zero to one. Rendering therefore remains
responsive while the model stays independent of display resolution.

## Geometry schema and presets

Geometry documents use schema version 1 and contain a stable `id`, display
`name`, `description`, inlet and weir heights, and a left-to-right list of floor
points. The migration helper maps the earlier unversioned `classic`, `deep`, and
`shallow` identifiers into this format. Presets cover a simple slope, symmetric
and asymmetric sumps, minimum-clearance operation, and a dense collision stress
profile in addition to the classic reference.

The validator rejects non-finite dimensions, points outside the normalized
vessel, floors that do not span both walls, and segments whose x coordinates do
not strictly increase (overlapping or backtracking segments). It also requires
0.1 normalized units between the ceiling and floor and between the floor and
each flow opening. This keeps inlet and outlet paths open. All bundled presets
are validated in data tests. Selecting any preset deliberately clears elapsed
state and starts a new deterministic batch with the current flow/material
parameters; the control states this behavior before selection.

## Current conceptual model

Each rock has position, velocity, radius, effective density, and a deterministic
eddy phase. Horizontal acceleration is based on flow rate. Vertical acceleration
combines gravity, effective density, pressure-based suspension, and a sinusoidal
turbulence term. The animation uses a 120 Hz fixed simulation step, clamps long
browser frames, and never accumulates time while paused. At most 600 particles
are retained; older entities are discarded when a release exceeds that budget.

The normalized vessel has a ceiling at `y = 0.12`, a left wall at `x = 0.04`, a
right wall/weir at `x = 0.96`, and the selected piecewise-linear rock floor.
Particles are circles. Swept motion is divided into steps no longer than half a
radius, with a 0.0005 normalized-coordinate separation tolerance. Direct or slow
floor hits settle; glancing hits slide with friction; ceiling and wall hits
deflect with damping. A particle exits only after its whole circle crosses the
right wall above the weir. Initial overlaps are projected to a valid boundary,
speed is bounded, and non-finite input values are repaired. Append
`?debugCollisions` to the URL to draw collision bounds for development.

The flow streamlines become static when `prefers-reduced-motion: reduce` is set,
while counts and positions continue to convey results. The model is deterministic:
particle properties are generated from their numeric
identifier and the same settings produce the same initial batch. This is useful
for repeatable tests, but it is not a substitute for engineering calibration.

## Future engineering work

- Obtain qualified-domain review of the scope, unit system, equation governance,
  and API strategy in
  [`engineering-specification.md`](engineering-specification.md).
- Select and cite an appropriate settling/drag model.
- Model slurry viscosity, solids concentration, and particle size distribution.
- Consider optional particle-particle collisions (vessel collisions are modeled).
- Calibrate against measured scenarios and add those scenarios as fixtures.
- Add scenario import/export without coupling serialization to the renderer.
