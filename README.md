# 3D Chess

<p align="center">
  <a href="./LICENSE"><img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="License: MIT" /></a>
  <a href="https://vitejs.dev/"><img src="https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=white" alt="Vite" /></a>
  <a href="https://threejs.org/"><img src="https://img.shields.io/badge/Three.js-000000?style=flat-square&logo=threedotjs&logoColor=white" alt="Three.js" /></a>
  <img src="https://img.shields.io/badge/JavaScript-ES%20Modules-F7DF1E?style=flat-square&logo=javascript&logoColor=black" alt="JavaScript ES Modules" />
  <img src="https://img.shields.io/badge/Node.js-%3E%3D%2018-339933?style=flat-square&logo=nodedotjs&logoColor=white" alt="Node.js 18+" />
  <img src="https://img.shields.io/badge/AI-Claude%20Code%20%2B%20DeepSeek-7C3AED?style=flat-square" alt="Claude Code + DeepSeek" />
  <img src="https://img.shields.io/badge/PRs-welcome-brightgreen?style=flat-square" alt="PRs welcome" />
</p>

**Author:** [ChandlerIdeaCreator](https://github.com/ChandlerIdeaCreator) — Northeastern University (NEU / 东北大学)

A browser-based **3D chess** experience built with **Three.js** and **Vite**. It features a minimalist board, stylized piece models, soft lighting with cast shadows, and a lightweight HUD for game state (including turn tracking).

<p align="center">
  <img src="./show_figure1.png" alt="3D Chess — isometric view with White's turn indicator" height="320" />
  &nbsp;&nbsp;
  <img src="./show_figure2.png" alt="3D Chess — perspective view from Black's side" height="320" />
</p>

> **AI-assisted development (important):**  
> The codebase for this project was **co-authored using [Claude Code](https://www.anthropic.com/claude-code)** together with **DeepSeek-V4-Pro**.  
> Human direction, review, and integration decisions shaped the architecture and gameplay; the AI pair-programming workflow was used extensively for implementation, refactors, and iteration speed.

---

## Features

- **Full 3D rendering** with a thick board, stylized pieces, and readable materials
- **Standard chess rules** with move validation, game status, and interactive play
- **Turn indicator** and supporting UI for captures and promotion flows
- **Modern dev stack**: native ES modules, fast local dev server, production build to `dist/`

## Tech Stack

| Area        | Choice                          |
| ----------- | ------------------------------- |
| Runtime     | Modern browsers (ES modules)    |
| 3D          | [Three.js](https://threejs.org/) |
| Tooling     | [Vite](https://vitejs.dev/)      |

## Requirements

- **Node.js** 18+ (recommended: current LTS)

## Getting Started

```bash
git clone <your-repo-url>
cd <cloned-repository-folder>
npm install
npm run dev
```

The dev server defaults to **port 3000** and may open your browser automatically (see `vite.config.js`).

### Scripts

| Command        | Description                |
| -------------- | -------------------------- |
| `npm run dev`  | Start Vite dev server      |
| `npm run build`| Production build → `dist/` |
| `npm run preview` | Preview the production build locally |

## Project Layout (high level)

```
src/
  core/          # Game orchestration
  engine/        # Rules, pieces, validation, status
  renderer/      # Board, pieces, lighting, interaction
  ui/            # Status bar, dialogs, styles
```

## Contributing

Issues and pull requests are welcome. Please keep changes focused and match existing code style.

## License

This project is licensed under the **MIT License** — see [`LICENSE`](./LICENSE).
