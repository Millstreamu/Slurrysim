# Slurry Rock Box Simulator Roadmap

<!-- markdownlint-configure-file { "MD024": { "siblings_only": true } } -->

This document turns the requested Phase 2 and Phase 3 work into a sequence of
small, reviewable implementation chats. Each work item includes its goal,
dependencies, expected deliverables, and a ready-to-use prompt for a future
chat.

## How to use this roadmap

1. Start with the preparation chat below. It establishes a testable development
   baseline before simulator behavior changes begin.
2. Complete work items in their listed order unless the dependency notes say
   they can safely be run in parallel.
3. In each new chat, paste the work item's **Call-in prompt**. Ask the agent to
   update this roadmap by checking the item off when its acceptance criteria are
   met.
4. Require every implementation chat to inspect the repository first, preserve
   existing behavior unless the item intentionally changes it, and run the full
   install/lint/type-check/test suite before committing.
5. Treat Phase 2 output as an interactive product prototype. Do not present its
   calculations as engineering-grade until all Phase 3 validation gates pass.

## Definition of done for every implementation chat

- [ ] The change is scoped to one roadmap item (or an explicitly named group).
- [ ] User-visible behavior and edge cases have automated tests where practical.
- [ ] Dependencies and setup instructions are committed rather than installed
      only in the agent's temporary environment.
- [ ] Accessibility is checked for any new or modified interactive control.
- [ ] The full relevant install, lint, type-check, build, and test commands pass.
- [ ] Documentation describes new controls, assumptions, units, or data formats.
- [ ] A runnable web-app change is visually reviewed at desktop and mobile sizes,
      with screenshots supplied in the implementation chat.
- [ ] The implementation is committed and its pull-request summary clearly lists
      validation results and any remaining limitations.

## Preparation — Establish a maintainable baseline

### P0. Make the current artifact runnable and testable

**Status:** Complete (2026-07-30).

The maintained source of truth is the TypeScript application under `src/`. A
clean checkout is installed with `npm ci`, and `npm run validate` runs formatting,
linting, type-checking, unit tests, the production build, and Playwright browser
tests. The setup and validation workflow is documented in `README.md`, and the
browser smoke coverage is in `tests/e2e/simulator.spec.ts`.

The initial UI was visually reviewed at 1440 × 1000 (desktop) and 390 × 844
(mobile). Screenshots are kept as review artifacts rather than committed because
the pull-request workflow does not support binary-file diffs.

**Goal:** Identify the actual source format and establish a reproducible local
development workflow before feature work. The repository currently needs an
explicit source-of-truth, setup command, and validation commands.

#### Deliverables

- A documented source-of-truth for the simulator (not an opaque generated or
  binary artifact).
- Reproducible dependency installation and development-server commands.
- Linting, formatting, type-checking where applicable, a production build, and
  a browser-capable test runner.
- A small smoke test proving that the simulator loads and its primary controls
  can be operated.
- Updated contributor/setup documentation.

#### Acceptance criteria

- A clean checkout can install dependencies and run the app using only committed
  instructions and configuration.
- The full validation suite is available as clearly named commands and passes in
  the Codex cloud environment.
- The initial UI has a captured baseline screenshot at desktop and mobile widths.

#### Call-in prompt

> Complete roadmap item P0 in `ROADMAP.md`. First inspect the repository and
> determine the real source format and current runnable path. Establish a
> reproducible, testable development baseline without redesigning the simulator.
> Add committed dependency/configuration files, setup documentation, lint and
> type-check commands where applicable, a production build, and a browser smoke
> test. Run the complete validation suite, capture desktop and mobile baseline
> screenshots, update the P0 checkbox/status in the roadmap, commit the work, and
> prepare a pull request.

---

## Phase 2 — Improve simulator behavior

### Phase 2 recommended sequence

`P2.1 visualization foundation` → `P2.2 collisions` → `P2.3 presets` →
`P2.4 custom editor` → `P2.5 accessible controls` → `P2.6 numeric inputs` →
`P2.7 calculated metrics` → `P2.8 responsive polish` → `P2.9 phase review`

