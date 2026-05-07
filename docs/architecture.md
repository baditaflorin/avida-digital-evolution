# Architecture

## Context

```mermaid
flowchart TB
  Visitor["Visitor in a modern browser"] --> Site["Avida Digital Evolution on GitHub Pages"]
  Site --> Repo["Public repository: https://github.com/baditaflorin/avida-digital-evolution"]
  Site --> Support["PayPal support link: https://www.paypal.com/paypalme/florinbadita"]
```

## Containers

```mermaid
flowchart LR
  subgraph Pages["GitHub Pages boundary"]
    Static["docs/ static assets"]
    App["Vite TypeScript app"]
    SW["Service worker"]
  end

  subgraph Browser["Browser runtime"]
    Worker["Simulation worker"]
    Wasm["avida_core.wasm"]
    Renderer["Three.js scene"]
    WebGPU["WebGPU adapter probe"]
    DuckDB["DuckDB-WASM"]
    Narrator["Local narrator"]
    Storage["localStorage and browser cache"]
  end

  Static --> App
  App --> Worker
  Worker --> Wasm
  App --> Renderer
  Renderer --> WebGPU
  App --> DuckDB
  App --> Narrator
  App --> Storage
  SW --> Static
```

## Module Boundaries

- `wasm/avida_core.cpp` owns deterministic organism replication, mutation, competition, events, and aggregate stats.
- `src/features/simulation/` owns the worker ABI and typed snapshots.
- `src/features/visualization/` owns Three.js rendering and WebGPU capability detection.
- `src/features/logging/` owns DuckDB-WASM initialization and `evolution_log_v1`.
- `src/features/narration/` owns local narration from live stats.
- `src/services/` owns build metadata, public GitHub commit lookup, and service worker registration.

## Pages Boundary

There is no runtime backend. GitHub Pages serves `/docs`, and every interactive feature runs in the browser. External network calls are limited to public GitHub commit metadata and user-clicked outbound links.
