# 0005 - Client-Side Storage Strategy

## Status

Accepted

## Context

The app needs local session settings and generated evolution logs. Cross-device sync is not in scope.

## Decision

Use `localStorage` for small user settings and DuckDB-WASM for local analytic logs. Prefer OPFS-capable DuckDB paths when supported, with an in-memory fallback.

## Consequences

The app remains offline-friendly and static. Users can reset local state without any server cleanup.

## Alternatives Considered

A hosted database was rejected because it would force Mode C without adding v1 value.
