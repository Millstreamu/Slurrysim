import {
  GEOMETRIES,
  validateGeometry,
  type GeometryValidationIssue,
} from '../simulation/geometry';
import type { Geometry, GeometryId, Point } from '../simulation/types';

export interface EditorSnapshot {
  geometry: Geometry;
  selected: number | null;
}

const copy = (snapshot: EditorSnapshot): EditorSnapshot => ({
  selected: snapshot.selected,
  geometry: {
    ...snapshot.geometry,
    floor: snapshot.geometry.floor.map((point) => ({ ...point })),
  },
});

/** Framework-free, serializable editor history. */
export class GeometryEditorState {
  #present: EditorSnapshot;
  #past: EditorSnapshot[] = [];
  #future: EditorSnapshot[] = [];

  constructor(geometry: Geometry) {
    this.#present = copy({ geometry, selected: null });
  }

  get snapshot(): EditorSnapshot {
    return copy(this.#present);
  }
  get canUndo(): boolean {
    return this.#past.length > 0;
  }
  get canRedo(): boolean {
    return this.#future.length > 0;
  }

  select(index: number | null): void {
    this.#present.selected = index;
  }

  #commit(next: EditorSnapshot): void {
    this.#past.push(copy(this.#present));
    this.#present = copy(next);
    this.#future = [];
  }

  add(point: Point): void {
    const floor = [...this.#present.geometry.floor, point].sort(
      (a, b) => a.x - b.x,
    );
    const selected = floor.indexOf(point);
    this.#commit({
      geometry: { ...this.#present.geometry, floor },
      selected,
    });
  }

  updateSelected(point: Point): void {
    const selected = this.#present.selected;
    if (selected === null) return;
    const floor = this.#present.geometry.floor
      .map((current, index) => (index === selected ? point : current))
      .sort((left, right) => left.x - right.x);
    this.#commit({
      geometry: { ...this.#present.geometry, floor },
      selected: floor.indexOf(point),
    });
  }

  deleteSelected(): void {
    const selected = this.#present.selected;
    if (selected === null || this.#present.geometry.floor.length <= 2) return;
    this.#commit({
      geometry: {
        ...this.#present.geometry,
        floor: this.#present.geometry.floor.filter((_, i) => i !== selected),
      },
      selected: null,
    });
  }

  reset(geometry: Geometry): void {
    this.#commit(copy({ geometry, selected: null }));
  }

  undo(): void {
    const previous = this.#past.pop();
    if (!previous) return;
    this.#future.push(copy(this.#present));
    this.#present = previous;
  }

  redo(): void {
    const next = this.#future.pop();
    if (!next) return;
    this.#past.push(copy(this.#present));
    this.#present = next;
  }
}

type ChangeListener = (
  geometry: Geometry,
  issues: GeometryValidationIssue[],
  editing: boolean,
) => void;

export class GeometryEditor {
  #state = new GeometryEditorState(this.asCustom(GEOMETRIES.classic));
  #preset: GeometryId = 'classic';
  #editing = false;
  #focusBeforeEdit: HTMLElement | null = null;
  readonly #canvas: HTMLCanvasElement;
  readonly #listener: ChangeListener;

  constructor(canvas: HTMLCanvasElement, listener: ChangeListener) {
    this.#canvas = canvas;
    this.#listener = listener;
    this.bind();
    this.render(false);
  }

  private asCustom(geometry: Geometry): Geometry {
    return {
      ...geometry,
      id: 'custom',
      name: 'Custom geometry',
      description: `Edited from ${geometry.name}.`,
      floor: geometry.floor.map((point) => ({ ...point })),
    };
  }

