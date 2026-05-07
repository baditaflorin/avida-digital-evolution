# 0012 - Metrics and Observability

## Status

Accepted

## Context

Mode A has no server-side metrics. Privacy matters for a toy that runs locally.

## Decision

Do not add analytics in v1. Expose local simulation metrics in the UI only: population, births, deaths, mutations, diversity, merit, and update rate.

## Consequences

There is no usage telemetry or PII collection. Product insight must come from public feedback, issues, and stars.

## Alternatives Considered

Plausible or a beacon endpoint was considered but rejected because v1 does not need usage analytics.
