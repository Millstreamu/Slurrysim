# Settling-model decision record

**Decision ID:** ADR-P3.3-001  
**Model identifier/version:** `isolated-sphere-sn-0.1-draft`  
**Status:** Proposed; blocked pending qualified domain review  
**Date:** 2026-08-02  
**Engineering specification:** 0.1

This record selects a calculation for later implementation; it does **not**
approve or implement that calculation. The current animation remains
conceptual. P3.4 must not begin until the approval record at the end of this
document is completed by a qualified reviewer.

## Decision and scope

For a rigid, isolated, equivalent **sphere** settling under gravity in a
quiescent, unbounded, incompressible Newtonian liquid, use a terminal force
balance with:

1. Stokes drag when the resulting particle Reynolds number is at most 0.1; and
2. the Schiller--Naumann drag correlation above 0.1 and at most 800.

This deliberately narrow first model matches the P3.1 isothermal, Newtonian,
representative-particle scope and consumes the P3.2 SI density, viscosity, and
equivalent-diameter properties. It requires `particle sphericity = 1` and
`solids volume fraction = 0`. Non-spherical particles, hindered settling, wall
effects, turbulence, background vertical flow, particle-size distributions,
and particle interactions are outside the selected model and must produce
applicability errors, not corrections or silent clamping.

The restriction to zero solids concentration means this model is a reference
isolated-particle velocity, not a slurry bulk-settling prediction. A
Richardson--Zaki extension remains a future candidate only; it is not selected
because its exponent depends on regime and vessel/particle geometry, while
physical vessel dimensions are not yet part of the calculation schema.

## Candidate comparison

| Approach                                                 | Benefits                                                                      | Limits against the approved draft scope                                                                 | Decision                                |
| -------------------------------------------------------- | ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- | --------------------------------------- |
| Stokes terminal velocity                                 | Analytical, dimensionally transparent, and correct in creeping flow           | Invalid once inertia is material; cannot cover most of the P3.2 diameter range                          | Select only for $Re_p \le 0.1$          |
| Schiller--Naumann sphere drag                            | One coefficient set covers intermediate sphere Reynolds numbers               | Empirical, isolated smooth spheres only; published upper limit is finite                                | Select for $0.1 < Re_p \le 800$         |
| A drag “standard curve” spanning higher Reynolds numbers | Would cover larger particles                                                  | Multiple regime joins need further source transcription and review; no operating need is established    | Defer                                   |
| Richardson--Zaki hindered settling                       | Represents concentration-dependent reduction and has the correct dilute limit | Exponent, concentration definition, Reynolds basis, and wall correction must be tied to vessel geometry | Defer; do not implement                 |
| Shape-specific natural-particle correlations             | Could use the P3.2 sphericity input                                           | Equivalent diameter plus one sphericity value does not uniquely describe irregular rocks                | Defer; require an error unless $\psi=1$ |

## Source record and transcription

The original sources, rather than a software implementation, govern the
equations. A reviewer must inspect the cited editions against this transcription
before approval.

