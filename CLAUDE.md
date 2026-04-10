# CLAUDE

## Intent

Assistant guidance for maintaining this package.

## Maintenance rules

- Keep generated templates straightforward and production-usable.
- Avoid hidden magic in the CLI; prioritize explicit, discoverable behavior.
- Prefer semver-safe dependency bumps in generated templates.
- Preserve backward compatibility for CLI flags where possible.

## Review checklist

- `npm run build` succeeds.
- Generated app runs with `npm install && npm run dev`.
- Docs (`README.md`, `DESIGN.md`) match implementation.
