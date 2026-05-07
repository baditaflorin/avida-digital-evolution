# 0018 - Local Narrator

## Status

Accepted

## Context

The project concept calls for a local narrator explaining emergent behavior without a server or secrets. Shipping a large browser LLM model would add major payload and GPU requirements.

## Decision

Use a tiny local narration engine in v1. It consumes live WASM stats, compares recent windows, and emits grounded alien-biology explanations. The interface is isolated so a future WebLLM or user-supplied local model adapter can replace it without touching the simulation core.

## Consequences

The narrator works offline and quickly on GitHub Pages, but it is not a full general-purpose LLM in v1.

## Alternatives Considered

Cloud LLM APIs were rejected because they require secrets. Bundling a multi-hundred-megabyte browser model was rejected for v1 payload and reliability reasons.
