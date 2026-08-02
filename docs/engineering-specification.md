# Engineering specification and equation governance

**Specification version:** 0.1  
**Status:** Draft for domain review  
**Last updated:** 2026-07-30  
**Engineering approval:** Pending — no qualified domain reviewer has approved
this specification or any physical model.

This document defines the proposed engineering boundary for Slurrysim before a
physical calculation is added. It is a requirements document, not evidence that
the current visualization is suitable for design. Until the review gates in
this document are complete, all displayed results remain illustrative.

## Intended use and exclusions

The proposed use is comparison of gravity settling and overflow trends for a
water-based, mineral-particle slurry moving through a continuously flooded rock
box. A future model may estimate a representative particle's terminal settling
velocity and bulk settling/overflow quantities within explicitly checked
applicability ranges.

The following uses are out of scope:

- equipment sizing, structural or pressure design, safety decisions, and
  regulatory compliance;
- compressible, gas-liquid, boiling, reacting, non-Newtonian, or hazardous
  multiphase flows;
- transient inlet surges, free-surface waves, pump and pipe-network behavior,
  erosion, breakage, agglomeration, and particle-particle or particle-wall force
  resolution;
- prediction of individual irregular-rock trajectories from the two-dimensional
  animation; and
- extrapolation outside a selected correlation's published and independently
  reviewed range.

The first approved physical scope should assume an isothermal, incompressible,
Newtonian carrier liquid; rigid, non-porous particles represented by an
equivalent spherical diameter; uniform gravity; and known bulk solids volume
fraction. Polydisperse distributions, shape corrections, wall effects, and
hindered settling must each be either explicitly modeled by a reviewed equation
or reported as an applicability warning. No default range is approved yet:
P3.2 and P3.3 must record a cited range per property and equation rather than
turning the preliminary bounds below into silent clamps.

## Canonical quantities and symbols

