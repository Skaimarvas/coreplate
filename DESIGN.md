# DESIGN

## Objective

Provide a lightweight, publishable npm module that scaffolds a practical React application baseline.

## Design choices

- Runtime has no external dependencies to keep the CLI minimal and fast.
- TypeScript + NodeNext build keeps package modern while supporting Node 18+.
- Templates are code-generated strings for easy versioning and updates.
- Output includes onboarding docs and AI-assistant guidance files by default.

## Generation flow

1. Parse CLI arguments.
2. Validate project name and output target.
3. Ensure target directory policy (`--force` or empty folder).
4. Materialize all template files.
5. Print next steps.

## Future extension points

- Add framework variants (Next.js, Remix, backend API skeletons).
- Add template customization prompts.
- Add test setup (Vitest + Testing Library) as an optional flag.
