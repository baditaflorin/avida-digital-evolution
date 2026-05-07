# Deploy Guide

Live URL:

https://baditaflorin.github.io/avida-digital-evolution/

Repository:

https://github.com/baditaflorin/avida-digital-evolution

## Publish

GitHub Pages is configured to serve `main` branch `/docs`.

```sh
npm install
make test
make lint
make build
make smoke
git add docs public src wasm scripts package.json package-lock.json
git commit -m "feat: update pages app"
git push
```

## Preview

```sh
make pages-preview
```

For exact project-path preview, `make smoke` builds, serves `docs/` under `/avida-digital-evolution/`, and runs Playwright.

## Rollback

Revert the publishing commit and push:

```sh
git revert <commit>
git push
```

GitHub Pages will republish from `/docs` on `main`.

## Custom Domain

No custom domain is configured in v1. If a domain is added later, add `docs/CNAME`, configure DNS to GitHub Pages, and keep the service worker scope aligned with the final path.