Accessibility and responsive checks apply throughout the phase; their dedicated
items provide a final systematic pass rather than postponing those concerns.

### P2.1 Refine slurry-flow visualization

**Goal:** Make motion, direction, concentration, and simulator state easier to
understand while keeping animation stable and performant.

#### Deliverables

- A documented visual model for slurry particles/streamlines, inlet flow,
  settling, and outlet flow.
- Stable animation timing that is independent of display refresh rate.
- Clear running, paused, reset, empty, and overloaded states.
- Performance safeguards such as a bounded particle count and cleanup of
  off-screen entities.
- A reduced-motion presentation that preserves the information conveyed by
  animation.

#### Acceptance criteria

- Repeated runs with the same scenario and seed produce deterministic results,
  or any intended randomness is documented and controllable.
- Pause/resume does not advance simulation time while paused, and reset restores
  a known initial state.
- Automated tests cover state transitions and animation/update logic separately
  from rendering.
- Visual review covers both normal and reduced-motion settings.

#### Call-in prompt

> Complete roadmap item P2.1 in `ROADMAP.md`. Refine the slurry-flow
> visualization and its simulation update loop so direction, concentration,
> settling, and overflow are understandable. Make timing stable, bound resource
> use, support reduced motion, and make runs deterministic where practical.
> Separate testable simulation state from rendering, add automated tests, run the
> full validation suite, visually review desktop and mobile behavior, update the
> roadmap, commit the work, and prepare a pull request.

### P2.2 Add rock/slurry collision behavior

**Depends on:** P2.1.

**Goal:** Have slurry respond predictably to rock and vessel boundaries rather
than visually passing through solid geometry.

#### Deliverables

- Collision detection for rock surfaces, walls, floor, inlet, and outlet as
  appropriate to the conceptual model.
- A documented collision response (slide, deflect, stop, settle, or exit) with
  tolerances and boundary rules.
- Protection against tunneling, trapped particles, NaN values, and runaway
  velocities.
- Debug visualization that can be enabled during development without appearing
  in the normal user experience.

#### Acceptance criteria

- Unit tests exercise direct hits, glancing hits, corners, high-speed steps,
  initial overlap, and outlet crossings.
- Integration tests demonstrate that particles do not persist inside solid
  geometry beyond the documented tolerance.
- Collision behavior remains deterministic for a fixed scenario and seed.

#### Call-in prompt

> Complete roadmap item P2.2 in `ROADMAP.md`. Implement deterministic collision
> behavior between slurry, rocks, and applicable vessel boundaries. Document the
> conceptual collision rules and tolerances, prevent tunneling and invalid
> states, and add an optional developer debug view. Add focused unit and
> integration tests for direct, glancing, corner, overlap, high-speed, and outlet
> cases. Run the complete validation suite, visually verify the behavior, update
> the roadmap, commit the work, and prepare a pull request.

### P2.3 Improve geometry presets

**Depends on:** P2.2.

**Goal:** Provide useful, named rock-box configurations that are valid,
repeatable, and easy to compare.

#### Deliverables

- A versioned schema for geometry, with stable identifiers and human-readable
  preset names/descriptions.
- A representative set of presets covering simple, symmetric, asymmetric,
  narrow-clearance, and stress-test configurations.
- Geometry validation for bounds, overlap, minimum clearance, inlet/outlet
  obstruction, and invalid dimensions.
- Preset selection that resets or intentionally preserves simulation state, with
  that behavior made explicit to the user.

#### Acceptance criteria

- Every bundled preset passes the geometry validator and loads without runtime
  warnings.
- Snapshot/data tests protect preset definitions and schema migration behavior.
- Presets remain usable at supported viewport sizes.

#### Call-in prompt

> Complete roadmap item P2.3 in `ROADMAP.md`. Define and document a versioned
> geometry schema, improve the bundled rock-box presets, and implement robust
> validation for bounds, overlap, clearances, dimensions, and blocked flow paths.
> Make preset-switch state behavior explicit. Add data/schema tests for every
> preset and any migration logic, run the full validation suite, visually review
> all presets, update the roadmap, commit the work, and prepare a pull request.

