# Contributing

Thanks for helping improve Avida Digital Evolution.

## Local Setup

1. Install Node.js 22 or newer.
2. Run `npm install`.
3. Run `make install-hooks`.
4. Run `make dev`.

## Commit Style

Use Conventional Commits, such as `feat: add simulation panel` or `fix: repair WASM loading`.

## Checks

Before pushing, run:

```sh
make lint
make test
make build
make smoke
```
