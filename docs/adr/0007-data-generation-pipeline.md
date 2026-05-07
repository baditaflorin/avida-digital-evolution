# 0007 - Data Generation Pipeline

## Status

Accepted

## Context

The bootstrap requirements define a static data pipeline for Mode B projects.

## Decision

Skip a data-generation pipeline in v1 because ADR 0001 selects Mode A. Evolution data is generated live in the browser and logged locally through DuckDB-WASM.

## Consequences

There is no `make data` artifact contract beyond a no-op target that documents Mode A behavior.

## Alternatives Considered

Precomputing seed worlds was rejected because it would make the simulation less live and does not solve a v1 need.
