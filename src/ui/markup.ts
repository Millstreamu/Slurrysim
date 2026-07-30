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
            <button class="btn btn-secondary" id="reset" type="button">Reset</button>
            <button class="btn btn-secondary" id="pause" type="button">Pause</button>
            <button class="btn btn-primary" id="release" type="button">Release batch</button>
          </div>
        </header>

        <section class="simulation-card" aria-label="Rock box simulation">
          <canvas id="simulation" role="img" aria-label="Animated conceptual rock box and slurry flow"></canvas>
          <div class="canvas-status"><span class="status-dot"></span><span id="run-status">Running</span></div>
        </section>

        <div class="legend" aria-label="Simulation legend">
          <span><i class="legend-rock"></i> Rock — settles by weight</span>
          <span><i class="legend-flow"></i> Fine slurry — carried over the weir</span>
          <span><i class="legend-weir"></i> Overflow weir</span>
        </div>

        <section class="metrics" aria-label="Simulation results">
          <article><span>In motion</span><strong id="metric-active">0</strong></article>
          <article><span>Settled</span><strong id="metric-settled">0</strong></article>
          <article><span>Overflowed</span><strong id="metric-overflowed">0</strong></article>
          <article><span>Average travel</span><strong id="metric-travel">0%</strong></article>
        </section>
      </section>

      <aside class="controls" aria-label="Simulation controls">
        <div class="control-heading">
          <div><p class="eyebrow">Parameters</p><h2>Model controls</h2></div>
          <span class="concept-tag">Concept model</span>
        </div>
        <section class="control-group">
          <h3>Box geometry</h3>
          <div class="segmented" id="geometry">
            <label><input type="radio" name="geometry" value="classic" checked><span>Classic</span></label>
            <label><input type="radio" name="geometry" value="deep"><span>Deep sump</span></label>
            <label><input type="radio" name="geometry" value="shallow"><span>Shallow</span></label>
          </div>
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
        <p class="disclaimer"><strong>Conceptual model.</strong> Results are visual estimates and are not suitable for engineering or safety decisions.</p>
      </aside>
    </main>`;
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
  return `<div class="range-control">
    <div class="range-label"><label for="${id}">${label}</label><output id="${id}-value" for="${id}">${value}${suffix}</output></div>
    <input id="${id}" type="range" min="${minimum}" max="${maximum}" value="${value}" data-suffix="${suffix}">
    <p>${description}</p>
  </div>`;
}
