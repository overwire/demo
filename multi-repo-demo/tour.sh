#!/usr/bin/env bash
# The "Recommended Order" from CLI-TEST-COMMANDS.md as an executable smoke
# test. Mock-only: needs the overwire CLI and Node, no Docker. Network is
# used only by the resolve section (fetches action.yml from GitHub).
# Every run command asserts outcome=success AND that every step executed in
# mock mode — the regression harness for the "runs without Docker" promise.
# Run from multi-repo-demo/:  ./tour.sh
set -euo pipefail
cd "$(dirname "$0")"

PASS=0
note() { printf '  PASS %s\n' "$1"; PASS=$((PASS + 1)); }

# Assert an `overwire run --json` stream: success outcome, exit 0, all-mock.
run_wf() { # label, then the overwire run args
  local label="$1"; shift
  local out
  out=$( (overwire run "$@" --json 2>/dev/null || true) | tail -1)
  node -e '
    const d = JSON.parse(process.argv[1]);
    if (d.outcome !== "success" || d.exitCode !== 0) {
      console.error("outcome=" + d.outcome + " exitCode=" + d.exitCode);
      process.exit(1);
    }
    const modes = new Set();
    for (const j of Object.values(d.jobs ?? {}))
      for (const s of j.steps ?? []) modes.add(s.mode);
    modes.delete("skip"); // conditional steps may skip; that is fine
    if ([...modes].some((m) => m !== "mock")) {
      console.error("non-mock step modes: " + [...modes].join(","));
      process.exit(1);
    }
  ' "$out" || { echo "  FAIL ${label}"; exit 1; }
  note "$label"
}

run_chain() { # label, chain file, config root
  local label="$1"
  local out
  out=$( (overwire chain "$2" --config-root "$3" --json 2>/dev/null || true) )
  node -e '
    const d = JSON.parse(process.argv[1]);
    if (d.conclusion !== "success") { console.error("conclusion=" + d.conclusion); process.exit(1); }
  ' "$out" || { echo "  FAIL ${label}"; exit 1; }
  note "$label"
}

ok() { # label, then a command expected to exit 0
  local label="$1"; shift
  "$@" >/dev/null 2>&1 || { echo "  FAIL ${label}"; exit 1; }
  note "$label"
}

fails() { # label, then a command expected to exit non-zero
  local label="$1"; shift
  if "$@" >/dev/null 2>&1; then echo "  FAIL ${label} (expected non-zero exit)"; exit 1; fi
  note "$label"
}

echo "== Introspection =="
for app in starter-app pipeline-app compliance-app enterprise-actions; do
  ok "list ${app}" overwire list --config-root "${app}/.overwire"
done
ok "parse starter ci" overwire parse starter-app/.github/workflows/ci.yml
ok "parse deploy --json" overwire parse pipeline-app/.github/workflows/deploy.yml --json
ok "explain starter ci" overwire explain starter-app/.github/workflows/ci.yml
ok "explain integration-test" overwire explain pipeline-app/.github/workflows/integration-test.yml
ok "lint starter ci" overwire lint starter-app/.github/workflows/ci.yml
fails "lint bad-practices (findings expected)" overwire lint compliance-app/.github/workflows/bad-practices.yml
ok "lint build-nodejs-npm --json" overwire lint enterprise-actions/.github/workflows/build-nodejs-npm.yml --json
ok "doctor" overwire doctor
ok "doctor capabilities" overwire doctor capabilities

