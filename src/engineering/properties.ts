declare const quantity: unique symbol;

export type Quantity<Unit extends string> = number & {
  readonly [quantity]: Unit;
};
export type Density = Quantity<'kg/m3'>;
export type DynamicViscosity = Quantity<'Pa*s'>;
export type KinematicViscosity = Quantity<'m2/s'>;
export type Temperature = Quantity<'K'>;
export type Length = Quantity<'m'>;
export type Dimensionless = Quantity<'1'>;

export type PropertyStatus = 'valid' | 'outside-applicability' | 'invalid';

export interface PropertyDiagnostic {
  code: string;
  status: Exclude<PropertyStatus, 'valid'>;
  message: string;
}

export type PropertyResult<T> =
  | { ok: true; value: T; diagnostics: readonly PropertyDiagnostic[] }
  | { ok: false; diagnostics: readonly PropertyDiagnostic[] };

export interface FluidProperties {
  density: Density;
  dynamicViscosity: DynamicViscosity;
  temperature: Temperature;
}

export interface ParticleProperties {
  density: Density;
  diameter: Length;
  sphericity: Dimensionless;
  solidsVolumeFraction: Dimensionless;
}

export interface PhysicalProperties {
  fluid: Readonly<FluidProperties>;
  particle: Readonly<ParticleProperties>;
}

export interface PropertyPreset<T> {
  id: string;
  name: string;
  values: Readonly<T>;
  provenance: {
    source: string;
    url: string;
    note: string;
  };
}

const invalid = <T>(code: string, message: string): PropertyResult<T> => ({
  ok: false,
  diagnostics: [{ code, status: 'invalid', message }],
});

const positive = <U extends string>(
  value: number,
  unit: U,
): PropertyResult<Quantity<U>> =>
  !Number.isFinite(value) || value <= 0
    ? invalid(`${unit}.positive`, `Must be a finite value greater than zero.`)
    : { ok: true, value: value as Quantity<U>, diagnostics: [] };

export const densityFromKilogramsPerCubicMetre = (value: number) =>
  positive(value, 'kg/m3');
export const dynamicViscosityFromPascalSeconds = (value: number) =>
  positive(value, 'Pa*s');
export const temperatureFromKelvin = (value: number) => positive(value, 'K');
export const lengthFromMetres = (value: number) => positive(value, 'm');

export function sphericity(value: number): PropertyResult<Dimensionless> {
  return !Number.isFinite(value) || value <= 0 || value > 1
    ? invalid(
        'sphericity.domain',
        'Sphericity must be greater than 0 and at most 1.',
      )
    : { ok: true, value: value as Dimensionless, diagnostics: [] };
}

export function solidsVolumeFraction(
  value: number,
): PropertyResult<Dimensionless> {
  return !Number.isFinite(value) || value < 0 || value >= 1
    ? invalid(
        'solids-volume-fraction.domain',
        'Solids volume fraction must be at least 0 and less than 1.',
      )
    : { ok: true, value: value as Dimensionless, diagnostics: [] };
}

export const celsiusToKelvin = (value: number): number => value + 273.15;
export const kelvinToCelsius = (value: Temperature): number => value - 273.15;
export const millimetresToMetres = (value: number): number => value / 1000;
export const metresToMillimetres = (value: Length): number => value * 1000;
export const milliPascalSecondsToPascalSeconds = (value: number): number =>
  value / 1000;
export const pascalSecondsToMilliPascalSeconds = (
  value: DynamicViscosity,
): number => value * 1000;

export function kinematicViscosity(
  dynamicViscosity: DynamicViscosity,
  density: Density,
): KinematicViscosity {
  return (dynamicViscosity / density) as KinematicViscosity;
}

export function dynamicViscosity(
  kinematic: KinematicViscosity,
  density: Density,
): DynamicViscosity {
  return (kinematic * density) as DynamicViscosity;
}

export const FLUID_PRESETS: readonly PropertyPreset<FluidProperties>[] = [
  {
    id: 'water-20c',
    name: 'Water at 20 °C',
    values: {
      density: 998.2 as Density,
      dynamicViscosity: 0.001002 as DynamicViscosity,
      temperature: 293.15 as Temperature,
    },
    provenance: {
      source: 'NIST Chemistry WebBook, water fluid properties',
      url: 'https://webbook.nist.gov/cgi/fluid.cgi?ID=C7732185&Action=Page',
      note: 'Rounded representative values at 20 °C and near-atmospheric pressure; not a temperature correlation.',
    },
  },
] as const;

export const PARTICLE_PRESETS: readonly PropertyPreset<ParticleProperties>[] = [
  {
    id: 'quartz',
    name: 'Quartz (representative)',
    values: {
      density: 2650 as Density,
      diameter: 0.005 as Length,
      sphericity: 1 as Dimensionless,
      solidsVolumeFraction: 0.1 as Dimensionless,
    },
    provenance: {
      source: 'USGS Bulletin 1942, mineral physical properties',
      url: 'https://pubs.usgs.gov/bul/1942/report.pdf',
      note: 'Density is a rounded representative value; diameter, sphericity, and concentration are scenario defaults, not material constants.',
    },
  },
] as const;

export const DEFAULT_PHYSICAL_PROPERTIES: PhysicalProperties = {
  fluid: { ...FLUID_PRESETS[0]!.values },
  particle: { ...PARTICLE_PRESETS[0]!.values },
};
