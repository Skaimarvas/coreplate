# coreplate

`coreplate` is an npm CLI for generating opinionated project skeletons for:

- Web: React + Vite + TypeScript
- Mobile: React Native + Expo + TypeScript

## Included in generated project

- TanStack Query
- Axios (with a pre-configured `src/services/api.ts` instance)
- React Hook Form
- Zustand
- Documentation files: `README.md`, `DESIGN.md`, `CLAUDE.md`
- Skill-like guidance files in `skills/` and `.github/copilot-instructions.md`

## Structure modes

- `component-based` (default) — flat src/ folders
- `feature-based` — nested features + shared structure
- `atomic-based` — atoms / molecules / organisms / templates inside components

When runtime is `expo`, route-oriented folders use `screens` instead of `pages`.

## Usage

```bash
# Scaffold into a new directory
npx coreplate my-app

# Scaffold into the current directory
npx coreplate .
```

Or when installed globally:

```bash
coreplate my-app
coreplate .
```

The CLI asks the following questions interactively:

1. **Runtime** — `web` (React + Vite) or `expo` (React Native)
2. **Structure** — `component-based`, `feature-based`, or `atomic-based`
3. **src/ folders** — pick which subdirectories to create (comma-separated numbers):
   ```
   Choose src/ subdirectories to create:
     1) components   5) services   9)  lib
     2) hooks        6) store     10) constants
     3) utils        7) pages     11) context
     4) types        8) layouts   12) assets
   Enter choices [1-12] comma-separated (default: 1,2,3,4,5,6,7,8):
   ```
   > Feature-based structure uses a fixed nested layout and skips this prompt.
4. **Optional packages** — Axios, Zustand, React Hook Form, TanStack Query (each Y/n)

### Axios api.ts

When Axios is selected, `src/services/api.ts` is generated with a ready-to-use configured instance:

```ts
import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? 'https://example.com/api',
  headers: { 'Content-Type': 'application/json' },
});
```

## CLI options

```bash
coreplate <project-name> [options]
coreplate .             Scaffold into the current directory
```

| Option | Description |
|---|---|
| `--dir <path>` | Target directory (defaults to `./<project-name>`) |
| `--force` | Allow writing into a non-empty directory |
| `--yes` | Skip prompts and include all optional packages |
| `--no-interactive` | Skip prompts and use passed flags/defaults |
| `--runtime <web\|expo>` | Select runtime |
| `--expo` | Shortcut for `--runtime expo` |
| `--structure <component\|feature\|atomic>` | Select project structure mode |
| `--no-axios` | Exclude Axios |
| `--no-zustand` | Exclude Zustand |
| `--no-react-hook-form` | Exclude React Hook Form |
| `--no-tanstack-query` | Exclude TanStack Query |

## Examples

```bash
# Scaffold into current directory (interactive)
npx coreplate .

# Default non-interactive: web + component-based + all packages
coreplate my-web-app --no-interactive

# Expo + atomic structure
coreplate my-mobile-app --runtime expo --structure atomic --no-interactive

# Feature-based web app without Zustand
coreplate my-feature-app --structure feature --no-zustand --no-interactive

# Force scaffold into existing directory
coreplate . --force
```

## Development

```bash
npm install
npm run build
```

After building, test locally:

```bash
node dist/cli.js demo-app
node dist/cli.js .
```
