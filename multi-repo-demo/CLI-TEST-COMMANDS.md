# CLI Test Commands

Comprehensive set of commands to exercise Overwire CLI capabilities against all 4 repos in this workspace. Run from the `multi-repo-demo` directory.

---

## Introspection (no Docker needed)

```sh
# List workflows per repo
overwire list --config-root starter-app/.overwire
overwire list --config-root pipeline-app/.overwire
overwire list --config-root compliance-app/.overwire
overwire list --config-root enterprise-actions/.overwire

# Parse workflows
overwire parse starter-app/.github/workflows/ci.yml
overwire parse pipeline-app/.github/workflows/deploy.yml --json

# Support matrix
overwire explain starter-app/.github/workflows/ci.yml
overwire explain pipeline-app/.github/workflows/integration-test.yml

# Lint
overwire lint starter-app/.github/workflows/ci.yml
overwire lint compliance-app/.github/workflows/bad-practices.yml
overwire lint enterprise-actions/.github/workflows/build-nodejs-npm.yml --json

# Doctor
overwire doctor
overwire doctor capabilities
```

## Event Simulation (no execution)

```sh
overwire simulate push
overwire simulate pull_request
overwire simulate workflow_dispatch --inputs '{"version":"1.0.0"}'
overwire simulate repository_dispatch --event-type deploy-request \
  --client-payload '{"version":"2.0.0","environment":"staging"}'
overwire simulate release --tag-name v1.0.0
overwire simulate create --ref-type branch
overwire simulate delete --ref-type branch
overwire simulate schedule --schedule "0 0 * * 1"
overwire simulate issue_comment --comment-body "/deploy staging"
overwire simulate issues --issue-action opened
overwire simulate pull_request_review --review-state approved
overwire simulate merge_group
```

`pull_request_target`, `workflow_run`, and `workflow_call` are run/trigger events rather than simulate targets — exercise them with `overwire run --event <name>` (see the run sections below).

## Workflow Runs — starter-app

```sh
# push — uses reusable workflow from enterprise-actions
overwire run starter-app/.github/workflows/ci.yml \
  --config-root starter-app/.overwire --event push

# workflow_dispatch — expression evaluation
overwire run starter-app/.github/workflows/env-and-expressions.yml \
  --config-root starter-app/.overwire --event workflow_dispatch
```

## Workflow Runs — pipeline-app

```sh
# push with matrix strategy
overwire run pipeline-app/.github/workflows/ci.yml \
  --config-root pipeline-app/.overwire --event push

# pull_request with path filters
overwire run pipeline-app/.github/workflows/ci.yml \
  --config-root pipeline-app/.overwire --event pull_request \
  --changed-files src/index.ts --changed-files package.json

# workflow_dispatch with inputs + environment protection
overwire run pipeline-app/.github/workflows/deploy.yml \
  --config-root pipeline-app/.overwire --event workflow_dispatch \
  --inputs '{"version":"2.0.0","environment":"staging","dry-run":"true"}'

# dynamic matrix expansion
overwire run pipeline-app/.github/workflows/dynamic-matrix.yml \
  --config-root pipeline-app/.overwire --event workflow_dispatch

# static matrix (multi-version)
overwire run pipeline-app/.github/workflows/compat.yml \
  --config-root pipeline-app/.overwire --event pull_request

# services containers (postgres, redis)
overwire run pipeline-app/.github/workflows/integration-test.yml \
  --config-root pipeline-app/.overwire --event pull_request \
  --changed-files src/db.ts

# release event
overwire run pipeline-app/.github/workflows/release-publish.yml \
  --config-root pipeline-app/.overwire --event release

# repository_dispatch with client_payload
overwire run pipeline-app/.github/workflows/repository-dispatch.yml \
  --config-root pipeline-app/.overwire --event repository_dispatch

# create/delete (branch lifecycle)
overwire run pipeline-app/.github/workflows/branch-lifecycle.yml \
  --config-root pipeline-app/.overwire --event create

overwire run pipeline-app/.github/workflows/branch-lifecycle.yml \
  --config-root pipeline-app/.overwire --event delete
```

## Workflow Runs — compliance-app