  setPreset(id: GeometryId): void {
    if (id === 'custom') return;
    this.#preset = id;
    if (!this.#editing)
      this.#state = new GeometryEditorState(this.asCustom(GEOMETRIES[id]));
  }

  private bind(): void {
    document.querySelector('#edit-geometry')?.addEventListener('click', () => {
      this.#focusBeforeEdit = document.activeElement as HTMLElement;
      this.#editing = true;
      this.#state = new GeometryEditorState(
        this.asCustom(GEOMETRIES[this.#preset]),
      );
      this.render();
      document.querySelector<HTMLElement>('#editor-add')?.focus();
    });
    document
      .querySelector('#simulate-geometry')
      ?.addEventListener('click', () => {
        if (validateGeometry(this.#state.snapshot.geometry).length) return;
        this.#editing = false;
        this.render();
        this.#focusBeforeEdit?.focus();
      });
    document.querySelector('#editor-undo')?.addEventListener('click', () => {
      this.#state.undo();
      this.render();
    });
    document.querySelector('#editor-redo')?.addEventListener('click', () => {
      this.#state.redo();
      this.render();
    });
    document.querySelector('#editor-delete')?.addEventListener('click', () => {
      this.#state.deleteSelected();
      this.render();
      document.querySelector<HTMLElement>('#editor-add')?.focus();
    });
    document.querySelector('#editor-reset')?.addEventListener('click', () => {
      this.#state.reset(this.asCustom(GEOMETRIES[this.#preset]));
      this.render();
    });
    document.querySelector('#editor-add')?.addEventListener('click', () => {
      this.#state.add({ x: 0.5, y: 0.75 });
      this.render();
    });
    for (const axis of ['x', 'y'] as const) {
      document
        .querySelector(`#editor-${axis}`)
        ?.addEventListener('change', (event) => {
          const current = this.#state.snapshot;
          if (current.selected === null) return;
          const point = current.geometry.floor[current.selected]!;
          this.#state.updateSelected({
            ...point,
            [axis]: Number((event.target as HTMLInputElement).value),
          });
          this.render();
        });
    }
    this.#canvas.addEventListener('pointerdown', (event) => {
      if (!this.#editing) return;
      const bounds = this.#canvas.getBoundingClientRect();
      const point = {
        x:
          Math.round(((event.clientX - bounds.left) / bounds.width) * 100) /
          100,
        y:
          Math.round(((event.clientY - bounds.top) / bounds.height) * 100) /
          100,
      };
      const snapshot = this.#state.snapshot;
      let nearest = 0;
      snapshot.geometry.floor.forEach((candidate, index) => {
        const current = snapshot.geometry.floor[nearest]!;
        if (
          Math.hypot(candidate.x - point.x, candidate.y - point.y) <
          Math.hypot(current.x - point.x, current.y - point.y)
        )
          nearest = index;
      });
      this.#state.select(nearest);
      this.#state.updateSelected(point);
      this.render();
    });
  }

  private render(notify = true): void {
    const snapshot = this.#state.snapshot;
    const issues = validateGeometry(snapshot.geometry);
    const panel = document.querySelector<HTMLElement>('#geometry-editor');
    panel?.toggleAttribute('hidden', !this.#editing);
    document
      .querySelector('#edit-geometry')
      ?.setAttribute('aria-pressed', String(this.#editing));
    const simulate =
      document.querySelector<HTMLButtonElement>('#simulate-geometry');
    if (simulate) simulate.disabled = issues.length > 0;
    const undo = document.querySelector<HTMLButtonElement>('#editor-undo');
    const redo = document.querySelector<HTMLButtonElement>('#editor-redo');
    if (undo) undo.disabled = !this.#state.canUndo;
    if (redo) redo.disabled = !this.#state.canRedo;
    const selected =
      snapshot.selected === null
        ? undefined
        : snapshot.geometry.floor[snapshot.selected];
    for (const axis of ['x', 'y'] as const) {
      const input = document.querySelector<HTMLInputElement>(`#editor-${axis}`);
      if (input) {
        input.disabled = !selected;
        input.value = selected?.[axis].toFixed(2) ?? '';
      }
    }
    const errors = document.querySelector<HTMLUListElement>('#editor-errors');
    if (errors)
      errors.innerHTML = issues.length
        ? issues.map((issue) => `<li>${issue.message}</li>`).join('')
        : '<li>Geometry is valid and ready to simulate.</li>';
    (GEOMETRIES as Record<GeometryId, Geometry>).custom = snapshot.geometry;
    this.#canvas.classList.toggle('is-editing', this.#editing);
    if (notify) this.#listener(snapshot.geometry, issues, this.#editing);
  }
}
