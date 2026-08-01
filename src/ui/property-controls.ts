import {
  celsiusToKelvin,
  densityFromKilogramsPerCubicMetre,
  dynamicViscosityFromPascalSeconds,
  FLUID_PRESETS,
  kelvinToCelsius,
  kinematicViscosity,
  lengthFromMetres,
  metresToMillimetres,
  milliPascalSecondsToPascalSeconds,
  PARTICLE_PRESETS,
  pascalSecondsToMilliPascalSeconds,
  solidsVolumeFraction,
  sphericity,
  temperatureFromKelvin,
  type PhysicalProperties,
  type PropertyDiagnostic,
  type PropertyResult,
} from '../engineering/properties';

type Field =
  | 'fluidDensity'
  | 'dynamicViscosity'
  | 'temperature'
  | 'particleDensity'
  | 'diameter'
  | 'sphericity'
  | 'solidsVolumeFraction';

const applicability: Partial<Record<Field, readonly [number, number, string]>> =
  {
    fluidDensity: [500, 2000, 'The draft liquid scope expects 500–2000 kg/m³.'],
    dynamicViscosity: [
      0.1,
      100,
      'The draft liquid scope expects 0.1–100 mPa·s.',
    ],
    temperature: [0, 100, 'The water-based draft scope expects 0–100 °C.'],
    particleDensity: [
      500,
      10000,
      'The draft particle scope expects 500–10000 kg/m³.',
    ],
    diameter: [
      0.01,
      100,
      'The draft representative diameter range is 0.01–100 mm.',
    ],
  };

export class PropertyControls {
  #properties: PhysicalProperties;

  constructor(properties: PhysicalProperties) {
    this.#properties = properties;
    this.bindPresets();
    this.bindFields();
    this.render();
  }

  get properties(): PhysicalProperties {
    return {
      fluid: { ...this.#properties.fluid },
      particle: { ...this.#properties.particle },
    };
  }

  private bindPresets(): void {
    this.element<HTMLSelectElement>('fluid-preset').addEventListener(
      'change',
      (event) => {
        const preset = FLUID_PRESETS.find(
          ({ id }) => id === (event.target as HTMLSelectElement).value,
        );
        if (preset)
          this.#properties = {
            ...this.#properties,
            fluid: { ...preset.values },
          };
        this.render();
      },
    );
    this.element<HTMLSelectElement>('particle-preset').addEventListener(
      'change',
      (event) => {
        const preset = PARTICLE_PRESETS.find(
          ({ id }) => id === (event.target as HTMLSelectElement).value,
        );
        if (preset)
          this.#properties = {
            ...this.#properties,
            particle: { ...preset.values },
          };
        this.render();
      },
    );
  }

  private bindFields(): void {
    const fields: Field[] = [
      'fluidDensity',
      'dynamicViscosity',
      'temperature',
      'particleDensity',
      'diameter',
      'sphericity',
      'solidsVolumeFraction',
    ];
    for (const field of fields) {
      const input = this.element<HTMLInputElement>(field);
      input.addEventListener('change', () => this.commit(field, input));
    }
  }

