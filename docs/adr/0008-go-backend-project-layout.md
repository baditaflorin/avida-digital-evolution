# 0008 - Go Backend Project Layout

## Status

Accepted

## Context

The bootstrap requirements define Go layout for Modes B and C.

## Decision

Skip Go backend layout in v1 because ADR 0001 chooses Mode A. No `cmd/`, `internal/`, `pkg/`, runtime API, Docker backend, or data-generation service is needed.

## Consequences

The repository stays focused on the static browser app. A future Mode B or C migration must add a new ADR before adding Go services.

## Alternatives Considered

Adding empty Go folders was rejected because unused scaffolding makes the project less honest.
