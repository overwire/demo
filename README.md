# Overwire demo workspace

A workspace of fictional repositories that exercises [Overwire](https://overwire.io) end-to-end. Every supported workflow feature has a runnable example somewhere in here: reusable workflows, matrices, services containers, environments, rulesets, PR scenarios, workflow chains, and more.

Two organizations: `acme-corp` (hello-app, pipeline-app, enterprise-actions) and `wire-corp` (compliance-app). Org-level rulesets cascade from `.overwire/orgs/` onto each repo.

## Getting started

```sh
git clone https://github.com/overwire/demo.git
```

Open the cloned `demo` directory in the Overwire desktop app, or drive everything from the CLI: [CLI-TEST-COMMANDS.md](./CLI-TEST-COMMANDS.md) walks through commands for all four repos in a recommended order.

New to Overwire? Start with the [documentation](https://docs.overwire.io), then come back here. The [demo workspace guide](https://docs.overwire.io/getting-started/demo/) covers what to try first.

## What's inside

```
demo/
├── .overwire/
│   ├── instances.yml                    # 4 workspace peers
│   └── orgs/
│       ├── acme-corp/rulesets.json      # org rule: require PR reviews on main
│       └── wire-corp/rulesets.json      # org rules: signed commits + linear history
│
├── enterprise-actions/                  # shared reusable workflows + actions
│   ├── .github/
│   │   ├── workflows/
│   │   │   ├── build-nodejs-npm.yml             # checkout → setup-node → install/lint/build/test
│   │   │   ├── codeql-scan.yml                  # codeql-action init + analyze (mocked)
│   │   │   ├── dependency-scan.yml              # npm audit with continue-on-error
│   │   │   ├── generate-sbom.yml                # sbom-action + mock artifact from a fixture SBOM
│   │   │   ├── attest-build-provenance.yml      # download-artifact + attest (mocked)
│   │   │   ├── lint-check.yml                   # lint with continue-on-error + outcome output
│   │   │   ├── deploy-preview.yml               # deploy with environment/version/dry-run inputs
│   │   │   ├── multi-shell-check.yml            # bash, python, node {0}, pwsh shell types
│   │   │   ├── quality-report.yml               # workflow commands: group, warning, error, mask
│   │   │   └── build-and-attest.yml             # cache + artifact round-trip + OIDC token
│   │   └── actions/
│   │       ├── setup-project/action.yml         # composite: setup-node → cache → npm ci
│   │       └── db-migrate/action.yml            # Docker action with Dockerfile + entrypoint
│   └── .overwire/
│       ├── settings.yml
│       ├── modes/                               # per-workflow mode defaults
│       └── mocks/                               # contracts for third-party scanners
│
├── hello-app/                           # simple "first five minutes" demo
│   ├── src/                                     # greeter library + node:test
│   ├── scripts/                                 # lint + build
│   ├── .github/workflows/
│   │   ├── ci.yml                               # push → reusable build + report job
│   │   └── env-and-expressions.yml              # GITHUB_ENV, GITHUB_PATH, expression builtins
│   └── .overwire/                               # minimal config
│
├── pipeline-app/                        # complex CI/CD showcase
│   ├── src/ + lib/                              # config + utils modules
│   ├── scripts/                                 # lint + build
│   ├── .github/workflows/
│   │   ├── ci.yml                               # push/PR → lint, build, matrix test, summary
│   │   ├── deploy.yml                           # dispatch/workflow_run → gate, deploy, notify
│   │   ├── compat.yml                           # matrix exclude, max-parallel, cache
│   │   ├── dynamic-matrix.yml                   # fromJSON() dynamic matrix
│   │   ├── integration-test.yml                 # job container + services (postgres, redis)
│   │   ├── release-publish.yml                  # release → validate, build, sbom, publish
│   │   ├── repository-dispatch.yml              # dispatch types: deploy-request, rollback
│   │   └── branch-lifecycle.yml                 # create/delete event handling
│   └── .overwire/
│       ├── modes/, payloads/, dispatch/
│       ├── environments/{staging,production}/
│       ├── api-mocks.yml                        # commit status + issue comment POSTs
│       └── chains/
│           ├── ci-deploy.yml                    # CI → Deploy chain
│           └── release-lifecycle.yml            # release-publish chain
│
└── compliance-app/                      # governance showcase
    ├── src/core/ + src/api/                     # cache + handler + auth (ownership boundaries)
    ├── docs/                                    # docs owned by @acme-corp/docs
    ├── scripts/                                 # lint + build
    ├── .github/
    │   ├── CODEOWNERS                           # multi-team ownership
    │   └── workflows/
    │       ├── ci.yml                           # PR → build, security, audit, post check runs
    │       ├── compliance-gate.yml              # workflow_run → evaluate checks + CODEOWNERS
    │       ├── pr-auto-label.yml                # PR → title-based labeling
    │       ├── bad-practices.yml                # intentionally broken (lint demo target)
    │       ├── fork-safe-pr.yml                 # pull_request_target double-checkout pattern
    │       ├── issue-ops.yml                    # slash commands + auto-triage
    │       ├── scheduled-audit.yml              # cron schedule + python shell
    │       └── merge-queue-checks.yml           # merge_group trigger
    └── .overwire/
        ├── rulesets.json                        # "Protect main" + "Release branches"
        ├── custom-properties.yml                # repo metadata (team, compliance tier)
        ├── pull-requests.yml                    # 3 PRs: pass, missing review, failed check
        ├── statuses.yml                         # pre-staged check conclusions per PR
        ├── api-mocks.yml                        # check-runs POST + GET, labels, comments
        └── chains/
            ├── pr-lifecycle.yml                 # CI → Compliance Gate chain
            └── scheduled-compliance.yml         # scheduled-audit chain
```

## Demo flows

### hello-app — First five minutes

**CI workflow.** Trigger `push` on `ci.yml`. The build job calls the reusable `build-nodejs-npm.yml` from `enterprise-actions`; the report job consumes `needs.build.outputs.*` and writes a Markdown summary to `GITHUB_STEP_SUMMARY`.

**Env and expressions.** Trigger `workflow_dispatch` on `env-and-expressions.yml`. Demonstrates `GITHUB_ENV` propagation across steps, `GITHUB_PATH` for custom tools, and expression builtins: `format()`, `hashFiles()`, `startsWith()`, `contains()`, `endsWith()`, `join()`, `fromJSON()`, `toJSON()`.

### pipeline-app — CI/CD pipeline

**CI workflow.** Trigger `push` or `pull_request`. The lint job uses a cross-repo composite action (`setup-project`), build calls a reusable workflow with `secrets: inherit`, test runs a 3-version matrix with conditional coverage, and the summary job aggregates all results using `if: always()` + `needs.*.result` + `vars.*`.

**Deploy workflow.** Trigger via `workflow_dispatch` (typed inputs: version, environment choice, dry-run boolean) or automatically via `workflow_run` after CI completes. The gate job branches on trigger type, deploy runs in a protected environment, and notify POSTs commit status + issue comment to the mock API.

**Compat workflow.** Tests `matrix.exclude`, `strategy.max-parallel`, and `hashFiles()` cache keys.

**Dynamic matrix.** Trigger `workflow_dispatch`. The discover job emits a JSON array via `GITHUB_OUTPUT`; the test job uses `fromJSON(needs.discover.outputs.packages)` as the matrix value.

**Integration test.** Trigger `pull_request` with paths filter. Runs inside a `node:20-bookworm` container with PostgreSQL and Redis services. Demonstrates `services:` with env/ports/health-checks, `GITHUB_ENV`/`GITHUB_PATH` propagation, and `secrets.*` in service configuration.

**Release publish.** Trigger on `release` published. Four-job graph: validate → build → sbom → publish with cross-repo reusable workflows and environment protection.

**Repository dispatch.** Trigger `repository_dispatch` with conditional jobs based on `github.event.action` (`deploy-request` vs `rollback-request`) and `client_payload.*` access.

**Branch lifecycle.** Trigger `create`/`delete`. Demonstrates event-type branching and `github.event.ref_type` context.

**Chains.** `ci-deploy.yml` runs CI then Deploy. `release-lifecycle.yml` runs the release-publish workflow.

### compliance-app — Governance

**CI workflow.** Trigger `pull_request` (types + paths filter). Build → Security → Audit fan out through reusable workflows. `post-checks` POSTs check run conclusions to the mock API using `github.event.pull_request.head.sha`.

**Compliance Gate.** Fires on `workflow_run` after CI. Fetches check runs from the stateful API mock, evaluates required checks against rulesets (repo + org-level), verifies CODEOWNERS, and writes a `GITHUB_STEP_SUMMARY` with `::group::`/`::error::` workflow commands.

**PR scenarios.** Three pre-staged PRs in `pull-requests.yml`:

| PR | Title | Expected outcome |
|----|-------|------------------|
| #10 | feat: add caching layer | PASS — all checks green + code owner approved |
| #11 | docs: update API guide | FAIL — missing required review |
| #12 | fix: auth bypass | FAIL — Security check failed |

**Fork-safe PR.** Trigger `pull_request_target`. Demonstrates the double-checkout pattern (base repo + PR head) with fork detection via `github.event.pull_request.head.repo.full_name`.

**Issue ops.** Trigger `issue_comment` (slash commands like `/approve-exception`) and `issues` (auto-triage on open). Demonstrates conditional jobs with `startsWith()` and API calls for labels and comments.

**Scheduled audit.** Trigger `schedule` (cron) or `workflow_dispatch`. Uses `python` shell for report generation, `toJSON()`/`join()`/`fromJSON()` expressions, and `continue-on-error` for resilient auditing.

**Merge queue checks.** Trigger `merge_group`. Cross-repo reusable workflows with `secrets: inherit`, `github.event.merge_group.head_sha` context, and check-gate aggregation.

**Bad practices.** Intentionally broken workflow: deprecated commands (`::set-output::`, `::set-env::`), duplicate step IDs, unpinned action ref. Exists solely as a target for `overwire lint`.

**Chains.** `pr-lifecycle.yml` runs CI then Compliance Gate. `scheduled-compliance.yml` runs the audit workflow.

### Organization governance

Org-level rulesets in `.overwire/orgs/` cascade onto repos, matching GitHub's behavior where org admins enforce rules that repo admins cannot override.

- **wire-corp:** Requires signed commits on main and release branches for compliance-app. Evaluates linear history on main for all wire-corp repos.
- **acme-corp:** Requires PR reviews on main for all repos except enterprise-actions (which is the shared action library).

The compliance-app also has `custom-properties.yml` with repository metadata (team, compliance tier, data classification) that surfaces in event payloads.

## Capability matrix

| Feature | hello-app | pipeline-app | compliance-app |
|---------|:---------:|:------------:|:--------------:|
| Reusable workflows (cross-repo) | ci | ci, release | ci, merge-queue |
| Composite action (cross-repo) | — | ci lint | — |
| Docker action | — | — (enterprise-actions) | — |
| Job output chaining (`needs.*.outputs`) | ci report | ci summary, deploy | ci post-checks |
| Matrix (cartesian) | — | ci test | — |
| Matrix `include` | — | ci test (coverage) | — |
| Matrix `exclude` | — | compat | — |
| Dynamic matrix (`fromJSON`) | — | dynamic-matrix | — |
| `strategy.max-parallel` | — | compat | — |
| `fail-fast: false` | — | ci test, compat | — |
| `concurrency` (cancel-in-progress) | — | ci | — |
| `defaults.run` | — | ci | scheduled-audit |
| `continue-on-error` (step) | — | ci lint | scheduled-audit |
| `secrets: inherit` | — | ci build | merge-queue |
| `vars.*` context | — | ci summary | — |
| `GITHUB_STEP_SUMMARY` | ci report | ci summary, release | compliance-gate |
| `GITHUB_OUTPUT` | (via reusable) | ci, deploy, dynamic | ci, compliance-gate |
| `GITHUB_ENV` propagation | env-and-expr | integration-test | — |
| `GITHUB_PATH` propagation | env-and-expr | integration-test | — |
| Expression builtins | env-and-expr | ci, compat, release | scheduled-audit |
| `workflow_dispatch` (typed inputs) | env-and-expr | deploy | — |
| `workflow_run` trigger | — | deploy | compliance-gate |
| `repository_dispatch` | — | repository-dispatch | — |
| `release` trigger | — | release-publish | — |
| `create`/`delete` triggers | — | branch-lifecycle | — |
| `schedule` trigger | — | — | scheduled-audit |
| `issues`/`issue_comment` triggers | — | — | issue-ops |
| `pull_request_target` trigger | — | — | fork-safe-pr |
| `merge_group` trigger | — | — | merge-queue-checks |
| Environment protection | — | deploy | — |
| Org-level rulesets | — | (acme-corp) | (wire-corp) |
| Repo rulesets / required checks | — | — | rulesets.json |
| Custom properties | — | — | custom-properties.yml |
| Pull request scenarios | — | — | pull-requests.yml |
| Status contexts (pre-staged) | — | — | statuses.yml |
| CODEOWNERS | — | — | .github/CODEOWNERS |
| Permissions enforcement | — | — | ci, compliance-gate |
| API mock: commit status POST | — | deploy notify | — |
| API mock: issue comment POST | — | deploy notify | issue-ops |
| API mock: check-runs CRUD | — | — | ci + compliance-gate |
| API mock: issue labels POST | — | — | pr-auto-label |
| Workflow chains | — | ci-deploy, release | pr-lifecycle, audit |
| `push` + branches filter | ci | ci | — |
| `pull_request` + types/paths filter | — | ci | ci, pr-auto-label |
| `hashFiles()` | — | compat, build-and-attest | — |
| `format()` | — | composite action | — |
| `::group::`/`::endgroup::` | — | — | compliance-gate |
| `::error::`/`::warning::`/`::notice::` | — | — | compliance-gate, auto-label |
| `::add-mask::` | — | — | quality-report |
| Multiple shell types (bash/python/pwsh) | — | — (enterprise-actions) | scheduled-audit |
| `container:` + `services:` | — | integration-test | — |
| `if: always()` + `needs.*.result` | — | ci summary, deploy | ci post-checks |
| Chain auto-discovery | — | ci-deploy | pr-lifecycle |

## Known caveats

- **Default mode is mock** for most workflows so the demo runs without Docker or network. Flip individual steps to `live` from the editor mode chip for real execution.
- **Live mode needs Docker + network.** `npm ci` needs the npm registry the first time, and the runner image needs Node. Keep jobs in mock if neither is available.

## Tweaking the demo

| To change... | Edit... |
|---|---|
| Org-level rulesets | `.overwire/orgs/{acme-corp,wire-corp}/rulesets.json` |
| Repo-level rulesets | `compliance-app/.overwire/rulesets.json` |
| Custom properties | `compliance-app/.overwire/custom-properties.yml` |
| Default mode for any workflow | `.overwire/modes/<workflow>.yml` in the relevant repo |
| Mock outputs for a third-party action | `enterprise-actions/.overwire/mocks/<action>.yml` |
| Deploy dispatch defaults | `pipeline-app/.overwire/dispatch/deploy.yml` |
| PR scenarios | `compliance-app/.overwire/pull-requests.yml` |
| Pre-staged check conclusions | `compliance-app/.overwire/statuses.yml` |
| Environment protection rules | `pipeline-app/.overwire/environments/{staging,production}/config.yml` |
| API mock routes | `{pipeline,compliance}-app/.overwire/api-mocks.yml` |
| Owner identity | `settings.yml` files + `.overwire/instances.yml` + `uses:` refs in workflows |

## License

[MIT](./LICENSE). Copy anything in this workspace into your own workflows and config.

The organizations, repositories, applications, and people in this workspace are fictional and exist solely to demonstrate Overwire.

Overwire is compatible with GitHub Actions workflow files. Overwire is not affiliated with, endorsed by, or sponsored by GitHub, Inc., Microsoft Corporation, or Docker, Inc. GitHub and GitHub Actions are trademarks of GitHub, Inc.
