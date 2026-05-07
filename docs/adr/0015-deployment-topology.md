# 0015 - Deployment Topology

## Status

Accepted

## Context

ADR 0001 selects Mode A.

## Decision

Deploy only GitHub Pages from `main` `/docs`. There is no backend server, Docker Compose topology, nginx, metrics endpoint, or runtime database.

## Consequences

Operations are limited to rebuilding the static app and pushing the Pages directory.

## Alternatives Considered

Docker backend deployment was rejected because no runtime backend is required.
