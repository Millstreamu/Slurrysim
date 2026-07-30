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

## Current conceptual model

Each rock has position, velocity, radius, effective density, and a deterministic
eddy phase. Horizontal acceleration is based on flow rate. Vertical acceleration
combines gravity, effective density, pressure-based suspension, and a sinusoidal
turbulence term. Rocks settle when they reach the interpolated geometry floor and
overflow when they pass the right boundary.

The model is deterministic: particle properties are generated from their numeric
identifier and the same settings produce the same initial batch. This is useful
for repeatable tests, but it is not a substitute for engineering calibration.

## Future engineering work

- Define physical units and parameter ranges.
- Select and cite an appropriate settling/drag model.
- Model slurry viscosity, solids concentration, and particle size distribution.
- Add particle-wall and optional particle-particle collisions.
- Calibrate against measured scenarios and add those scenarios as fixtures.
- Add scenario import/export without coupling serialization to the renderer.