echo "== Event simulation =="
ok "simulate push" overwire simulate push
ok "simulate pull_request" overwire simulate pull_request
ok "simulate workflow_dispatch" overwire simulate workflow_dispatch --inputs '{"version":"1.0.0"}'
ok "simulate repository_dispatch" overwire simulate repository_dispatch --event-type deploy-request --client-payload '{"version":"2.0.0","environment":"staging"}'
ok "simulate release" overwire simulate release --tag-name v1.0.0
ok "simulate create" overwire simulate create --ref-type branch
ok "simulate delete" overwire simulate delete --ref-type branch
ok "simulate schedule" overwire simulate schedule --schedule "0 0 * * 1"
ok "simulate issue_comment" overwire simulate issue_comment --comment-body "/deploy staging"
ok "simulate issues" overwire simulate issues --issue-action opened
ok "simulate pull_request_review" overwire simulate pull_request_review --review-state approved
ok "simulate merge_group" overwire simulate merge_group

echo "== Runs: starter-app =="
run_wf "starter ci (push)" starter-app/.github/workflows/ci.yml --config-root starter-app/.overwire --event push
run_wf "starter env-and-expressions" starter-app/.github/workflows/env-and-expressions.yml --config-root starter-app/.overwire --event workflow_dispatch

echo "== Runs: pipeline-app =="
run_wf "pipeline ci (push)" pipeline-app/.github/workflows/ci.yml --config-root pipeline-app/.overwire --event push
run_wf "pipeline ci (pull_request)" pipeline-app/.github/workflows/ci.yml --config-root pipeline-app/.overwire --event pull_request --changed-files src/index.js --changed-files package.json
run_wf "deploy (dispatch, staging)" pipeline-app/.github/workflows/deploy.yml --config-root pipeline-app/.overwire --event workflow_dispatch --inputs '{"version":"2.0.0","environment":"staging","dry-run":"true"}'
run_wf "dynamic-matrix" pipeline-app/.github/workflows/dynamic-matrix.yml --config-root pipeline-app/.overwire --event workflow_dispatch
run_wf "compat (pull_request)" pipeline-app/.github/workflows/compat.yml --config-root pipeline-app/.overwire --event pull_request
run_wf "integration-test" pipeline-app/.github/workflows/integration-test.yml --config-root pipeline-app/.overwire --event pull_request --changed-files src/config.js
run_wf "release-publish" pipeline-app/.github/workflows/release-publish.yml --config-root pipeline-app/.overwire --event release
run_wf "repository-dispatch" pipeline-app/.github/workflows/repository-dispatch.yml --config-root pipeline-app/.overwire --event repository_dispatch
run_wf "branch-lifecycle (create)" pipeline-app/.github/workflows/branch-lifecycle.yml --config-root pipeline-app/.overwire --event create
run_wf "branch-lifecycle (delete)" pipeline-app/.github/workflows/branch-lifecycle.yml --config-root pipeline-app/.overwire --event delete

echo "== Runs: compliance-app =="
run_wf "compliance ci (pull_request)" compliance-app/.github/workflows/ci.yml --config-root compliance-app/.overwire --event pull_request --changed-files src/api/handler.js
run_wf "fork-safe-pr" compliance-app/.github/workflows/fork-safe-pr.yml --config-root compliance-app/.overwire --event pull_request_target
run_wf "issue-ops (issue_comment)" compliance-app/.github/workflows/issue-ops.yml --config-root compliance-app/.overwire --event issue_comment
run_wf "issue-ops (issues)" compliance-app/.github/workflows/issue-ops.yml --config-root compliance-app/.overwire --event issues
run_wf "scheduled-audit" compliance-app/.github/workflows/scheduled-audit.yml --config-root compliance-app/.overwire --event schedule
run_wf "merge-queue-checks" compliance-app/.github/workflows/merge-queue-checks.yml --config-root compliance-app/.overwire --event merge_group
run_wf "compliance-gate" compliance-app/.github/workflows/compliance-gate.yml --config-root compliance-app/.overwire --event workflow_run
run_wf "pr-auto-label" compliance-app/.github/workflows/pr-auto-label.yml --config-root compliance-app/.overwire --event pull_request
run_wf "bad-practices (mock run)" compliance-app/.github/workflows/bad-practices.yml --config-root compliance-app/.overwire --event workflow_dispatch

