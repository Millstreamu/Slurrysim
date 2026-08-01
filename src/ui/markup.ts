import { GEOMETRIES } from '../simulation/geometry';
import { FLUID_PRESETS, PARTICLE_PRESETS } from '../engineering/properties';

export function applicationMarkup(): string {
  return `
    <main class="app-shell">
      <section class="workspace" aria-labelledby="page-title">
        <header class="topbar">
          <div>
            <p class="eyebrow">Slurry line · settling study</p>
            <h1 id="page-title">Rock Box Simulator</h1>
          </div>
          <div class="actions" aria-label="Simulation actions">
            <button class="btn btn-secondary" id="shortcuts" type="button" aria-keyshortcuts="?">Keyboard help</button>
            <button class="btn btn-secondary" id="reset" type="button">Reset</button>
            <button class="btn btn-secondary" id="pause" type="button">Pause</button>
            <button class="btn btn-primary" id="release" type="button">Release batch</button>
          </div>
        </header>

        <section class="simulation-card" aria-label="Rock box simulation">
          <canvas id="simulation" role="img" aria-label="Animated conceptual rock box and slurry flow"></canvas>
          <div class="canvas-status"><span class="status-dot"></span><span id="run-status">Running</span></div>
          <p class="sr-only" id="simulation-announcer" aria-live="polite" aria-atomic="true"></p>
        </section>

        <div class="legend" aria-label="Simulation legend">
          <span><i class="legend-rock"></i> Rock — settles by weight</span>
          <span><i class="legend-flow"></i> Fine slurry — carried over the weir</span>
          <span><i class="legend-weir"></i> Overflow weir</span>
        </div>

        <section class="metrics" aria-labelledby="results-title">
          <div class="results-heading"><h2 id="results-title">Illustrative results</h2><span>Conceptual · not engineering validated</span></div>
          <article><span>In motion</span><strong id="metric-active">0</strong></article>
          <article><span>Settled</span><strong id="metric-settled">0</strong></article>
          <article><span>Overflowed</span><strong id="metric-overflowed">0</strong></article>
          <article><span>Elapsed simulation time</span><strong id="metric-elapsed">0.0 s</strong></article>
          <article><span>Settling fraction</span><strong id="metric-settling-fraction">—</strong></article>
          <article><span>Overflow fraction</span><strong id="metric-overflow-fraction">—</strong></article>
          <article><span>Settling rate</span><strong id="metric-settling-rate">—</strong></article>
          <article><span>Overflow rate</span><strong id="metric-overflow-rate">—</strong></article>
        </section>
      </section>

      <aside class="controls" aria-label="Simulation controls">
        <div class="control-heading">
          <div><p class="eyebrow">Parameters</p><h2>Model controls</h2></div>
          <span class="concept-tag">Concept model</span>
        </div>
        <section class="control-group">
          <h3>Box geometry</h3>
          <div class="preset-list" id="geometry">
            ${Object.values(GEOMETRIES)
              .filter((geometry) => geometry.id !== 'custom')
              .map(
                (geometry) =>
                  `<label class="preset-option"><input type="radio" name="geometry" value="${geometry.id}" ${geometry.id === 'classic' ? 'checked' : ''}><span><strong>${geometry.name}</strong><small>${geometry.description}</small></span></label>`,
              )
              .join('')}
          </div>
          <p class="preset-behavior" id="preset-behavior">Selecting a preset starts a fresh deterministic batch with the current parameters.</p>
          <button class="btn btn-secondary editor-launch" id="edit-geometry" type="button" aria-pressed="false">Edit selected geometry</button>
          <section id="geometry-editor" class="geometry-editor" aria-labelledby="editor-title" hidden>
            <h4 id="editor-title">Custom shape editor</h4>
            <p id="editor-instructions">Select and move the nearest floor point by clicking the diagram, or use the precise coordinate fields. Values snap to a 0.01 grid.</p>
            <div class="editor-tools" role="toolbar" aria-label="Geometry editing tools">
              <button class="btn btn-secondary" id="editor-add" type="button">Add point</button>
              <button class="btn btn-secondary" id="editor-delete" type="button">Delete selected</button>
              <button class="btn btn-secondary" id="editor-undo" type="button">Undo</button>
              <button class="btn btn-secondary" id="editor-redo" type="button">Redo</button>
              <button class="btn btn-secondary" id="editor-reset" type="button">Reset to preset</button>
            </div>
            <div class="coordinate-fields">
              <label>X coordinate <input id="editor-x" type="number" min="0.04" max="0.96" step="0.01" disabled></label>
              <label>Y coordinate <input id="editor-y" type="number" min="0.13" max="0.98" step="0.01" disabled></label>
            </div>
            <ul id="editor-errors" class="editor-errors" aria-live="polite"></ul>
            <button class="btn btn-primary" id="simulate-geometry" type="button">Use geometry &amp; simulate</button>
          </section>
        </section>
        <section class="control-group">
          <h3>Feed &amp; flow</h3>
          ${rangeMarkup('flowRate', 'Flow rate', 55, 0, 100, '%', 'Speed of slurry through the line')}
          ${rangeMarkup('pressure', 'Line pressure', 40, 0, 100, '%', 'Higher pressure keeps material suspended')}
          ${rangeMarkup('batchSize', 'Batch size', 34, 1, 60, ' rocks', 'Rocks released with each batch')}
          ${rangeMarkup('turbulence', 'Turbulence', 40, 0, 100, '%', 'Eddies stir and re-suspend material')}
        </section>
        <section class="control-group">
          <h3>Rock material</h3>
          ${rangeMarkup('density', 'Material density', 68, 20, 100, '%', 'Relative effective settling weight')}
        </section>
        <section class="control-group physical-properties" aria-labelledby="physical-properties-title">
          <div class="property-heading"><h3 id="physical-properties-title">Physical properties</h3><span>Draft inputs · SI stored</span></div>
          <p>These properties are prepared for the reviewed Phase 3 calculation model. They do not change the conceptual animation yet.</p>
          <label class="property-preset">Fluid preset
            <select id="fluid-preset">${presetOptions(FLUID_PRESETS)}</select>
          </label>
          <p class="preset-source">Source: <a href="${FLUID_PRESETS[0]!.provenance.url}" target="_blank" rel="noreferrer">${FLUID_PRESETS[0]!.provenance.source}</a>. ${FLUID_PRESETS[0]!.provenance.note}</p>
          ${propertyInput('fluidDensity', 'Liquid density', 'kg/m³', '998.2', 'any finite value greater than 0')}
          ${propertyInput('dynamicViscosity', 'Dynamic viscosity', 'mPa·s', '1.002', 'any finite value greater than 0')}
          ${propertyInput('temperature', 'Temperature', '°C', '20', 'above absolute zero')}
          <p class="derived-property"><span>Kinematic viscosity (derived)</span><output id="kinematic-viscosity"></output></p>
          <label class="property-preset">Particle preset
            <select id="particle-preset">${presetOptions(PARTICLE_PRESETS)}</select>
          </label>
          <p class="preset-source">Source: <a href="${PARTICLE_PRESETS[0]!.provenance.url}" target="_blank" rel="noreferrer">${PARTICLE_PRESETS[0]!.provenance.source}</a>. ${PARTICLE_PRESETS[0]!.provenance.note}</p>
          ${propertyInput('particleDensity', 'Particle density', 'kg/m³', '2650', 'any finite value greater than 0')}
          ${propertyInput('diameter', 'Equivalent spherical diameter', 'mm', '5', 'any finite value greater than 0')}
          ${propertyInput('sphericity', 'Sphericity', 'dimensionless', '1', 'greater than 0 and at most 1')}
          ${propertyInput('solidsVolumeFraction', 'Solids volume fraction', 'm³/m³', '0.1', 'at least 0 and less than 1')}
          <p class="property-key"><strong>Validation:</strong> errors are invalid physical values; warnings are valid inputs outside the draft applicability envelope. Values are never clamped.</p>
        </section>
        <p class="disclaimer"><strong>Conceptual model.</strong> Results are visual estimates and are not suitable for engineering or safety decisions.</p>
      </aside>
      <dialog id="shortcuts-dialog" aria-labelledby="shortcuts-title">
        <div class="dialog-heading"><h2 id="shortcuts-title">Keyboard shortcuts</h2><button class="btn btn-secondary" id="shortcuts-close" type="button">Close</button></div>
        <p>Shortcuts work outside form fields. Tab and Shift+Tab move through every control.</p>
        <dl><div><dt><kbd>Space</kbd></dt><dd>Pause or resume</dd></div><div><dt><kbd>R</kbd></dt><dd>Reset the run</dd></div><div><dt><kbd>B</kbd></dt><dd>Release a batch</dd></div><div><dt><kbd>?</kbd></dt><dd>Open this help</dd></div><div><dt><kbd>Esc</kbd></dt><dd>Close help or cancel a number edit</dd></div><div><dt><kbd>Arrow keys</kbd></dt><dd>Adjust sliders and number fields</dd></div></dl>
        <p>In the shape editor, use Tab to reach Add, Delete, Undo, Redo, Reset, and precise X/Y fields.</p>
      </dialog>
    </main>`;
}

