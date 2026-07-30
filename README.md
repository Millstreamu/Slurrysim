# Slurrysim

A lightweight, browser-based rock box and slurry settling simulation. Slurrysim
uses a deterministic two-dimensional particle model so scenarios can be replayed,
tested, and improved without a server or heavyweight application framework.

> **Engineering status:** The current physics are a conceptual visual model, not
> a validated engineering calculation. Do not use its output for equipment design
> or safety decisions until the equations and parameters have been independently
> reviewed and calibrated.

## Open in GitHub Codespaces

1. Select **Code → Codespaces → Create codespace on main** in GitHub.
2. Wait for the container to run `npm ci` and install Chromium.
3. Run `npm run dev` if the development server is not already running.
4. Open the forwarded **Slurrysim (5173)** port.

## Local development

Slurrysim requires Node.js 20.19 or newer.

```bash
npm ci
npm run dev
```

Vite serves the app at <http://localhost:5173>. The production application is a
set of static files and can be hosted on any static web server.

## Validation

```bash
npm run format
npm run lint
npm run typecheck
npm test
npm run build
npm run test:e2e
```

Run every check with `npm run validate`. Install the Playwright browser once with
`npx playwright install --with-deps chromium` before the end-to-end suite.

## Project layout

- `src/simulation/` contains the typed, deterministic simulation model.
- `src/ui/` connects accessible controls to application state.
- `src/styles/` contains the design tokens and responsive application styles.
- `tests/` contains unit and browser-level tests.
- The legacy image assets at the repository root preserve the original interface
  mockups unchanged, avoiding binary-file changes in pull requests.
- `docs/architecture.md` documents the model, assumptions, and extension points.
- `docs/engineering-specification.md` defines the proposed Phase 3 scope, units,
  equation-governance gates, and unit-safe API strategy. Its domain-review status
  is pending; it does not make the prototype engineering-valid.

## Simulation controls

- **Geometry presets** provide six named, validated profiles for baseline,
  symmetric, asymmetric, narrow-clearance, and stress comparisons. Selecting a
  preset starts a fresh deterministic batch with the current parameters.
- **Custom shape editor** creates an editable copy of the selected preset. In
  edit mode, click the diagram to select/move the nearest floor point on a 0.01
  grid, or use the keyboard-operable X/Y fields. Points can be added, deleted,
  reordered by position, undone/redone, and reset to the preset. Live validation
  disables **Use geometry & simulate** until errors are fixed.
- **Flow rate** controls the horizontal slurry current.
- **Line pressure** controls how strongly particles remain suspended.
- **Batch size** controls how many rocks are released per batch.
- **Turbulence** controls deterministic eddy forces.
- **Material density** changes effective settling acceleration.

Each conceptual parameter has a synchronized slider and numeric field. Numeric
edits commit on Enter or blur, snap to the documented step, and remain uncommitted
with an inline error when empty, non-numeric, or outside the stated range. The
fields use a period as the decimal separator (HTML number-input convention).

Open **Keyboard help** (or press `?` outside a form control) for all shortcuts.
`Space` pauses/resumes, `R` resets the run, and `B` releases a batch. Native Tab,
Shift+Tab, arrow-key, and editor button/field behavior remains available.

The results panel reports cumulative particle counts and fractions, elapsed
simulation seconds, and average cumulative rates in particles/second. A dash is
shown when a fraction or rate has no valid denominator. These metrics are
illustrative and are not engineering validated.

Reset always restores the same seeded scenario. Pause stops simulation time, and
Release batch adds particles using the current settings.

The animation advances on deterministic fixed time steps, caps retained particles,
and presents static flow direction cues when reduced motion is preferred. Vessel
collision boundaries, response rules, and tolerances are documented in
[`docs/architecture.md`](docs/architecture.md). Add `?debugCollisions` to the URL
to display the normally hidden collision bounds during development.