### P2.4 Add the custom shape editor

**Depends on:** P2.3.

**Goal:** Let users create, edit, validate, and reset custom rock geometry
without allowing unusable scenarios.

#### Deliverables

- Add, select, move, resize, reorder where relevant, and delete operations.
- Grid/snapping or precise coordinate controls, undo/redo, and reset-to-preset.
- Live validation using the P2.3 rules, with actionable inline error messages.
- A clear separation between edit mode and simulation mode.
- Keyboard-operable editing and screen-reader names/instructions for all tools.

#### Acceptance criteria

- Invalid geometry cannot silently start a simulation.
- Undo/redo covers all editor mutations and behaves correctly after a new edit.
- Editor state round-trips through the geometry schema without loss.
- Automated interaction tests cover pointer and keyboard workflows.

#### Call-in prompt

> Complete roadmap item P2.4 in `ROADMAP.md`. Build a custom geometry editor on
> the versioned schema and validator. Support add/select/move/resize/delete,
> precise positioning or snapping, undo/redo, reset, live errors, and explicit
> edit versus simulation modes. Ensure full keyboard and screen-reader
> operability. Add state, round-trip, pointer, and keyboard interaction tests;
> run all validation; capture desktop and mobile screenshots; update the
> roadmap; commit the work; and prepare a pull request.

### P2.5 Add accessible keyboard controls

**Can overlap with:** P2.6 after its control contract is agreed.

**Goal:** Make the complete simulator operable and understandable without a
pointer.

#### Deliverables

- Logical focus order, visible focus indicators, semantic names, instructions,
  and status announcements.
- Documented shortcuts for run/pause, reset, parameter adjustment, and editor
  operations, avoiding browser and assistive-technology conflicts.
- A discoverable shortcuts/help panel and a way to dismiss it.
- Correct focus restoration after dialogs, resets, mode changes, and deletion.

#### Acceptance criteria

- All functionality is keyboard reachable with no focus traps.
- Automated accessibility checks pass, and keyboard paths have interaction tests.
- Dynamic status messages are informative but do not announce every animation
  frame.
- A manual checklist covers keyboard-only use, zoom, reduced motion, and common
  screen-reader semantics.

#### Call-in prompt

> Complete roadmap item P2.5 in `ROADMAP.md`. Audit the entire simulator and make
> every function keyboard operable. Add logical focus management, visible focus,
> semantic labels, restrained live-region announcements, conflict-free
> shortcuts, and a discoverable help panel. Add automated accessibility and
> keyboard interaction tests plus a documented manual audit. Run the full
> validation suite, update the roadmap, commit the work, and prepare a pull
> request.

### P2.6 Add numeric inputs alongside sliders

**Goal:** Allow precise parameter entry while keeping sliders and numeric fields
synchronized and accessible.

#### Deliverables

- A reusable paired slider/number control with one authoritative value.
- Visible labels and units plus documented minimum, maximum, step, and default
  values.
- Sensible handling of temporary edit states, empty values, pasted text,
  out-of-range values, decimals, and locale expectations.
- No unexpected simulation reset while a user is typing.

#### Acceptance criteria

- Changes in either control update the other and the simulator exactly once.
- Boundary, rounding, keyboard, invalid-input, and reset behavior is tested.
- Errors are conveyed in text and associated with the relevant field.

#### Call-in prompt

> Complete roadmap item P2.6 in `ROADMAP.md`. Add accessible numeric inputs next
> to every parameter slider using a reusable synchronized control. Document
> labels, conceptual units, bounds, steps, defaults, parsing, rounding, and
> commit-on-edit behavior. Handle invalid and temporary input states without
> disruptive resets. Add component and integration tests, run the complete
> validation suite, visually review responsive layouts, update the roadmap,
> commit the work, and prepare a pull request.

### P2.7 Display calculated settling and overflow metrics

