import type { GeometryId, Settings } from '../simulation/types';
import { PairedControl } from './paired-control';

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
      const number = document.querySelector<HTMLInputElement>(`#${key}-number`);
      const error = document.querySelector<HTMLElement>(`#${key}-error`);
      if (!input || !number || !error)
        throw new Error(`Missing control: ${key}`);
      new PairedControl({
        range: input,
        number,
        error,
        initialValue: this.#settings[key],
        onCommit: (value) => {
          this.#settings = { ...this.#settings, [key]: value };
          this.#listener(this.settings, { geometryChanged: false });
        },
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

  useGeometry(geometry: GeometryId, notify = true): void {
    this.#settings = { ...this.#settings, geometry };
    if (notify) this.#listener(this.settings, { geometryChanged: true });
  }
}