| Equation ID        | Transcription and provenance                                                             | Source                                                                                                                                                                                                                                                            | Review state                                                          |
| ------------------ | ---------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| SET-01-STOKES-1851 | Creeping-flow sphere resistance $F_D=3\pi\mu d_pv_t$; combined below with buoyant weight | G. G. Stokes, “On the Effect of the Internal Friction of Fluids on the Motion of Pendulums” (1851), [DOI record](https://doi.org/10.1017/CBO9780511702266.002)                                                                                                    | Primary source identified; transcription review pending               |
| SET-02-SN-1935     | $C_D=(24/Re_p)(1+0.15Re_p^{0.687})$                                                      | L. Schiller and A. Naumann, “A Drag Coefficient Correlation,” _Zeitschrift des Vereines Deutscher Ingenieure_ 77 (1935), 318--320, [bibliographic DOI record](https://doi.org/10.1007/978-3-642-85873-2_5)                                                        | Original German source and range need reviewer verification           |
| SET-03-RZ-1954     | Candidate form only: $v_h=v_t(1-\phi)^n$; no exponent is selected                        | J. F. Richardson and W. N. Zaki, “Sedimentation and Fluidisation: Part I,” _Transactions of the Institution of Chemical Engineers_ 32 (1954), 35--53, [IChemE archive](https://www.icheme.org/knowledge-networks/publications/transactions/transactions-archive/) | Deferred; original source text, exponent, and wall terms not approved |

The Schiller--Naumann English title and DOI metadata vary among catalogues. The
bibliographic link helps locate the source; it is not evidence that the text has
been independently reviewed. This uncertainty is an explicit approval blocker.

## Equations, symbols, and dimensions

The terminal balance is buoyancy-corrected particle weight against drag:

$$
\frac{\pi}{6}d_p^3(\rho_p-\rho_f)g
=\frac{1}{2}C_D\rho_f\frac{\pi d_p^2}{4}v_t^2.
\tag{SET-BAL-01}
$$

Define

$$
Re_p=\frac{\rho_f v_t d_p}{\mu},\qquad
Ar=\frac{g d_p^3\rho_f(\rho_p-\rho_f)}{\mu^2}.
\tag{SET-DIM-01}
$$

The dimensionless residual used by the numerical method is

$$
f(Re_p)=C_D(Re_p)Re_p^2-\frac{4}{3}Ar.
\tag{SET-RES-01}
$$

For the Stokes branch, substitution gives the analytical result

$$
C_D=\frac{24}{Re_p},\qquad
v_t=\frac{(\rho_p-\rho_f)g d_p^2}{18\mu}.
\tag{SET-01-STOKES-1851}
$$

For the correlation branch:

$$
C_D=\frac{24}{Re_p}\left(1+0.15Re_p^{0.687}\right).
\tag{SET-02-SN-1935}
$$

$d_p$ is equivalent spherical diameter (m), $v_t$ is downward terminal speed
(m/s), $\rho_p$ and $\rho_f$ are particle and liquid density (kg/m³), $\mu$ is
dynamic viscosity (Pa·s), $g$ is gravitational acceleration (m/s²), and $C_D$,
$Re_p$, and $Ar$ are dimensionless. Every term in `SET-BAL-01` has force
dimension, and every term in `SET-RES-01` is dimensionless.

The selected constant is $g=9.80665$ m/s², the conventional standard value in
the [BIPM SI Brochure](https://www.bipm.org/en/publications/si-brochure). It is
model metadata, not a user-tunable visualization control.

## Selection and numerical method

Inputs first pass the P3.2 runtime validation, followed by these model checks:

- require $\rho_p>\rho_f$; neutral or buoyant particles need a separately
  specified direction convention;
- require $\psi=1$ and $\phi=0$ exactly for model version 0.1;
- compute the Stokes result and its $Re_p$; use it only when $Re_p\le0.1$;
- otherwise solve `SET-RES-01` with `SET-02-SN-1935` on the closed bracket
  $[0.1,800]$ using bisection;
- accept only when bracket width is at most $10^{-10}$ and absolute residual is
  at most $10^{-10}\max(1,4Ar/3)$, with a maximum of 64 iterations; then
  calculate $v_t=Re_p\mu/(\rho_fd_p)$; and
- report outside applicability if the residual does not change sign on the
  bracket or the accepted result is outside its branch.

Bisection is selected over an unbounded fixed-point or Newton iteration because
it retains a bracket and has deterministic convergence for this monotonic
positive correlation. No extrapolation, fallback coefficient, or last iterate
may be returned. The Stokes/SN join has a small coefficient mismatch: at
$Re_p=0.1$, Schiller--Naumann is about 3.08% above Stokes drag. The exact join
must therefore have a transition diagnostic and dedicated two-sided tests; a
reviewer may instead require a single reviewed correlation across creeping
flow before approval.

### Required structured outcomes

| Condition                                    | Outcome/code                       | Result allowed? |
| -------------------------------------------- | ---------------------------------- | --------------- |
| Non-finite or non-positive dimensional input | `invalid-property`                 | No              |
| $\rho_p\le\rho_f$                            | `unsupported-settling-direction`   | No              |
| $\psi\ne1$                                   | `unsupported-shape`                | No              |
| $\phi>0$                                     | `hindered-settling-not-modeled`    | No              |
| Root above $Re_p=800$ or no sign change      | `reynolds-outside-model`           | No              |
| Iteration cap or tolerances not met          | `settling-non-convergence`         | No              |
| Within 1% of $Re_p=0.1$ or 800               | `model-boundary-proximity` warning | Yes             |

Wall clearance cannot yet be evaluated because the UI geometry is normalized.
Until physical vessel clearance is added, even an otherwise valid result must
carry `wall-effects-not-evaluated`. The result is an unbounded-fluid reference,
not a claim that wall effects are negligible.

## Independently calculated examples

These values were produced from the displayed equations in a standalone Python
bisection worksheet, not from application code. Inputs use water-like P3.2
defaults $\rho_f=998.2$ kg/m³ and $\mu=1.002\times10^{-3}$ Pa·s, quartz-like
$\rho_p=2650$ kg/m³, $g=9.80665$ m/s², $\psi=1$, and $\phi=0$.

| Case                        |               $d_p$ (m) | Method            |      $Ar$ |      $Re_p$ |             $v_t$ (m/s) |     $C_D$ |
| --------------------------- | ----------------------: | ----------------- | --------: | ----------: | ----------------------: | --------: |
| Creeping                    | $2.000000\times10^{-5}$ | Stokes analytical | 0.1288399 | 0.007157770 | $3.592509\times10^{-4}$ | 3352.9996 |
| Correlation, small sphere   | $1.000000\times10^{-4}$ | SN bisection      |  16.10498 |   0.7932398 | $7.962596\times10^{-3}$ |  34.12636 |
| Correlation, representative | $1.000000\times10^{-3}$ | SN bisection      |  16104.98 |    154.6029 |               0.1551914 | 0.8983881 |
| Upper boundary              | $2.417864\times10^{-3}$ | SN at boundary    |  227643.9 |    800.0000 |               0.3321301 | 0.4742581 |

For the branch transition, the Stokes expression reaches $Re_p=0.1$ at
$d_p=4.816935\times10^{-5}$ m for these properties. Tests must evaluate that
diameter, the adjacent representable values on both sides, and the documented
join diagnostic. A 5 mm particle has no root below 800 for these inputs and must
return `reynolds-outside-model`, not a velocity.

Independent P3.4 fixtures should retain at least 8 significant digits from a
separately reviewed worksheet. Proposed software tolerances are relative
$10^{-6}$ for velocities and Reynolds numbers and absolute $10^{-10}$ near
zero; these are numerical reproduction tolerances, not experimental accuracy.

## Review and implementation gate

**Qualified reviewer:** Not assigned  
**Qualification/organization:** Pending  
**Decision:** Pending (approve / approve with conditions / reject)  
**Review date:** Pending  
**Reviewed specification/model versions:** Pending  
**Conditions or findings:** Primary-source transcription, operating envelope,
the Stokes/SN join, sphere-only scope, wall-effect policy, and independent
worksheet all require review.

P3.3 is complete as a **draft decision record**, but the model is not approved.
P3.4 remains blocked. Filling in this record requires a new reviewed commit; a
roadmap checkbox or passing software tests cannot substitute for sign-off.