**Depends on:** P2.1 and a stable conceptual parameter model. Phase 2 metrics
must be labeled as illustrative until Phase 3 equations are validated.

**Goal:** Summarize the current run with understandable, reproducible conceptual
metrics.

#### Deliverables

- Definitions for conceptual settling fraction/rate, overflow fraction/rate,
  elapsed simulation time, and relevant particle counts.
- A tested metrics accumulator that distinguishes instantaneous, interval, and
  cumulative values.
- A results panel with units or dimensionless labels, rounding rules, empty
  states, and an explicit “conceptual/not engineering validated” notice.
- Metrics that respond correctly to pause, reset, preset changes, and editor
  changes.

#### Acceptance criteria

- Hand-constructed deterministic scenarios produce known metric values.
- Conservation/accounting tests reconcile active, settled, and exited particles
  within documented rules.
- Displayed values never show NaN or Infinity and remain readable at 200% zoom.

#### Call-in prompt

> Complete roadmap item P2.7 in `ROADMAP.md`. Define and display reproducible
> conceptual settling and overflow metrics, including time basis, counting
> rules, units/dimensionless status, and rounding. Keep calculation logic
> separate from presentation and label results as illustrative pending Phase 3
> validation. Add deterministic expected-value and conservation tests, cover all
> lifecycle transitions, run the full validation suite, update the roadmap,
> commit the work, and prepare a pull request.

### P2.8 Improve responsive behavior

**Depends on:** P2.4–P2.7 so all final controls are available to test.

**Goal:** Make simulation, editing, controls, and results usable across phones,
tablets, desktops, zoomed layouts, and touch devices.

#### Deliverables

- Intentional layout modes based on available space rather than a single device.
- A simulation viewport that preserves geometry proportions and pointer-coordinate
  accuracy while resizing.
- Touch-sized targets, non-overlapping panels, readable metrics, and controls
  that do not cause horizontal page scrolling.
- Handling for orientation changes and narrow/short viewports.

#### Acceptance criteria

- Automated viewport tests cover representative narrow, medium, and wide sizes.
- Manual review covers landscape phone, portrait phone, tablet, desktop, 200%
  browser zoom, and touch emulation.
- Resizing does not mutate scenario geometry or corrupt simulation state.
- Before/after screenshots document each representative layout.

#### Call-in prompt

> Complete roadmap item P2.8 in `ROADMAP.md`. Perform a responsive-design pass
> across the simulator, editor, controls, help, and results. Preserve simulation
> geometry and coordinate accuracy across layout changes; support narrow and
> short screens, orientation changes, touch targets, and 200% zoom without
> horizontal page scrolling. Add automated viewport/state tests, run all
> validation, capture representative screenshots, update the roadmap, commit
> the work, and prepare a pull request.

### P2.9 Phase 2 review gate

**Goal:** Verify that the prototype is coherent before physical-equation work
changes its domain model.

#### Acceptance criteria

- All P2 items and their tests are complete.
- No critical accessibility, collision, geometry, or responsive defects remain.
- Conceptual metrics and controls are consistently marked and documented.
- A versioned set of representative scenarios is recorded for Phase 3 regression
  comparisons.

#### Call-in prompt

> Run the Phase 2 review gate in `ROADMAP.md`. Do not add major features. Audit
> every Phase 2 acceptance criterion, execute the complete validation suite,
> manually review keyboard/accessibility and representative responsive layouts,
> and record reproducible scenarios for Phase 3 comparisons. Fix in-scope
> regressions, document deferred issues, update the roadmap, commit any changes,
> and prepare a pull request when changes were required.

---

## Phase 3 — Engineering validation

### Phase 3 recommended sequence

`P3.1 scope, units, and assumptions` → `P3.2 property model` →
`P3.3 settling-model selection` → `P3.4 implementation` →
`P3.5 fixtures and calibration` → `P3.6 scenario exchange` →
`P3.7 charts and summaries` → `P3.8 validation review`

Phase 3 should involve a qualified domain reviewer. Passing software tests alone
does not establish engineering validity.

