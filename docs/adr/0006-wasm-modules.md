# 0006 - WASM Modules

## Status

Accepted

## Context

The simulation needs deterministic, fast mutation and replication logic that can be isolated from UI rendering.

## Decision

Compile a small Avida-inspired C++ core to `avida_core.wasm` with LLVM targeting `wasm32`. DuckDB-WASM is lazy-loaded for analytics. The C++ WASM module exports reset, step, cell pointer, stats pointer, and event pointer functions.

## Consequences

The browser app gets a real compiled simulation boundary without requiring a server. The v1 core is intentionally much smaller than upstream Avida and documents full upstream parity as a non-goal.

## Alternatives Considered

Implementing the core in TypeScript was rejected because the project goal explicitly calls for a compiled artificial-life core.
