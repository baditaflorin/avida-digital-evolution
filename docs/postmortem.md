# Postmortem

## What Was Built

Avida Digital Evolution v0.1.0 is a Mode A GitHub Pages app at:

https://baditaflorin.github.io/avida-digital-evolution/

It includes a compact C++ Avida-style evolution core compiled to WASM, a Comlink worker boundary, Three.js visualization with WebGPU probing and fallback, DuckDB-WASM local logging, a local narration engine, PWA basics, local hooks, ADRs, documentation, and Playwright smoke coverage.

## Was Mode A Correct?

Yes. The project stayed fully static. Simulation, visualization, logs, narration, version display, and commit display all work without a runtime backend. Mode B was not needed because v1 data is generated live. Mode C was not needed because there are no secrets, auth, writes, or shared state.

## What Worked

- GitHub Pages from `main` `/docs` worked as the deployment surface.
- The local LLVM toolchain produced a small standalone WASM core from C++.
- Lazy chunks kept the initial app JavaScript around 33 KB gzipped, even with large DuckDB and Three.js assets available later.
- Local hooks caught build/test/smoke issues before push.

## What Did Not Work

- Embedding the current git hash into tracked build metadata made every build dirty. The fix was to keep committed build metadata stable and fetch the latest public `main` commit from GitHub at runtime.
- DuckDB-WASM was initially loaded too early and blocked the first interaction. It now warms in the background after the world is usable.

## What Surprised Us

DuckDB-WASM is very capable but large. It belongs behind a lazy boundary for this app. GitHub Pages deployment was fast once configured, but CDN cache state briefly served the previous metadata while Pages was still building.

## Tech Debt Accepted

- The evolution core is Avida-inspired, not full upstream Avida parity.
- The narrator is a tiny local behavior narrator, not a bundled general-purpose LLM.
- WebGPU is probed and attempted through Three.js WebGPU, with WebGL fallback for broad browser support.

## Next 3 Improvements

1. Add a WebLLM adapter that users can explicitly enable when their browser/GPU can support it.
2. Add export/import for DuckDB evolution logs so users can keep and share runs.
3. Expand the C++ instruction ecology toward more historically faithful Avida tasks.

## Time Spent vs Estimate

Estimated v1 bootstrap: 2-3 hours for a functional static prototype. Actual elapsed implementation time was about 2 hours, including repo creation, Pages setup, WASM compilation, UI, local checks, smoke tests, and live verification.