  private commit(field: Field, input: HTMLInputElement): void {
    const raw = input.valueAsNumber;
    const result = this.construct(field, raw);
    const warning = applicability[field];
    const diagnostics =
      result.ok && warning && (raw < warning[0] || raw > warning[1])
        ? [
            {
              code: `${field}.applicability`,
              status: 'outside-applicability' as const,
              message: warning[2],
            },
          ]
        : result.diagnostics;
    this.showDiagnostic(field, diagnostics);
    if (!result.ok) return;
    input.removeAttribute('aria-invalid');
    const value = result.value;
    if (field === 'fluidDensity')
      this.#properties = {
        ...this.#properties,
        fluid: {
          ...this.#properties.fluid,
          density: value as PhysicalProperties['fluid']['density'],
        },
      };
    if (field === 'dynamicViscosity')
      this.#properties = {
        ...this.#properties,
        fluid: {
          ...this.#properties.fluid,
          dynamicViscosity:
            value as PhysicalProperties['fluid']['dynamicViscosity'],
        },
      };
    if (field === 'temperature')
      this.#properties = {
        ...this.#properties,
        fluid: {
          ...this.#properties.fluid,
          temperature: value as PhysicalProperties['fluid']['temperature'],
        },
      };
    if (field === 'particleDensity')
      this.#properties = {
        ...this.#properties,
        particle: {
          ...this.#properties.particle,
          density: value as PhysicalProperties['particle']['density'],
        },
      };
    if (field === 'diameter')
      this.#properties = {
        ...this.#properties,
        particle: {
          ...this.#properties.particle,
          diameter: value as PhysicalProperties['particle']['diameter'],
        },
      };
    if (field === 'sphericity')
      this.#properties = {
        ...this.#properties,
        particle: {
          ...this.#properties.particle,
          sphericity: value as PhysicalProperties['particle']['sphericity'],
        },
      };
    if (field === 'solidsVolumeFraction')
      this.#properties = {
        ...this.#properties,
        particle: {
          ...this.#properties.particle,
          solidsVolumeFraction:
            value as PhysicalProperties['particle']['solidsVolumeFraction'],
        },
      };
    this.renderDerived();
  }

  private construct(field: Field, value: number): PropertyResult<number> {
    if (field === 'fluidDensity' || field === 'particleDensity')
      return densityFromKilogramsPerCubicMetre(value);
    if (field === 'dynamicViscosity')
      return dynamicViscosityFromPascalSeconds(
        milliPascalSecondsToPascalSeconds(value),
      );
    if (field === 'temperature')
      return temperatureFromKelvin(celsiusToKelvin(value));
    if (field === 'diameter') return lengthFromMetres(value / 1000);
    if (field === 'sphericity') return sphericity(value);
    return solidsVolumeFraction(value);
  }

  private showDiagnostic(
    field: Field,
    diagnostics: readonly PropertyDiagnostic[],
  ): void {
    const input = this.element<HTMLInputElement>(field);
    const output = this.element<HTMLElement>(`${field}-diagnostic`);
    const diagnostic = diagnostics[0];
    output.textContent = diagnostic?.message ?? '';
    output.dataset.status = diagnostic?.status ?? 'valid';
    if (diagnostic?.status === 'invalid')
      input.setAttribute('aria-invalid', 'true');
    else input.removeAttribute('aria-invalid');
  }

  private render(): void {
    this.element<HTMLInputElement>('fluidDensity').value = String(
      this.#properties.fluid.density,
    );
    this.element<HTMLInputElement>('dynamicViscosity').value = String(
      pascalSecondsToMilliPascalSeconds(
        this.#properties.fluid.dynamicViscosity,
      ),
    );
    this.element<HTMLInputElement>('temperature').value = String(
      kelvinToCelsius(this.#properties.fluid.temperature),
    );
    this.element<HTMLInputElement>('particleDensity').value = String(
      this.#properties.particle.density,
    );
    this.element<HTMLInputElement>('diameter').value = String(
      metresToMillimetres(this.#properties.particle.diameter),
    );
    this.element<HTMLInputElement>('sphericity').value = String(
      this.#properties.particle.sphericity,
    );
    this.element<HTMLInputElement>('solidsVolumeFraction').value = String(
      this.#properties.particle.solidsVolumeFraction,
    );
    for (const field of [
      'fluidDensity',
      'dynamicViscosity',
      'temperature',
      'particleDensity',
      'diameter',
      'sphericity',
      'solidsVolumeFraction',
    ] as Field[])
      this.showDiagnostic(field, []);
    this.renderDerived();
  }

  private renderDerived(): void {
    this.element('kinematic-viscosity').textContent =
      `${kinematicViscosity(this.#properties.fluid.dynamicViscosity, this.#properties.fluid.density).toExponential(4)} m²/s`;
  }

  private element<T extends HTMLElement = HTMLElement>(id: string): T {
    const element = document.getElementById(id);
    if (!element) throw new Error(`Missing property control: ${id}`);
    return element as T;
  }
}
