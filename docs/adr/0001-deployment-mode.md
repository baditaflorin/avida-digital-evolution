# 0001 - Deployment Mode

## Status

Accepted

## Context

Avida Digital Evolution should be playable in a browser tab. The v1 scope needs local simulation, visualization, local analytics, and narration, but does not require auth, server-side writes, secrets, or cross-device sync.

## Decision

Use Mode A: Pure GitHub Pages. The app is a static frontend served from `main` branch `/docs`, with simulation compiled to WASM, runtime state kept in browser memory and IndexedDB/OPFS-compatible storage, and optional browser-local model behavior for narration.

## Consequences

The public surface is static and cheap to host. All expensive work runs on the user's device. Browser support differences must be handled with progressive enhancement for WebGPU, DuckDB-WASM, and Web Workers.

## Alternatives Considered

Mode B was unnecessary because v1 does not need pre-generated datasets. Mode C was rejected because no runtime API, secret, auth flow, or shared mutable server state is required.
