# 0010 - GitHub Pages Publishing Strategy

## Status

Accepted

## Context

The live site is a first-class deliverable and must work from day one.

## Decision

Publish GitHub Pages from the `main` branch `/docs` directory at `https://baditaflorin.github.io/avida-digital-evolution/`. Vite builds directly into `docs/` with `base` set to `/avida-digital-evolution/`. The build keeps documentation files under `docs/adr/` and emits `404.html` for SPA fallback.

## Consequences

The built frontend is committed for Pages to serve. `docs/` is intentionally not gitignored even though it contains generated assets. Cache busting is handled by hashed Vite assets.

## Alternatives Considered

A `gh-pages` branch was rejected to keep the repository simpler and visible from `main`. Publishing from repository root was rejected because source files would mix with deployed assets.
