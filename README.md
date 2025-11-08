# Agent Experiments

Collection of research projects built using remote/cloud AI agents. Inspired by [Simon Willison's async code research approach](https://simonwillison.net/2025/Nov/6/async-code-research/).

Each directory in `projects/` is a separate research project, primarily using TypeScript. Every artifact is AI-generated unless noted otherwise.

## Projects

<!-- [[[cog
import os
from pathlib import Path
from datetime import datetime

def get_dir_mtime(dir_path):
    try:
        git_time = os.popen(f'git log -1 --format=%ct "{dir_path}" 2>/dev/null').read().strip()
        if git_time:
            return int(git_time)
    except:
        pass
    return int(os.path.getmtime(dir_path))

projects_dir = Path('projects')
if projects_dir.exists():
    dirs = [d for d in projects_dir.iterdir() if d.is_dir() and not d.name.startswith('.')]
    dirs.sort(key=lambda d: get_dir_mtime(d), reverse=True)

    for project_dir in dirs:
        project_name = project_dir.name
        summary_file = project_dir / '_summary.md'

        if summary_file.exists():
            summary = summary_file.read_text().strip()
        else:
            summary = "No summary available yet."

        cog.outl(f"### [{project_name}](projects/{project_name}/)")
        cog.outl()
        cog.outl(summary)
        cog.outl()
else:
    cog.outl("*No projects yet.*")
]]] -->
### [hello-world](projects/hello-world/)

Agent experiments dev environment
Node: v22.20.0
pnpm: 10.20.0
TypeScript: Version 5.9.3
This project implements a basic "Hello, World!" application in TypeScript to validate repository setup and development workflows. It uses pnpm for package management, Nix for environment reproducibility, and Node.js 22 to execute the compiled TypeScript code, ensuring workspace configuration, shared configurations, and compilation processes work seamlessly. By doing so, it addresses the need for a reliable starting point for future TypeScript-based projects in the repository.

<!-- [[[end]]] -->

## Setup

This repository uses:
- **pnpm workspaces** for monorepo management
- **Biome** for linting and formatting
- **TypeScript 5.7+** for type safety
- **Nix** for reproducible dev environment

```bash
# Enter dev environment
nix-shell

# Install dependencies
pnpm install

# Lint all projects
pnpm lint
```

## Workflow

1. Agent receives research task
2. Agent creates new directory in `projects/`
3. Agent implements, tests, documents
4. Agent files PR with transcript
5. GitHub Actions auto-updates this README