### P3.1 Define scope, units, assumptions, and equation governance

**Goal:** Establish the simulator's valid engineering domain before replacing
conceptual parameters.

#### Deliverables

- A glossary and canonical unit system, with every input/output dimension stated.
- Supported ranges and explicit out-of-scope conditions.
- Documented assumptions such as particle shape/distribution, fluid regime,
  concentration effects, temperature, steady versus transient flow, wall effects,
  and how the 2D visualization relates to physical geometry.
- A requirements-to-equations traceability table with primary-source citations,
  equation identifiers, symbol definitions, validity ranges, and reviewer status.
- A unit-aware internal API strategy that prevents incompatible quantities from
  being combined.

#### Acceptance criteria

- Every current control and metric maps to a defined physical quantity or is
  explicitly removed/retained as visualization-only.
- No equation enters production code without a cited source, applicability check,
  test strategy, and named review status.
- A qualified domain reviewer can approve or comment on the assumptions as a
  standalone document.

#### Call-in prompt

> Complete roadmap item P3.1 in `ROADMAP.md`. Before changing calculations,
> create an engineering specification defining simulator scope, canonical units,
> symbols, supported ranges, exclusions, physical and visualization assumptions,
> and how each current parameter/metric maps to a physical quantity. Build an
> equation traceability table using primary authoritative sources and record
> review status without claiming validation prematurely. Define a unit-safe
> internal API and test plan, update the roadmap, run documentation checks, commit
> the work, and prepare a pull request.

### P3.2 Add fluid and particle properties

**Depends on:** P3.1.

**Goal:** Represent the physical inputs needed by the selected engineering
models, with unit conversion and validation.

#### Deliverables

- Fluid properties such as density and dynamic/kinematic viscosity, with
  temperature handling if supported by the approved scope.
- Particle properties such as density, representative diameter or distribution,
  shape/sphericity where supported, and solids concentration.
- Explicit SI storage plus clearly labeled input/display conversions.
- Preset materials with documented sources and an explicit way to override them.
- Range validation that distinguishes invalid values from values outside a
  model's validated applicability.

#### Acceptance criteria

- Unit conversion has round-trip and dimensional tests.
- Boundary and invalid-value tests cover each property.
- Preset values include provenance and do not imply precision beyond their
  sources.

#### Call-in prompt

> Complete roadmap item P3.2 in `ROADMAP.md` according to the approved P3.1
> specification. Add unit-safe fluid and particle property models, UI controls,
> validation, conversions, and sourced material presets. Store canonical SI
> values, distinguish invalid inputs from model-applicability warnings, and avoid
> overstated precision. Add unit, conversion, boundary, provenance, and UI tests;
> run the full validation suite; update the roadmap; commit the work; and prepare
> a pull request.

### P3.3 Select and specify the settling model

**Depends on:** P3.1 and P3.2.

**Goal:** Make a reviewable model choice rather than silently encoding one
correlation.

#### Deliverables

- A comparison of candidate settling approaches appropriate to the approved
  regime (for example isolated-particle and hindered-settling models).
- Selection criteria covering Reynolds number, concentration, particle shape,
  wall effects, inputs, computational cost, and evidence quality.
- A decision record naming the selected model(s), equations, coefficients,
  transitions/iteration method, convergence criteria, validity limits, and
  expected failure/warning behavior.
- Worked examples with independently calculated expected results.
- Written sign-off or clearly recorded pending review by a qualified domain
  reviewer.

#### Acceptance criteria

- The model choice is traceable to primary sources and the P3.1 assumptions.
- Worked examples cover each applicable regime and boundary/transition.
- Implementation cannot begin under the roadmap until review status is recorded.

#### Call-in prompt

> Complete roadmap item P3.3 in `ROADMAP.md`. Research and compare settling
> models applicable to the approved P3.1 scope and P3.2 properties, relying on
> primary authoritative sources. Write a decision record with full equations,
> symbol definitions, coefficient provenance, regime and validity checks,
> numerical method, convergence/failure behavior, and independently calculated
> worked examples. Record domain-review status explicitly; do not implement an
> unapproved choice. Run documentation checks, update the roadmap, commit the
> work, and prepare a pull request.

