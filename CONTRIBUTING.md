# Contributing to @cascoder/canvas

Thank you for considering contributing! This guide will help you get started.

## Development Setup

### Prerequisites

- Node.js >= 20.0.0
- pnpm >= 9.15.0

### Getting Started

```bash
# Clone the repo
git clone https://github.com/cascoder-ai/canvas.git
cd canvas

# Install dependencies
pnpm install

# Start development
pnpm run dev

# Run the playground demo
pnpm run playground
```

### Project Structure

```
packages/
  canvas-core/     # Framework-agnostic engine (store, types, engines)
  canvas-react/    # React components, hooks, and Konva renderer
apps/
  playground/      # Demo application / reference implementation
```

## Development Workflow

### Building

```bash
# Build all packages
pnpm run build

# Build specific package
pnpm --filter @cascoder/canvas-core build
```

### Testing

```bash
# Run all tests
pnpm run test

# Run tests in watch mode
pnpm --filter @cascoder/canvas-core test:watch
```

### Type Checking

```bash
pnpm run typecheck
```

## Making Changes

### Branch Strategy

- `main` — stable, release-ready code
- `feat/*` — new features
- `fix/*` — bug fixes
- `docs/*` — documentation changes

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat(core): add gradient rendering support
fix(react): correct SelectionOverlay handle positions
docs: update API reference for useEditor
test(core): add SnapEngine threshold tests
```

### Pull Request Checklist

- [ ] Code compiles without errors (`pnpm run typecheck`)
- [ ] All tests pass (`pnpm run test`)
- [ ] Build succeeds (`pnpm run build`)
- [ ] Changes are documented in CHANGELOG.md
- [ ] New features include tests
- [ ] Code follows existing patterns and style

## Architecture Principles

1. **canvas-core is framework-agnostic** — no React imports, no DOM APIs
2. **TypeScript-first** — all public APIs must be fully typed
3. **Zustand for state** — use slices pattern, keep reducers pure
4. **Konva for rendering** — all canvas rendering goes through react-konva
5. **Plugin-friendly** — expose hooks and events for extension

## Reporting Issues

Use [GitHub Issues](https://github.com/cascoder-ai/canvas/issues) with these templates:

- **Bug Report** — include reproduction steps, expected vs actual behavior
- **Feature Request** — describe the use case, not just the solution

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
