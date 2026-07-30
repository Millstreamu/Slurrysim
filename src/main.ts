import './styles/design-system.css';
import './styles/app.css';
import {
  createState,
  DEFAULT_SETTINGS,
  getMetrics,
  releaseBatch,
  stepSimulation,
} from './simulation/model';
import { SimulationRenderer } from './simulation/renderer';
import type { Settings, SimulationState } from './simulation/types';
import { Controls } from './ui/controls';
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
const renderer = new SimulationRenderer(canvas);
const controls = new Controls(settings, (nextSettings) => {
  settings = nextSettings;
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
}

function frame(time: number): void {
  const deltaTime = (time - previousTime) / 1000;
  previousTime = time;
  if (!paused) state = stepSimulation(state, settings, deltaTime);
  renderer.render(state, settings);
  updateMetrics();
  requestAnimationFrame(frame);
}

requestAnimationFrame(frame);
