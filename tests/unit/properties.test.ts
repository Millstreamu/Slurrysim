import { describe, expect, it } from 'vitest';
import {
  celsiusToKelvin,
  densityFromKilogramsPerCubicMetre,
  dynamicViscosity,
  dynamicViscosityFromPascalSeconds,
  FLUID_PRESETS,
  kelvinToCelsius,
  kinematicViscosity,
  lengthFromMetres,
  metresToMillimetres,
  millimetresToMetres,
  PARTICLE_PRESETS,
  solidsVolumeFraction,
  sphericity,
  temperatureFromKelvin,
  type Density,
  type DynamicViscosity,
  type KinematicViscosity,
  type Temperature,
} from '../../src/engineering/properties';

describe('engineering property quantities', () => {
  it.each([
    densityFromKilogramsPerCubicMetre,
    dynamicViscosityFromPascalSeconds,
    temperatureFromKelvin,
    lengthFromMetres,
  ])('rejects non-positive and non-finite values', (construct) => {
    for (const value of [0, -1, Number.NaN, Number.POSITIVE_INFINITY]) {
      expect(construct(value)).toMatchObject({ ok: false });
    }
  });

  it('enforces dimensionless physical boundaries without clamping', () => {
    expect(sphericity(0)).toMatchObject({ ok: false });
    expect(sphericity(1)).toMatchObject({ ok: true, value: 1 });
    expect(sphericity(1.01)).toMatchObject({ ok: false });
    expect(solidsVolumeFraction(0)).toMatchObject({ ok: true, value: 0 });
    expect(solidsVolumeFraction(1)).toMatchObject({ ok: false });
    expect(solidsVolumeFraction(-0.01)).toMatchObject({ ok: false });
  });

  it('round-trips affine temperature and length display conversions', () => {
    for (const celsius of [-273.14, 0, 20, 100]) {
      expect(
        kelvinToCelsius(celsiusToKelvin(celsius) as Temperature),
      ).toBeCloseTo(celsius, 12);
    }
    for (const millimetres of [0.01, 1, 100]) {
      expect(
        metresToMillimetres(millimetresToMetres(millimetres) as never),
      ).toBeCloseTo(millimetres, 12);
    }
  });

  it('converts between dynamic and kinematic viscosity dimensionally', () => {
    const density = 1000 as Density;
    const dynamic = 0.001 as DynamicViscosity;
    const kinematic = kinematicViscosity(dynamic, density);
    expect(kinematic).toBe(0.000001);
    expect(dynamicViscosity(kinematic as KinematicViscosity, density)).toBe(
      dynamic,
    );
  });

  it('keeps provenance and precision notes with every preset', () => {
    for (const preset of [...FLUID_PRESETS, ...PARTICLE_PRESETS]) {
      expect(preset.provenance.source).not.toBe('');
      expect(preset.provenance.url).toMatch(/^https:\/\//);
      expect(preset.provenance.note).toMatch(/rounded|scenario/i);
    }
  });
});
