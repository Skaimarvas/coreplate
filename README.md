# coreplate

`coreplate` is an npm module and CLI for generating opinionated project skeletons for:

- Web: React + Vite + TypeScript
- Mobile: React Native + Expo + TypeScript

## Included in generated project

- TanStack Query
- Axios
- React Hook Form
- Zustand
- Documentation files: `README.md`, `DESIGN.md`, `CLAUDE.md`
- Skill-like guidance files in `skills/` and `.github/copilot-instructions.md`

## Structure modes

You can scaffold one of these draft structure styles:

- `component-based` (default)
- `feature-based`
- `atomic-based`

When runtime is `expo`, route-oriented folders use `screens` instead of `pages`.

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

It also asks:

- Runtime: `web` or `expo`
- Structure: `component-based`, `feature-based`, or `atomic-based`

After answering, it prints a summary of selected packages before generating files.

## CLI options

```bash
coreplate <project-name> [--dir <path>] [--force]
```

- `--dir <path>`: target directory (defaults to `./<project-name>`)
- `--force`: allows writing into a non-empty target directory
- `--yes`: skip prompts and include all optional packages
- `--no-interactive`: skip prompts and use passed flags/defaults
- `--runtime <web|expo>`: select runtime
- `--expo`: shortcut for `--runtime expo`
- `--structure <component|feature|atomic>`: select project structure mode
- `--no-axios`, `--no-zustand`, `--no-react-hook-form`, `--no-tanstack-query`: disable specific optional packages

## Examples

```bash
# default (non-interactive): web + component-based
coreplate my-web-app --no-interactive

# Expo + atomic structure
coreplate my-mobile-app --runtime expo --structure atomic --no-interactive

# Feature-based web app without Zustand
coreplate my-feature-app --structure feature --no-zustand --no-interactive
```

## Development

```bash
npm install
npm run build
```

After building, test locally:

```bash
node dist/cli.js demo-app
```
