# 0014 - Error Handling Conventions

## Status

Accepted

## Context

Browser feature availability varies, especially for WebGPU, workers, and WASM.

## Decision

Use typed `Result`-style returns in feature services where recovery is expected, throw only for unrecoverable initialization failures, and render clear UI fallbacks. Global errors go to an accessible toast region.

## Consequences

The app can degrade from WebGPU to WebGL rendering and from DuckDB to session-only logs while keeping the simulation playable.

## Alternatives Considered

Failing hard on optional capabilities was rejected because it would exclude many browsers.
