# 0017 - Dependency Policy

## Status

Accepted

## Context

The stack should use battle-tested libraries and keep the initial payload lean.

## Decision

Use production dependencies for clear roles: Three.js for rendering, DuckDB-WASM for local analytics, Comlink for worker RPC, Zod for runtime validation, and Tailwind CSS for styling. Heavy dependencies are lazy-loaded behind user action.

## Consequences

The app remains maintainable and avoids custom renderers or ad hoc data engines.

## Alternatives Considered

Hand-rolled visualization, analytics, and worker protocols were rejected because mature libraries exist.
