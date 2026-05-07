# 0003 - Frontend Framework and Build Tooling

## Status

Accepted

## Context

The UI is highly interactive but does not require server-rendered pages or complex routing.

## Decision

Use Vite, strict TypeScript, Tailwind CSS, and small feature modules without a component framework. Use Three.js for rendering, DuckDB-WASM for local analytics, Comlink for the simulation worker, Zod for runtime validation, Vitest for unit tests, and Playwright for smoke/e2e checks.

## Consequences

The initial shell can remain small, and heavy modules are lazy-loaded after the user starts the simulation.

## Alternatives Considered

React was considered but rejected for v1 because the app is a single tool surface and does not need a component tree framework.
