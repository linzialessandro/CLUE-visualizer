# CLUE Model — Interactive Companion

[![Deploy to GitHub Pages](https://github.com/linzialessandro/CLUE-visualizer/actions/workflows/deploy.yml/badge.svg)](https://github.com/linzialessandro/CLUE-visualizer/actions/workflows/deploy.yml)

**Interactive visualization companion for the paper:**

> **A formal model of Cooperative Learning for Understanding and Epistemic Progress**
> Alessandro Linzi — *SN Social Sciences* (Springer)
> DOI: [available upon publication]

🔗 **Live demo:** [linzialessandro.github.io/CLUE-visualizer](https://linzialessandro.github.io/CLUE-visualizer/)

---

## About the CLUE Model

The CLUE model (Cooperative Learning for Understanding and Epistemic Progress) formalizes how individual epistemic growth is constituted by reciprocal social interaction. Conceptions are modeled as sequences in the Baire space **ℕ^ℕ**, and understanding advances through cooperative exchanges that bring individuals closer to their unique ideal conceptions.

The convergence theorem proves that under Axiom 1 — which guarantees the existence of mutually beneficial partners — every individual reaches their ideal conception.

## Features

- **Worked Example** — Interactive step-by-step replay of the paper's Section 3.1 example
- **Conception Grid** — Color-coded matrix view of all agents' sequences with match/diverge highlighting
- **Distance Chart** — D3-based line chart tracking d(C_i(t), C*_i) over time with IQR band
- **Interaction Network** — Force-directed graph showing agent exchange patterns
- **Distance Heatmap** — Agent × time grid visualizing convergence dynamics
- **Timeline Scrubbing** — Rewind and replay any step of the simulation
- **Custom Scenarios** — Generate random communities or use preset configurations
- **KaTeX Math** — Proper mathematical notation throughout

## Tech Stack

- **React 19** + **TypeScript**
- **D3.js v7** for all visualizations (no Plotly — lighter, better animations)
- **KaTeX** for mathematical rendering
- **Vite 7** for blazing-fast development and builds
- Deployed to **GitHub Pages** via GitHub Actions

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) ≥ 18
- [npm](https://www.npmjs.com/)

### Installation

```bash
git clone https://github.com/linzialessandro/CLUE-visualizer.git
cd CLUE-visualizer
npm install
```

### Development

```bash
npm run dev
```

Opens at `http://localhost:5173/CLUE-visualizer/`

### Build

```bash
npm run build
npm run preview
```

## Deployment

The site deploys automatically to GitHub Pages on push to `main` via the [deploy workflow](.github/workflows/deploy.yml). To set up:

1. Go to **Settings → Pages** in your GitHub repository
2. Under **Build and deployment**, select **GitHub Actions**
3. Push to `main` — the workflow runs automatically

## Project Structure

```
src/
├── engine/                 # Core simulation logic
│   ├── baire-metric.ts     # Baire space metric d(x,y)
│   ├── axiom.ts            # Axiom 1 exchange logic (corrected)
│   ├── simulation.ts       # Simulation runner with full history
│   └── scenarios.ts        # Pre-built and generated scenarios
├── components/
│   ├── layout/             # Header, Footer
│   ├── visualizations/     # ConceptionGrid, DistanceChart, Heatmap, Network
│   ├── worked-example/     # Interactive Section 3.1 replay
│   ├── sandbox/            # Full simulation lab (Controls, Timeline)
│   └── shared/             # MathBlock (KaTeX wrapper)
├── hooks/
│   └── useSimulation.ts    # Simulation state management
└── styles/                 # Design system (tokens, typography, layout, animations)
```

## Axiom 1 — Correctness Note

The exchange logic implements the paper's Axiom 1 with full mutual-benefit verification: both agents must share the same minimal diverging index *k* and each must hold the other's ideal value at position *k*. This is the only configuration where a single-index swap strictly decreases both distances, as required by the axiom.

## License

MIT License © 2025 Alessandro Linzi

## Citation

```bibtex
@article{linzi2025clue,
  title     = {A formal model of Cooperative Learning for Understanding and Epistemic Progress},
  author    = {Linzi, Alessandro},
  journal   = {SN Social Sciences},
  publisher = {Springer},
  year      = {2025}
}
```
