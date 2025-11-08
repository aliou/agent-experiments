# Hello World

Simple "Hello, World!" program in TypeScript to test the repository setup.

## Usage

```bash
# Enter nix shell
nix-shell

# Install dependencies
pnpm install

# Build and run
cd projects/hello-world
pnpm build
pnpm start
```

## Output

```
Hello, World!
```

This project verifies that:
- pnpm workspace is configured correctly
- TypeScript compilation works
- Shared configs (biome.json, tsconfig.base.json) are accessible
- Node 22 runtime executes compiled code
