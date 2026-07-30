import { GEOMETRIES } from './geometry';
import type { Settings, SimulationState } from './types';

export class SimulationRenderer {
  readonly #context: CanvasRenderingContext2D;
  readonly #canvas: HTMLCanvasElement;
  readonly #observer: ResizeObserver;
  readonly #debug: boolean;
  readonly #reducedMotion: boolean;

  constructor(
    canvas: HTMLCanvasElement,
    options = { debug: false, reducedMotion: false },
  ) {
    const context = canvas.getContext('2d');
    if (!context)
      throw new Error('Canvas 2D is not supported by this browser.');
    this.#canvas = canvas;
    this.#context = context;
    this.#debug = options.debug;
    this.#reducedMotion = options.reducedMotion;
    this.#observer = new ResizeObserver(() => this.resize());
    this.#observer.observe(canvas);
    this.resize();
  }

  resize(): void {
    const bounds = this.#canvas.getBoundingClientRect();
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    this.#canvas.width = Math.max(1, Math.round(bounds.width * ratio));
    this.#canvas.height = Math.max(1, Math.round(bounds.height * ratio));
    this.#context.setTransform(ratio, 0, 0, ratio, 0, 0);
  }

  render(state: SimulationState, settings: Settings): void {
    const context = this.#context;
    const width = this.#canvas.clientWidth;
    const height = this.#canvas.clientHeight;
    const geometry = GEOMETRIES[settings.geometry];
    context.clearRect(0, 0, width, height);

    const gradient = context.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, '#1b2439');
    gradient.addColorStop(0.58, '#20283d');
    gradient.addColorStop(1, '#171d30');
    context.fillStyle = gradient;
    context.fillRect(0, 0, width, height);

    context.strokeStyle = 'rgba(145, 132, 217, 0.14)';
    context.lineWidth = 1;
    for (let row = 1; row < 6; row += 1) {
      const y = (height / 6) * row;
      context.beginPath();
      context.moveTo(0, y);
      context.lineTo(width, y);
      context.stroke();
    }

    const toX = (x: number): number => x * width;
    const toY = (y: number): number => y * height;
    context.beginPath();
    const first = geometry.floor[0];
    if (first) context.moveTo(toX(first.x), toY(first.y));
    for (const point of geometry.floor.slice(1))
      context.lineTo(toX(point.x), toY(point.y));
    context.lineTo(width, height);
    context.lineTo(0, height);
    context.closePath();
    const floorGradient = context.createLinearGradient(
      0,
      height * 0.6,
      0,
      height,
    );
    floorGradient.addColorStop(0, '#343747');
    floorGradient.addColorStop(1, '#20222e');
    context.fillStyle = floorGradient;
    context.fill();
    context.strokeStyle = '#6d7082';
    context.lineWidth = 2;
    context.stroke();

    if (this.#canvas.classList.contains('is-editing')) {
      context.fillStyle = '#f7c873';
      context.strokeStyle = '#171d30';
      context.lineWidth = 2;
      for (const point of geometry.floor) {
        context.beginPath();
        context.arc(toX(point.x), toY(point.y), 7, 0, Math.PI * 2);
        context.fill();
        context.stroke();
      }
    }

    context.strokeStyle = '#9184d9';
    context.lineWidth = 3;
    context.beginPath();
    context.moveTo(width * 0.96, height * geometry.weirHeight);
    context.lineTo(width * 0.96, height * 0.7);
    context.stroke();

    const flowCount = 7;
    context.lineCap = 'round';
    for (let index = 0; index < flowCount; index += 1) {
      const phase = this.#reducedMotion
        ? index / flowCount
        : (state.elapsed * (0.05 + settings.flowRate / 600) +
            index / flowCount) %
          1;
      const y = height * (0.28 + index * 0.045);
      context.strokeStyle = `rgba(107, 135, 224, ${0.12 + index * 0.018})`;
      context.lineWidth = 2;
      context.beginPath();
      context.moveTo(
        phase * width - width * 0.13,
        y + Math.sin(phase * 12) * 5,
      );
      context.lineTo(phase * width, y);
      context.stroke();
    }

    for (const particle of state.particles) {
      const radius = Math.max(3, particle.radius * Math.min(width, height));
      const particleGradient = context.createRadialGradient(
        toX(particle.x) - radius * 0.3,
        toY(particle.y) - radius * 0.3,
        1,
        toX(particle.x),
        toY(particle.y),
        radius,
      );
      particleGradient.addColorStop(
        0,
        particle.settled ? '#d2cefd' : '#f3f5fe',
      );
      particleGradient.addColorStop(
        1,
        particle.settled ? '#595d6c' : '#75798c',
      );
      context.fillStyle = particleGradient;
      context.beginPath();
      context.arc(toX(particle.x), toY(particle.y), radius, 0, Math.PI * 2);
      context.fill();
    }

    if (this.#debug) {
      context.save();
      context.setLineDash([5, 4]);
      context.strokeStyle = '#ffb86b';
      context.lineWidth = 1;
      context.strokeRect(
        toX(0.04),
        toY(0.12),
        toX(0.92),
        toY(geometry.weirHeight - 0.12),
      );
      context.fillStyle = '#ffb86b';
      context.font = '11px sans-serif';
      context.fillText('collision bounds · ?debugCollisions', 14, height - 14);
      context.restore();
    }
  }
}
