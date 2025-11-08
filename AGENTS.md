# AGENTS.md

This file provides guidance to AI coding agents when working with code in this repository.

## Repository Purpose

This is a research repository for AI agent experiments, inspired by Simon Willison's async code research approach. Each project in `projects/` is a self-contained research experiment, primarily in TypeScript. All artifacts are AI-generated unless noted.

## Development Environment

This repository uses **Nix** for reproducible environments. Always run development commands inside `nix-shell`:

```bash
nix-shell                    # Enter dev environment (provides Node 22, pnpm, TypeScript, uv)
pnpm install                 # Install dependencies (run inside nix-shell)
pnpm lint                    # Lint all projects
pnpm lint:fix                # Fix linting issues
pnpm format                  # Format code
```

## Project Structure

This is a **pnpm workspace monorepo**:
- `projects/*/` - Individual research projects (each with its own `package.json`)
- `biome.json` - Shared linting/formatting config for all projects
- `tsconfig.base.json` - Shared TypeScript config (extend in project-level `tsconfig.json`)
- `.github/actions/update-readme/` - Custom GitHub Action with Python deps (cog + llm) managed via uv

## Creating New Research Projects

When creating a new research project:

1. Create directory: `projects/your-project-name/`
2. Add `package.json` that extends root workspace
3. Add `tsconfig.json` that extends `../../tsconfig.base.json`
4. Create `README.md` with detailed documentation
5. GitHub Actions will auto-generate `_summary.md` and update root README on push to main

Example `tsconfig.json` for new projects:
```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"]
}
```

## README Automation

The root `README.md` is **auto-generated** via GitHub Actions:
- Contains Python cog markers: `<!-- [[[cog ... ]]] -->` and `<!-- [[[end]]] -->`
- Never manually edit content between these markers
- On push to main: workflow scans `projects/`, generates `_summary.md` files via LLM (GitHub Models GPT-4), runs cog to update README
- Python tools (cogapp, llm) are isolated in `.github/actions/update-readme/` with `pyproject.toml` + uv

## Nix Integration

All commands—both locally and in CI—run through `nix-shell`:
- Local: `nix-shell --run "pnpm test"`
- CI: GitHub Actions installs Nix first, then runs commands via nix-shell
- Ensures exact same versions of Node, pnpm, TypeScript, uv everywhere

## Workflow for Agents

Expected workflow when completing research tasks:
1. Receive research task
2. Create new directory in `projects/`
3. Implement solution with tests and documentation
4. File PR (GitHub Actions will auto-update README after merge)
5. Include transcript link in PR description
