# 0004 - Static Data Contract

## Status

Accepted

## Context

Mode A has no server-side data pipeline. The important data contracts are static build metadata and local browser-generated simulation logs.

## Decision

Ship `build-info.json` in the Pages root with `version`, `commit`, `repository`, `paypalUrl`, and `builtAt`. Runtime logs are stored in DuckDB-WASM using schema version `evolution_log_v1`.

## Consequences

The app can show version and commit without a backend. DuckDB data is local and disposable unless the browser persists it.

## Alternatives Considered

Prebuilt JSON or Parquet artifacts were unnecessary for v1 because the data is generated live.