The calculation boundary uses SI base and derived units as defined by the
[BIPM SI Brochure, 9th edition](https://www.bipm.org/en/publications/si-brochure)
and applies the quantity and unit-writing guidance in
[NIST Special Publication 811](https://www.nist.gov/pml/special-publication-811).
Values are stored without display prefixes (for example, `0.001 m`, not `1 mm`).
Temperature is stored in kelvin; a Celsius control, if added, is a display
conversion only.

| Quantity                        | Symbol   | Canonical unit | Dimension | Preliminary input policy                      |
| ------------------------------- | -------- | -------------- | --------- | --------------------------------------------- |
| Liquid density                  | $\rho_f$ | kg/m³          | M L⁻³     | finite and > 0                                |
| Particle density                | $\rho_p$ | kg/m³          | M L⁻³     | finite and > 0                                |
| Dynamic viscosity               | $\mu$    | Pa·s           | M L⁻¹ T⁻¹ | finite and > 0                                |
| Kinematic viscosity (derived)   | $\nu$    | m²/s           | L² T⁻¹    | never an independent simultaneous input       |
| Absolute temperature            | $T$      | K              | Θ         | finite and > 0 when properties depend on it   |
| Equivalent particle diameter    | $d_p$    | m              | L         | finite and > 0                                |
| Particle sphericity             | $\psi$   | 1              | 1         | `(0, 1]`; visualization-only until supported  |
| Solids volume fraction          | $\phi$   | m³/m³          | 1         | `[0, 1)` plus model-specific range check      |
| Volumetric flow rate            | $Q$      | m³/s           | L³ T⁻¹    | finite and ≥ 0                                |
| Cross-sectional area            | $A$      | m²             | L²        | finite and > 0                                |
| Mean fluid velocity (derived)   | $u_f$    | m/s            | L T⁻¹     | derived from reviewed geometry and flow model |
| Gravitational acceleration      | $g$      | m/s²           | L T⁻²     | positive named model constant                 |
| Pressure                        | $p$      | Pa             | M L⁻¹ T⁻² | only if an approved equation consumes it      |
| Terminal settling velocity      | $v_t$    | m/s            | L T⁻¹     | calculated result with diagnostics            |
| Time                            | $t$      | s              | T         | finite and ≥ 0                                |
| Reynolds number                 | $Re_p$   | 1              | 1         | calculated result                             |
| Settled/overflow mass or volume | $m$, $V$ | kg, m³         | M, L³     | counting basis must be stated, never mixed    |

Inputs must distinguish three outcomes: **invalid** (not finite, wrong dimension,
or outside a physical domain), **outside applicability** (well-formed but beyond
an equation's reviewed range), and **valid**. The UI must not silently clamp any
of these values or imply more precision than its source supports.

## Mapping the current prototype

| Current control or output                         | Engineering disposition                                                                                                                                                       |
| ------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Geometry preset and normalized coordinates        | Retain for visualization. Add independently dimensioned vessel geometry before it participates in calculations; normalized canvas coordinates never become metres implicitly. |
| Flow rate (0–100 conceptual scale)                | Replace with volumetric flow rate $Q$ in m³/s. A reviewed wetted area/continuity model is required before deriving velocity.                                                  |
| Line pressure (0–100 conceptual scale)            | Remove unless a reviewed model demonstrates how measured pressure affects the calculation. It must not remain a surrogate for suspension.                                     |
| Batch size                                        | Retain as a visualization particle count. Physical feed must use a stated mass, volume, or mass-flow basis and must not infer it from rendered glyphs.                        |
| Turbulence (0–100 conceptual scale)               | Retain only as a visual animation setting, clearly separated from calculations, until a supported turbulence quantity and model exist.                                        |
| Material density (20–100 conceptual scale)        | Replace with particle density $\rho_p$ in kg/m³ and separately add liquid density $\rho_f$.                                                                                   |
| Elapsed simulation time                           | Retain in seconds, but distinguish animation time from residence/process time until the flow model establishes their relationship.                                            |
| Active, settled, overflowed, and discarded counts | Retain as visualization diagnostics. `discarded` is a rendering resource-limit event, not a physical outlet.                                                                  |
| Settling/overflow fraction                        | Replace the glyph-count fraction with an explicitly named mass or volume fraction calculated on a documented time basis.                                                      |
| Settling/overflow rate                            | Replace particles/s with an approved mass or volumetric rate.                                                                                                                 |
| Average travel                                    | Remove from engineering results; normalized horizontal glyph position has no physical meaning.                                                                                |

## Physical and visualization boundary

The calculation core will consume physical quantities and return physical
results plus applicability diagnostics. The renderer may map those results to
normalized speed, glyph size, and event probabilities, but visual scaling is a
one-way adapter. Canvas state, frame rate, random seed, particle cap, collision
damping, and normalized geometry must never feed back into an engineering
result. A 2D view is a schematic slice, not a computational-fluid-dynamics
solution or a claim about a three-dimensional velocity field.

Likewise, an engineering result must remain reproducible without the DOM,
canvas, animation clock, or display unit. Every output must identify its input
snapshot, model/equation version, validity status, and warning set.

## Requirements-to-equations traceability

“Candidate” means research or specification work only. It does not authorize an
equation for production. P3.3 must confirm the source text, transcribe the exact
equation and coefficients, establish its range, create independent worked
examples, and obtain domain review before P3.4 implementation.

| ID     | Requirement                                                                           | Equation/model candidate                                                                       | Primary or authoritative source                                                                                                                                                                                                                                          | Applicability evidence required                                                                                          | Test strategy                                                                               | Review                                                           |
| ------ | ------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| GOV-01 | Use coherent units at every calculation boundary.                                     | SI quantity equations; no unit-dependent empirical constants without an explicit conversion.   | [BIPM SI Brochure](https://www.bipm.org/en/publications/si-brochure); [NIST SP 811](https://www.nist.gov/pml/special-publication-811)                                                                                                                                    | Unit definitions and conversion provenance.                                                                              | Compile-time incompatible-unit examples; conversion round trips; dimensional review.        | Pending                                                          |
| FLW-01 | Convert measured volumetric flow and physical wetted area to mean velocity.           | Continuity, $u_f = Q/A$, only for the mean-flow definition selected in P3.3.                   | [NIST fluid-flow quantity guidance](https://www.nist.gov/programs-projects/fluid-flow) and SI sources above; geometry-specific source still required.                                                                                                                    | Steady incompressible flow, definition of wetted area, and treatment of solids.                                          | Hand calculations, scaling identities, and zero/invalid-area errors.                        | Pending source and reviewer                                      |
| SET-01 | Estimate isolated spherical-particle settling in the creeping-flow regime.            | `SET-01-STOKES-1851`; selected in [ADR-P3.3-001](settling-model-decision.md) for $Re_p\le0.1$. | G. G. Stokes, [“On the effect of the internal friction of fluids on the motion of pendulums” (1851)](https://doi.org/10.1017/CBO9780511702266.002)                                                                                                                       | Newtonian continuum, isolated sphere, negligible wall effects, and reviewed Reynolds-number threshold.                   | Independent worked examples, limiting behavior, and applicability boundaries.               | Draft selection; domain approval pending                         |
| SET-02 | Select drag outside the creeping-flow regime without a discontinuous or hidden rule.  | `SET-02-SN-1935`; selected in [ADR-P3.3-001](settling-model-decision.md) for $0.1<Re_p\le800$. | L. Schiller and A. Naumann, “A Drag Coefficient Correlation” (1935), [bibliographic DOI record](https://doi.org/10.1007/978-3-642-85873-2_5)                                                                                                                             | Published $Re_p$, shape, concentration, and wall ranges; convergence criteria.                                           | Regime boundaries, independent values, convergence/non-convergence, and metamorphic checks. | Draft selection; source verification and domain approval pending |
| SET-03 | Account for concentrated suspension only where evidence supports it.                  | Richardson--Zaki deferred by [ADR-P3.3-001](settling-model-decision.md); no exponent selected. | J. F. Richardson and W. N. Zaki, “Sedimentation and fluidisation: Part I,” _Transactions of the Institution of Chemical Engineers_ 32 (1954), 35--53 ([bibliographic record](https://www.icheme.org/knowledge-networks/publications/transactions/transactions-archive/)) | Original-source equation, concentration definition, Reynolds regime, vessel/particle scale, and later validity evidence. | Dilute limit, concentration boundaries, monotonicity, and worked examples.                  | Deferred; source verification and reviewer pending               |
| GEO-01 | Treat vessel dimensions and wall effects explicitly.                                  | No equation selected.                                                                          | Primary source depends on the P3.3 model and reviewed scope.                                                                                                                                                                                                             | 3D geometry definition and diameter/clearance ratios.                                                                    | Dimensional tests and warning thresholds.                                                   | Blocked on model selection                                       |
| ACC-01 | Account for released, retained, settled, and overflow material on one physical basis. | $input = retained + settled + overflow + explicitly\ named\ loss$ over a stated interval.      | Conservation requirement; measurement and control-volume convention needs domain review.                                                                                                                                                                                 | Control-volume boundary, transient storage, sampling interval, and mass versus volume basis.                             | Exact balance fixtures, tolerance analysis, and deliberate imbalance detection.             | Pending                                                          |

## Unit-safe internal API strategy

P3.2 should introduce opaque branded SI values rather than passing unlabelled
`number` values. Constructors are the only place display units become canonical
SI. Arithmetic lives in named quantity functions; generic addition between
different brands is intentionally unavailable.

```ts
declare const quantity: unique symbol;
type Quantity<Unit extends string> = number & { readonly [quantity]: Unit };

type Metres = Quantity<'m'>;
type Seconds = Quantity<'s'>;
type MetresPerSecond = Quantity<'m/s'>;
type KilogramsPerCubicMetre = Quantity<'kg/m3'>;
type PascalSeconds = Quantity<'Pa*s'>;

interface ApplicabilityDiagnostic {
  code: string;
  severity: 'warning' | 'error';
  equationId: string;
  message: string;
}

type CalculationResult<T> =
  | { ok: true; value: T; diagnostics: readonly ApplicabilityDiagnostic[] }
  | { ok: false; diagnostics: readonly ApplicabilityDiagnostic[] };
```

Runtime constructors reject non-finite or physically invalid values and return
a structured result; they do not cast unchecked input. Model inputs are
`Readonly` records, equation functions are pure, and outputs include the stable
traceability-table equation ID. JSON scenarios carry a schema version and an
explicit display-unit field, while calculation snapshots store canonical SI.
Temperature conversions account for the affine Celsius offset at the adapter.

This branding catches accidental combinations inside TypeScript but is not a
runtime dimensional-analysis library. Code review, runtime validation, and
dimension-based tests remain required. If derived-unit operations become broad
enough that hand-written named functions are error-prone, P3.2 must evaluate a
maintained unit library rather than building an unrestricted type algebra.

## Verification and review gates

Before any physical equation ships, its change must include:

1. a stable equation ID linked to an inspected primary source, with symbols,
   coefficients, units, range, assumptions, and transcription recorded;
2. an independent worked example not generated by the production function;
3. absolute and relative tolerances justified from source precision and the
   numerical method, plus boundary, dimensional, limiting, and invalid-input
   tests;
4. explicit convergence limits and structured failure behavior for iterative
   calculations;
5. property-based or metamorphic checks where an exact oracle is unavailable;
6. a conservation test at the calculation boundary and a test proving rendering
   settings cannot change the result; and
7. approval recorded with reviewer name, qualification, date, specification
   version, equation version, and any conditions.

Software approval and domain approval are separate. A passing test suite means
the implementation matches its fixtures; it does not validate the fixtures or
the model. Changes to an approved equation, coefficient, unit, range, or warning
invalidate the affected approval and require a new model version and regression
review. Unapproved rows remain unavailable to production code behind normal UI
paths; feature flags do not substitute for review.

## Open review questions

- What measured operating envelope (flow, temperature, vessel dimensions,
  particle distribution, concentration, and material pairs) must be supported?
- Is a representative diameter sufficient, or must P3.2 support a distribution?
- Which concentration definition and reporting basis match available plant
  measurements?
- Are wall effects material in the target clearance ratios?
- What experimental or field data can independently calibrate and validate the
  selected equations?
- Who is the qualified domain reviewer, and what approval record is required?
