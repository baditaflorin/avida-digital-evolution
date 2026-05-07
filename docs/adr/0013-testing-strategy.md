# 0013 - Testing Strategy

## Status

Accepted

## Context

The project needs confidence without GitHub Actions.

## Decision

Use Vitest for TypeScript logic, compile the C++ core during `make build`, and use Playwright smoke/e2e tests against the static `docs/` build. `make test`, `make build`, `make smoke`, and `make lint` are the local contract.

## Consequences

Checks remain fast enough for local hooks and avoid remote CI.

## Alternatives Considered

GitHub Actions was rejected by project constraint.
