# coreplate

`coreplate` is an npm module and CLI for generating an opinionated React + TypeScript project skeleton with common state and data libraries preconfigured.

## Included in generated project

- TanStack Query
- Axios
- React Hook Form
- Zustand
- Documentation files: `README.md`, `DESIGN.md`, `CLAUDE.md`
- Skill-like guidance files in `skills/` and `.github/copilot-instructions.md`

## Usage

```bash
npx coreplate my-app
```

Or when installed globally:

```bash
coreplate my-app
```

By default, the CLI asks package questions in the terminal:

- Install Axios (Y/n)
- Install Zustand (Y/n)
- Install React Hook Form (Y/n)
- Install TanStack Query (Y/n)

After answering, it prints a summary of selected packages before generating files.

## CLI options

```bash
coreplate <project-name> [--dir <path>] [--force]
```

- `--dir <path>`: target directory (defaults to `./<project-name>`)
- `--force`: allows writing into a non-empty target directory
- `--yes`: skip prompts and include all optional packages
- `--no-interactive`: skip prompts and use passed flags/defaults
- `--no-axios`, `--no-zustand`, `--no-react-hook-form`, `--no-tanstack-query`: disable specific optional packages

## Development

```bash
npm install
npm run build
```

After building, test locally:

```bash
node dist/cli.js demo-app
```
