# 0016 - Local Git Hooks

## Status

Accepted

## Context

The project forbids GitHub Actions and requires local checks.

## Decision

Use plain `.githooks/` scripts wired by `make install-hooks`. Pre-commit runs formatting/lint/type checks and gitleaks, commit-msg validates Conventional Commits, and pre-push runs tests, build, and smoke checks.

## Consequences

The setup works without an extra hook manager dependency. Contributors must run `make install-hooks` once per clone.

## Alternatives Considered

Lefthook was considered but rejected because it is not already installed and plain hooks are sufficient.
