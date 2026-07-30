export interface PairedControlOptions {
  range: HTMLInputElement;
  number: HTMLInputElement;
  error: HTMLElement;
  initialValue: number;
  onCommit: (value: number) => void;
}

/** Keeps a range and number field synchronized while allowing temporary typing. */
export class PairedControl {
  #value: number;
  readonly #options: PairedControlOptions;

  constructor(options: PairedControlOptions) {
    this.#options = options;
    this.#value = options.initialValue;
    options.range.addEventListener('input', () =>
      this.commit(Number(options.range.value)),
    );
    options.number.addEventListener('input', () => this.validateDraft());
    options.number.addEventListener('blur', () => this.commitDraft());
    options.number.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        this.commitDraft();
      }
      if (event.key === 'Escape') {
        options.number.value = String(this.#value);
        this.setError('');
      }
    });
  }

  private bounds(): { minimum: number; maximum: number; step: number } {
    return {
      minimum: Number(this.#options.range.min),
      maximum: Number(this.#options.range.max),
      step: Number(this.#options.range.step || 1),
    };
  }

  private parseDraft(): number | null {
    const text = this.#options.number.value.trim();
    if (!text || !/^[+-]?(?:\d+\.?\d*|\.\d+)$/.test(text)) return null;
    const value = Number(text);
    return Number.isFinite(value) ? value : null;
  }

  private validateDraft(): void {
    const value = this.parseDraft();
    const { minimum, maximum } = this.bounds();
    this.setError(
      value === null
        ? 'Enter a number.'
        : value < minimum || value > maximum
          ? `Enter a value from ${minimum} to ${maximum}.`
          : '',
    );
  }

  private commitDraft(): void {
    const value = this.parseDraft();
    const { minimum, maximum } = this.bounds();
    if (value === null || value < minimum || value > maximum) {
      this.validateDraft();
      return;
    }
    this.commit(value);
  }

  private commit(rawValue: number): void {
    const { minimum, maximum, step } = this.bounds();
    const precision = (String(step).split('.')[1] ?? '').length;
    const snapped = Math.min(
      maximum,
      Math.max(
        minimum,
        minimum + Math.round((rawValue - minimum) / step) * step,
      ),
    );
    const value = Number(snapped.toFixed(precision));
    this.#options.range.value = String(value);
    this.#options.number.value = String(value);
    this.setError('');
    if (value === this.#value) return;
    this.#value = value;
    this.#options.onCommit(value);
  }

  private setError(message: string): void {
    this.#options.error.textContent = message;
    this.#options.number.setAttribute('aria-invalid', String(Boolean(message)));
  }
}
