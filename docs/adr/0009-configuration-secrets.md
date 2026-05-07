# 0009 - Configuration and Secrets Management

## Status

Accepted

## Context

Mode A must not ship or require secrets.

## Decision

Use Vite build-time public constants only. Commit `.env.example` with placeholders and keep `.env*` ignored except the example. Run gitleaks through local hooks.

## Consequences

The frontend never receives API keys or private credentials. All external links are public URLs.

## Alternatives Considered

Encrypted frontend secrets were rejected because obfuscated client secrets are still public.
