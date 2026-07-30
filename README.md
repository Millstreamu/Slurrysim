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

## Simulation controls

- **Geometry presets** change the box floor and weir profile.
- **Flow rate** controls the horizontal slurry current.
- **Line pressure** controls how strongly particles remain suspended.
- **Batch size** controls how many rocks are released per batch.
- **Turbulence** controls deterministic eddy forces.
- **Material density** changes effective settling acceleration.

Reset always restores the same seeded scenario. Pause stops simulation time, and
Release batch adds particles using the current settings.

The animation advances on deterministic fixed time steps, caps retained particles,
and presents static flow direction cues when reduced motion is preferred. Vessel
collision boundaries, response rules, and tolerances are documented in
[`docs/architecture.md`](docs/architecture.md). Add `?debugCollisions` to the URL
to display the normally hidden collision bounds during development.