### P3.4 Implement the selected settling model

**Depends on:** Approved P3.3 decision record.

**Goal:** Replace conceptual settling parameters with the selected documented
physical calculations while keeping the numerical core auditable.

#### Deliverables

- A pure, unit-safe calculation module that references equation identifiers from
  the engineering specification.
- Applicability diagnostics, convergence limits, and explicit structured errors
  rather than silent clamping or invalid output.
- UI integration that distinguishes inputs, calculated values, warnings, and
  visualization scaling.
- Removal or migration of superseded conceptual controls and metrics.

#### Acceptance criteria

- Tests reproduce P3.3 worked examples within documented absolute/relative
  tolerances.
- Dimensional, limiting-case, regime-transition, convergence, and failure tests
  pass.
- No NaN/Infinity reaches presentation or persisted scenarios.
- Calculation code is independently reviewable without UI knowledge.

#### Call-in prompt

> Complete roadmap item P3.4 in `ROADMAP.md` using only the approved P3.3 model
> specification. Implement a pure unit-safe calculation module with equation-ID
> traceability, regime/applicability diagnostics, bounded iteration, convergence
> reporting, and structured failures. Integrate it into the UI and migrate or
> remove conceptual parameters without conflating visualization scale with
> physics. Test worked examples, dimensions, limits, transitions, convergence,
> and invalid states; run the full validation suite; update the roadmap; commit
> the work; and prepare a pull request.

### P3.5 Add calibration fixtures and known expected results

**Depends on:** P3.4.

**Goal:** Create durable evidence that calculations match independent reference
results and clearly separate calibration from validation.

#### Deliverables

- A versioned, machine-readable fixture schema containing inputs, expected
  outputs, units, tolerances, source/provenance, and whether each case is a
  verification, calibration, or validation case.
- Hand calculations, published examples, or independently generated reference
  values spanning normal, boundary, and out-of-scope conditions.
- An automated fixture runner with useful discrepancy reports.
- A calibration policy that prevents fitted cases from being reused as
  independent validation evidence.

#### Acceptance criteria

- Fixtures span all supported regimes and every model transition.
- Expected values were not generated only by the implementation under test.
- Tolerances have documented engineering/numerical justification.
- CI fails when an in-scope result moves outside its allowed tolerance.

#### Call-in prompt

> Complete roadmap item P3.5 in `ROADMAP.md`. Design a versioned engineering
> fixture format and populate independently sourced expected results for every
> supported regime, transition, boundary, and representative failure case.
> Identify verification, calibration, and validation data separately, document
> provenance and tolerance rationale, and add a CI-ready fixture runner with
> clear discrepancy output. Obtain or record domain-review status, run the full
> validation suite, update the roadmap, commit the work, and prepare a pull
> request.

### P3.6 Add export/import of simulation scenarios

**Depends on:** Stable P3.2 property and P2.3 geometry schemas.

**Goal:** Make engineering scenarios reproducible, portable, and safe to evolve.

#### Deliverables

- A documented, versioned scenario format containing geometry, physical inputs,
  unit/display preferences where appropriate, model identifier/version, and
  simulation settings/seed.
- Deterministic export, strict import validation, migration from supported older
  versions, and actionable errors for unsupported or malformed data.
- Safe file handling with size/complexity limits and no execution of imported
  content.
- Clearly defined inclusion/exclusion of runtime state and results.

#### Acceptance criteria

- Export → import → export is semantically stable.
- Tests cover all versions, migrations, malformed data, unknown fields/models,
  excessive geometry, boundary values, and forward-version rejection.
- An imported scenario reports the exact model/version needed to reproduce its
  results.

#### Call-in prompt

