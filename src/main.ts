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

const app = document.querySelector<HTMLDivElement>('#app');
if (!app) throw new Error('Application root was not found.');
app.innerHTML = applicationMarkup();

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

reset.addEventListener('click', () => {
  settings = controls.settings;
  state = releaseBatch(createState(), settings);
  clock = { accumulator: 0 };
});

pause.addEventListener('click', () => {
  paused = !paused;
  pause.textContent = paused ? 'Resume' : 'Pause';
  pause.setAttribute('aria-pressed', String(paused));
  status.textContent = paused ? 'Paused' : 'Running';
  statusContainer.classList.toggle('is-paused', paused);
});

release.addEventListener('click', () => {
  settings = controls.settings;
  state = releaseBatch(state, settings);
});

function updateMetrics(): void {
  const metrics = getMetrics(state);
  required('#metric-active').textContent = String(metrics.active);
  required('#metric-settled').textContent = String(metrics.settled);
  required('#metric-overflowed').textContent = String(metrics.overflowed);
  required('#metric-travel').textContent =
    `${Math.round(metrics.averageTravel * 100)}%`;
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