echo "== Runs: enterprise-actions (workflow_call) =="
run_wf "build-nodejs-npm" enterprise-actions/.github/workflows/build-nodejs-npm.yml --config-root enterprise-actions/.overwire --event workflow_call --inputs '{"node-version":"20"}'
run_wf "lint-check" enterprise-actions/.github/workflows/lint-check.yml --config-root enterprise-actions/.overwire --event workflow_call --inputs '{}'
run_wf "dependency-scan" enterprise-actions/.github/workflows/dependency-scan.yml --config-root enterprise-actions/.overwire --event workflow_call --inputs '{}'
run_wf "codeql-scan" enterprise-actions/.github/workflows/codeql-scan.yml --config-root enterprise-actions/.overwire --event workflow_call --inputs '{}'
run_wf "multi-shell-check" enterprise-actions/.github/workflows/multi-shell-check.yml --config-root enterprise-actions/.overwire --event workflow_call --inputs '{}'
run_wf "deploy-preview" enterprise-actions/.github/workflows/deploy-preview.yml --config-root enterprise-actions/.overwire --event workflow_call --inputs '{"environment":"staging","version":"1.0.0"}'
run_wf "quality-report" enterprise-actions/.github/workflows/quality-report.yml --config-root enterprise-actions/.overwire --event workflow_call --inputs '{}'
run_wf "generate-sbom" enterprise-actions/.github/workflows/generate-sbom.yml --config-root enterprise-actions/.overwire --event workflow_call --inputs '{}'
run_wf "build-and-attest" enterprise-actions/.github/workflows/build-and-attest.yml --config-root enterprise-actions/.overwire --event workflow_call --inputs '{"node-version":"20"}'

echo "== Chains =="
run_chain "chain ci-deploy" pipeline-app/.overwire/chains/ci-deploy.yml pipeline-app/.overwire
run_chain "chain release-lifecycle" pipeline-app/.overwire/chains/release-lifecycle.yml pipeline-app/.overwire
run_chain "chain pr-lifecycle" compliance-app/.overwire/chains/pr-lifecycle.yml compliance-app/.overwire
run_chain "chain scheduled-compliance" compliance-app/.overwire/chains/scheduled-compliance.yml compliance-app/.overwire
ok "chain list" overwire chain list --config-root pipeline-app/.overwire

echo "== Mock contracts and resolution (needs network) =="
ok "resolve actions/checkout" overwire resolve actions/checkout@v4
SEED_DIR=$(mktemp -d)
trap 'rm -rf "$SEED_DIR"' EXIT
ok "seed-mocks" overwire seed-mocks enterprise-actions/.github/workflows/build-nodejs-npm.yml --config-root enterprise-actions/.overwire --out "$SEED_DIR" --force

echo "== History, status, cache =="
ok "history starter-app" overwire history --config-root starter-app/.overwire
ok "history pipeline-app" overwire history --config-root pipeline-app/.overwire
ok "status pipeline-app" overwire status --config-root pipeline-app/.overwire
ok "cache" overwire cache
ok "cache tool-cache" overwire cache tool-cache

echo "== Advanced flags =="
fails "deploy --force with missing inputs (exit 1 expected)" overwire run pipeline-app/.github/workflows/deploy.yml --config-root pipeline-app/.overwire --event workflow_dispatch --inputs '{}' --force
run_wf "starter ci --no-action-cache" starter-app/.github/workflows/ci.yml --config-root starter-app/.overwire --event push --no-action-cache
run_wf "env-and-expressions --debug" starter-app/.github/workflows/env-and-expressions.yml --config-root starter-app/.overwire --event workflow_dispatch --debug

if [ -n "$(git status --porcelain)" ]; then
  echo "FAIL: tour left the repo dirty:"
  git status --porcelain
  exit 1
fi
note "repo left clean (git status empty)"

echo
echo "TOUR PASS — ${PASS} checks"