```sh
# pull_request with status checks (ci.yml has a paths filter, so pass
# changed files that match it)
overwire run compliance-app/.github/workflows/ci.yml \
  --config-root compliance-app/.overwire --event pull_request \
  --changed-files src/api/handler.js

# pull_request_target
overwire run compliance-app/.github/workflows/fork-safe-pr.yml \
  --config-root compliance-app/.overwire --event pull_request_target

# issue_comment
overwire run compliance-app/.github/workflows/issue-ops.yml \
  --config-root compliance-app/.overwire --event issue_comment

# issues
overwire run compliance-app/.github/workflows/issue-ops.yml \
  --config-root compliance-app/.overwire --event issues

# schedule
overwire run compliance-app/.github/workflows/scheduled-audit.yml \
  --config-root compliance-app/.overwire --event schedule

# merge_group — uses reusable workflow
overwire run compliance-app/.github/workflows/merge-queue-checks.yml \
  --config-root compliance-app/.overwire --event merge_group

# workflow_run
overwire run compliance-app/.github/workflows/compliance-gate.yml \
  --config-root compliance-app/.overwire --event workflow_run

# pull_request with label logic
overwire run compliance-app/.github/workflows/pr-auto-label.yml \
  --config-root compliance-app/.overwire --event pull_request

# bad-practices (linting target)
overwire run compliance-app/.github/workflows/bad-practices.yml \
  --config-root compliance-app/.overwire --event workflow_dispatch
```

## Reusable Workflows — enterprise-actions (workflow_call)

```sh
overwire run enterprise-actions/.github/workflows/build-nodejs-npm.yml \
  --config-root enterprise-actions/.overwire --event workflow_call \
  --inputs '{"node-version":"20"}'

overwire run enterprise-actions/.github/workflows/lint-check.yml \
  --config-root enterprise-actions/.overwire --event workflow_call \
  --inputs '{"node-version":"20"}'

overwire run enterprise-actions/.github/workflows/multi-shell-check.yml \
  --config-root enterprise-actions/.overwire --event workflow_call --inputs '{}'

overwire run enterprise-actions/.github/workflows/codeql-scan.yml \
  --config-root enterprise-actions/.overwire --event workflow_call \
  --inputs '{"language":"javascript"}'

overwire run enterprise-actions/.github/workflows/deploy-preview.yml \
  --config-root enterprise-actions/.overwire --event workflow_call \
  --inputs '{"environment":"staging","version":"1.0.0"}'

overwire run enterprise-actions/.github/workflows/quality-report.yml \
  --config-root enterprise-actions/.overwire --event workflow_call --inputs '{}'

# The mocked upload step materializes a CycloneDX SBOM into the run's
# artifact store (mocks/upload-sbom.yml declares it from a fixture)
overwire run enterprise-actions/.github/workflows/generate-sbom.yml \
  --config-root enterprise-actions/.overwire --event workflow_call --inputs '{}'

overwire run enterprise-actions/.github/workflows/build-and-attest.yml \
  --config-root enterprise-actions/.overwire --event workflow_call \
  --inputs '{"node-version":"20"}'
```

## Workflow Chains

```sh
# Run a chain scenario file
overwire chain pipeline-app/.overwire/chains/ci-deploy.yml \
  --config-root pipeline-app/.overwire
overwire chain pipeline-app/.overwire/chains/release-lifecycle.yml \
  --config-root pipeline-app/.overwire
overwire chain compliance-app/.overwire/chains/pr-lifecycle.yml \
  --config-root compliance-app/.overwire
overwire chain compliance-app/.overwire/chains/scheduled-compliance.yml \
  --config-root compliance-app/.overwire

# Inspect past chain sessions
overwire chain list --config-root pipeline-app/.overwire
overwire chain show <session-id> --config-root pipeline-app/.overwire
```

## Mock Contracts and Resolution

```sh
overwire resolve actions/checkout@v4
overwire resolve actions/setup-node@v4
overwire resolve actions/cache@v4

# Seed into a scratch dir so tour runs leave the repo clean
overwire seed-mocks enterprise-actions/.github/workflows/build-nodejs-npm.yml \
  --config-root enterprise-actions/.overwire --out /tmp/overwire-seeded-mocks --force
```

## History, Status, Cache

```sh
overwire history --config-root starter-app/.overwire
overwire history --config-root pipeline-app/.overwire
overwire status --config-root pipeline-app/.overwire
overwire cache
overwire cache tool-cache
```

## Advanced Flags

```sh
# Force past validation errors — the forced run then fails cleanly (exit 1)
# at event input resolution, since the required dispatch inputs are missing
overwire run pipeline-app/.github/workflows/deploy.yml \
  --config-root pipeline-app/.overwire --event workflow_dispatch \
  --inputs '{}' --force

# Skip action cache
overwire run starter-app/.github/workflows/ci.yml \
  --config-root starter-app/.overwire --event push --no-action-cache

# Debug mode
overwire run starter-app/.github/workflows/env-and-expressions.yml \
  --config-root starter-app/.overwire --event workflow_dispatch --debug
```

---

## Recommended Order

1. **Introspection + simulate** — no Docker needed, validates parsing/config
2. **Mock runs** — workflows with all-mock modes pass without Docker
3. **Live runs** — requires Docker; tests container execution, services, checkout
4. **Chains** — multi-workflow orchestration
5. **History/status** — verify run records persisted after runs complete
