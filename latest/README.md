**algokit-subscriber-ts-reference**

***

# algokit-subscriber-ts-reference

This repository is a minimal TypeScript library whose CI/CD, docs, and release flows are delegated to the reusable workflows in `p2arthur/algokit-shared-config-forked`. Only the project-specific contract (package name, versioning rules, and tokens) lives here; the heavy lifting is centralized in the shared config so every repo stays consistent.

## What lives here
- Basic library source in `src/index.ts` plus TypeScript build config in `tsconfig.json`.
- Tooling configs consumed by the shared workflows:
  - `typedoc.json` for docs generation.
  - `.releaserc` for semantic-release with the expected plugins.
- GitHub Actions callers in `.github/workflows` that forward inputs and secrets to the shared workflows.

## How CI/CD is wired
- `.github/workflows/on-merge-main.yml` calls `p2arthur/algokit-shared-config-forked/.github/workflows/on-merge-main.yml@main` with `project_type: typescript`. It forwards `BOT_ID`, `BOT_SK`, `NPM_TOKEN`, and `GH_TOKEN` so the shared pipeline can run TypeScript CI, build artifacts, and execute semantic-release.
- `.github/workflows/on-merge-release.yml` triggers branch sync/publish via `.../on-merge-release.yml@main`, using `BOT_ID` and `BOT_SK` to fast-forward or merge `release` and `main` after promotion.
- `.github/workflows/pull-request.yml` reuses `.../on-pull-request.yml@ref/consistency-ref-implementation` to run the lightweight Node CI that aligns with the shared expectations.

## Shared workflow quick facts
- `on-merge-main.yml` in the shared repo routes to language-specific CI (TypeScript or Python) and then runs the `release-package` composite action for semantic-release. `NPM_TOKEN` is only needed for npm install/publish paths.
- `on-merge-release.yml` in the shared repo generates an installation token from the GitHub App to synchronize `release` and `main`.
- Supporting reusable pieces include `ci-typescript.yml` (lint/typecheck/test/build + docs), `node-build-zip.yml` (build + artifact upload with optional env substitution), and `build-and-publish-docs.yml` (generate and publish docs to Pages). Use `project_type: typescript` when invoking docs or release actions from TypeScript projects.

## Required secrets
- `BOT_ID` / `BOT_SK`: GitHub App credentials used to mint the bot token for releases and branch sync.
- `GH_TOKEN`: Repo-scoped token used for checkouts/builds that need package access.
- `NPM_TOKEN`: Required for npm installs/publishing in the TypeScript flows.

## Local scripts
Use `npm run build`, `npm test`, `npm run lint`, and `npm run docs:generate`. The shared workflows call these entrypoints during CI to keep local and remote behavior aligned.
