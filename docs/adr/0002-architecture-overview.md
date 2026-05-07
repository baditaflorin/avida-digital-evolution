# 0002 - Architecture Overview and Module Boundaries

## Status

Accepted

## Context

The project combines a WASM evolution core, browser rendering, local logging, and narration. The codebase needs firm boundaries so the static app stays maintainable.

## Decision

Use feature folders under `src/features/`: `simulation`, `visualization`, `logging`, and `narration`. The C++ core lives in `wasm/` and compiles to `public/wasm/avida_core.wasm`. Browser orchestration lives in `src/app.ts`.

## Consequences

Each browser concern can be tested independently. The WASM ABI is treated as a stable internal contract.

## Alternatives Considered

A monolithic frontend file was rejected because worker, renderer, logging, and narration state would become tightly coupled.