> Complete roadmap item P3.6 in `ROADMAP.md`. Define a documented versioned
> scenario format spanning geometry, physical properties and units, model/version,
> settings, and deterministic seed. Implement deterministic export, defensive
> import, schema migration, resource limits, and actionable errors; explicitly
> define whether runtime state/results are included. Add round-trip, migration,
> malformed/security, boundary, and compatibility tests; run the full validation
> suite; update the roadmap; commit the work; and prepare a pull request.

### P3.7 Add charts and result summaries

**Depends on:** P3.4 for calculations and preferably P3.6 for reproducibility.

**Goal:** Present time histories and summary results without hiding units,
assumptions, applicability warnings, or uncertainty.

#### Deliverables

- A result dataset contract separating raw sampled data from presentation.
- Selected charts for the approved engineering questions, such as settling and
  overflow versus time, with titles, axis labels, units, legends, and model/run
  metadata.
- Accessible data-table alternatives and concise text summaries.
- Sampling/downsampling rules that preserve key events and bound memory usage.
- Export of results in a documented data format, if approved as part of scope.

#### Acceptance criteria

- Charts and summaries agree with raw data and fixture results within display
  rounding.
- Empty, partial, paused, invalid, out-of-scope, and long-running cases are clear.
- Charts are keyboard accessible, do not rely on color alone, and remain readable
  at supported viewports and 200% zoom.

#### Call-in prompt

> Complete roadmap item P3.7 in `ROADMAP.md`. Define a raw result-data contract
> and add charts and text summaries that answer the approved engineering
> questions. Include units, model/scenario metadata, applicability warnings,
> accessible tables, non-color cues, and documented bounded sampling. Verify
> displays against raw data and known fixtures, test lifecycle and responsive
> states, run the full validation suite, capture representative screenshots,
> update the roadmap, commit the work, and prepare a pull request.

### P3.8 Engineering validation review gate

**Goal:** Produce a traceable release assessment and avoid claims beyond the
evidence.

#### Acceptance criteria

- Requirements, equations, code modules, tests, and fixtures are traceable.
- Unit definitions, assumptions, source citations, model validity ranges, and
  known limitations are complete and visible to users where needed.
- Independent expected-result fixtures pass with justified tolerances.
- Scenario files record enough version information for reproducibility.
- A qualified reviewer has recorded approval, limitations, or open findings.
- Release wording differentiates software verification, model calibration, and
  real-world validation.

#### Call-in prompt

> Run the P3.8 engineering validation review in `ROADMAP.md`. Audit traceability
> from requirements and primary-source equations through code, tests, fixtures,
> scenario versions, UI units/warnings, and result summaries. Execute the full
> validation and fixture suites and assemble a review report distinguishing
> software verification, calibration, and independent validation. Fix in-scope
> defects, record qualified-review status and remaining limitations without
> overstating fitness for use, update the roadmap, commit any changes, and
> prepare a pull request when changes were required.

---

## Cross-phase decision log template

Use this template for choices that affect later chats:

```markdown
## Decision: <short name>

- Status: proposed | approved | superseded
- Date:
- Owners/reviewers:
- Context and engineering question:
- Options considered:
- Decision and rationale:
- Primary sources/equation IDs:
- Applicability limits and assumptions:
- Consequences and migration impact:
- Required tests/fixtures:
```

## Suggested milestone checklist

### Phase 2 complete

- [x] P0 baseline complete
- [ ] P2.1 slurry-flow visualization
- [ ] P2.2 rock/slurry collisions
- [ ] P2.3 geometry presets
- [ ] P2.4 custom shape editor
- [ ] P2.5 accessible keyboard controls
- [ ] P2.6 numeric inputs alongside sliders
- [ ] P2.7 settling and overflow metrics
- [ ] P2.8 responsive behavior
- [ ] P2.9 review gate

### Phase 3 complete

- [ ] P3.1 units, assumptions, and governance
- [ ] P3.2 fluid and particle properties
- [ ] P3.3 settling-model selection
- [ ] P3.4 settling-model implementation
- [ ] P3.5 calibration and expected-result fixtures
- [ ] P3.6 scenario export/import
- [ ] P3.7 charts and result summaries
- [ ] P3.8 engineering validation review gate
