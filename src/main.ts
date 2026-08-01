import './styles/design-system.css';
import './styles/app.css';
import {
  createState,
  DEFAULT_SETTINGS,
  getMetrics,
  MAX_PARTICLES,
  releaseBatch,
  stepSimulation,
} from './simulation/model';
import { SimulationRenderer } from './simulation/renderer';
import { advanceClock, type SimulationClock } from './simulation/timing';
import type { Settings, SimulationState } from './simulation/types';
import { Controls } from './ui/controls';
import { GeometryEditor } from './ui/geometry-editor';
import { applicationMarkup } from './ui/markup';
import { DEFAULT_PHYSICAL_PROPERTIES } from './engineering/properties';
import { PropertyControls } from './ui/property-controls';

const app = document.querySelector<HTMLDivElement>('#app');
if (!app) throw new Error('Application root was not found.');
app.innerHTML = applicationMarkup();
new PropertyControls(DEFAULT_PHYSICAL_PROPERTIES);

const canvas = document.querySelector<HTMLCanvasElement>('#simulation');
if (!canvas) throw new Error('Simulation canvas was not found.');

let settings: Settings = { ...DEFAULT_SETTINGS };
let state: SimulationState = releaseBatch(createState(), settings);
let paused = false;
let previousTime = performance.now();
let clock: SimulationClock = { accumulator: 0 };
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const renderer = new SimulationRenderer(canvas, {
  debug: new URLSearchParams(location.search).has('debugCollisions'),
  reducedMotion: reducedMotion.matches,
});
const controls = new Controls(settings, (nextSettings, change) => {
  settings = nextSettings;
  if (change.geometryChanged) {
    editor.setPreset(settings.geometry);
    state = releaseBatch(createState(), settings);
    clock = { accumulator: 0 };
  }
});
const editor = new GeometryEditor(canvas, (_geometry, issues, editing) => {
  if (editing || issues.length === 0) {
    controls.useGeometry('custom', false);
    settings = controls.settings;
    state = editing ? createState() : releaseBatch(createState(), settings);
    clock = { accumulator: 0 };
  }
});

const required = <T extends Element>(selector: string): T => {
  const element = document.querySelector<T>(selector);
  if (!element) throw new Error(`Missing required element: ${selector}`);
  return element;
};

const reset = required<HTMLButtonElement>('#reset');
const pause = required<HTMLButtonElement>('#pause');
const release = required<HTMLButtonElement>('#release');
const status = required<HTMLSpanElement>('#run-status');
const statusContainer = required<HTMLDivElement>('.canvas-status');
const announcer = required<HTMLParagraphElement>('#simulation-announcer');
const shortcuts = required<HTMLButtonElement>('#shortcuts');
const shortcutsDialog = required<HTMLDialogElement>('#shortcuts-dialog');

const announce = (message: string): void => {
  announcer.textContent = '';
  window.setTimeout(() => (announcer.textContent = message), 20);
};

reset.addEventListener('click', () => {
  settings = controls.settings;
  state = releaseBatch(createState(), settings);
  clock = { accumulator: 0 };
  announce('Simulation reset to a fresh deterministic batch.');
});

pause.addEventListener('click', () => {
  paused = !paused;
  pause.textContent = paused ? 'Resume' : 'Pause';
  pause.setAttribute('aria-pressed', String(paused));
  status.textContent = paused ? 'Paused' : 'Running';
  statusContainer.classList.toggle('is-paused', paused);
  announce(paused ? 'Simulation paused.' : 'Simulation resumed.');
});

release.addEventListener('click', () => {
  settings = controls.settings;
  state = releaseBatch(state, settings);
  announce(`Released ${settings.batchSize} particles.`);
});

shortcuts.addEventListener('click', () => shortcutsDialog.showModal());
required<HTMLButtonElement>('#shortcuts-close').addEventListener('click', () =>
  shortcutsDialog.close(),
);
shortcutsDialog.addEventListener('close', () => shortcuts.focus());

document.addEventListener('keydown', (event) => {
  const target = event.target as HTMLElement;
  if (target.matches('input, textarea, select, button') || shortcutsDialog.open)
    return;
  const key = event.key.toLowerCase();
  if (event.key === ' ' || key === 'r' || key === 'b' || event.key === '?')
    event.preventDefault();
  if (event.key === ' ') pause.click();
  else if (key === 'r') reset.click();
  else if (key === 'b') release.click();
  else if (event.key === '?') shortcuts.click();
});

function updateMetrics(): void {
  const metrics = getMetrics(state);
  required('#metric-active').textContent = String(metrics.active);
  required('#metric-settled').textContent = String(metrics.settled);
  required('#metric-overflowed').textContent = String(metrics.overflowed);
  required('#metric-elapsed').textContent =
    `${metrics.elapsedSeconds.toFixed(1)} s`;
  const fraction = (value: number | null): string =>
    value === null || !Number.isFinite(value)
      ? '—'
      : `${(value * 100).toFixed(1)}%`;
  const rate = (value: number | null): string =>
    value === null || !Number.isFinite(value)
      ? '—'
      : `${value.toFixed(2)} particles/s`;
  required('#metric-settling-fraction').textContent = fraction(
    metrics.settlingFraction,
  );
  required('#metric-overflow-fraction').textContent = fraction(
    metrics.overflowFraction,
  );
  required('#metric-settling-rate').textContent = rate(metrics.settlingRate);
  required('#metric-overflow-rate').textContent = rate(metrics.overflowRate);
  if (!paused) {
    const label =
      metrics.active + metrics.settled === 0
        ? 'Empty'
        : state.particles.length >= MAX_PARTICLES
          ? 'Overloaded'
          : 'Running';
    status.textContent = label;
    statusContainer.classList.toggle('is-overloaded', label === 'Overloaded');
    canvas!.setAttribute(
      'aria-label',
      `${label} · animated conceptual rock box and slurry flow`,
    );
  }
}

function frame(time: number): void {
  const deltaTime = (time - previousTime) / 1000;
  previousTime = time;
  clock = advanceClock(clock, deltaTime, paused, (step) => {
    state = stepSimulation(state, settings, step);
  });
  renderer.render(state, settings);
  updateMetrics();
  requestAnimationFrame(frame);
}

requestAnimationFrame(frame);