function presetOptions(
  presets: readonly { id: string; name: string }[],
): string {
  return presets
    .map(({ id, name }) => `<option value="${id}">${name}</option>`)
    .join('');
}

function propertyInput(
  id: string,
  label: string,
  unit: string,
  value: string,
  domain: string,
): string {
  return `<div class="property-input"><div><label for="${id}">${label}</label><span>${unit}</span></div><input id="${id}" type="number" inputmode="decimal" value="${value}" aria-describedby="${id}-domain ${id}-diagnostic"><small id="${id}-domain">Physical domain: ${domain}.</small><p id="${id}-diagnostic" class="property-diagnostic" aria-live="polite"></p></div>`;
}

function rangeMarkup(
  id: string,
  label: string,
  value: number,
  minimum: number,
  maximum: number,
  suffix: string,
  description: string,
): string {
  const numberId = `${id}-number`;
  const descriptionId = `${id}-description`;
  const errorId = `${id}-error`;
  return `<div class="range-control">
    <div class="range-label"><label for="${id}">${label}</label><span class="unit">${suffix.trim() || 'dimensionless'}</span></div>
    <div class="paired-input"><input id="${id}" aria-label="${label} slider" aria-describedby="${descriptionId}" type="range" min="${minimum}" max="${maximum}" step="1" value="${value}"><input id="${numberId}" aria-label="${label} value" aria-describedby="${descriptionId} ${errorId}" type="number" inputmode="decimal" min="${minimum}" max="${maximum}" step="1" value="${value}"></div>
    <p id="${descriptionId}">${description} Default ${value}; range ${minimum}–${maximum}; step 1.</p>
    <p class="field-error" id="${errorId}" aria-live="polite"></p>
  </div>`;
}
