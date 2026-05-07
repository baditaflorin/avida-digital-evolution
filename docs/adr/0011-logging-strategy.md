# 0011 - Logging Strategy

## Status

Accepted

## Context

There is no server log stream in Mode A.

## Decision

Use minimal browser console output in development. Production UI errors are shown through the app status panel and toast region. Evolution events are stored as structured rows in DuckDB-WASM, not as console logs.

## Consequences

Users get actionable errors without noisy production consoles.

## Alternatives Considered

Remote logging was rejected because it would add tracking and a server dependency.
