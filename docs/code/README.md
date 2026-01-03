**algokit-subscriber-ts-reference**

***

# algokit-subscriber-ts-reference

This repository is a minimal TypeScript library that delegates CI/CD orchestration to the shared workflows in `algokit-shared-config`. Only the project-specific contract lives here (name, tokens, and versioning rules); the release and documentation logic is centralized in the shared config.

## What lives here
- Basic library source in `src/index.ts` and TypeScript build config in `tsconfig.json`.
- Tooling configs used by the shared workflows:
  - `typedoc.json` for docs generation (consumed by the shared publish step).
  - `.releaserc` for semantic-release with the expected plugins.
- GitHub Actions callers in `.github/workflows` that pass inputs and secrets to the shared workflows.

## How it talks to the shared config
- `on-main-merge.yml` generates a job-scoped bot token and calls `algorandfoundation/algokit-shared-config/.github/workflows/on-merge-main.yml@ci/release-workflow` with `node-version` and `publish-docs` inputs. Secrets `BOT_TOKEN` (generated from the app credentials) and `NPM_TOKEN` are forwarded so the shared workflow can publish artifacts and docs.
- `pull-request.yml` runs lint, tests, and doc generation locally on every PR to match the expectations of the shared pipeline.

## Local scripts
Use `npm run build`, `npm test`, `npm run lint`, and `npm run docs:generate`. The shared workflows rely on these entrypoints to build, test, and generate docs during CI.
