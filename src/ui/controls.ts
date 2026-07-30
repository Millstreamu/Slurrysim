import type { GeometryId, Settings } from '../simulation/types';

type SettingsListener = (
  settings: Settings,
  change: { geometryChanged: boolean },
) => void;

export class Controls {
  #settings: Settings;
  readonly #listener: SettingsListener;

  constructor(settings: Settings, listener: SettingsListener) {
    this.#settings = { ...settings };
    this.#listener = listener;
    this.bindRanges();
    this.bindGeometry();
  }

  private bindRanges(): void {
    const keys = [
      'flowRate',
      'pressure',
      'batchSize',
      'turbulence',
      'density',
    ] as const;
    for (const key of keys) {
      const input = document.querySelector<HTMLInputElement>(`#${key}`);
      const output = document.querySelector<HTMLOutputElement>(`#${key}-value`);
      if (!input || !output) throw new Error(`Missing control: ${key}`);
      input.addEventListener('input', () => {
        const value = Number(input.value);
        this.#settings = { ...this.#settings, [key]: value };
        output.value = `${value}${input.dataset.suffix ?? ''}`;
        this.#listener(this.settings, { geometryChanged: false });
      });
    }
  }

  private bindGeometry(): void {
    document.querySelector('#geometry')?.addEventListener('change', (event) => {
      const input = event.target as HTMLInputElement;
      this.#settings = {
        ...this.#settings,
        geometry: input.value as GeometryId,
      };
      this.#listener(this.settings, { geometryChanged: true });
    });
  }

  get settings(): Settings {
    return { ...this.#settings };
  }
}
