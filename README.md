# Overwire Demo

Demo workspaces for [Overwire](https://overwire.io), the local workflow workbench. Clone this repo and open either directory in Overwire.

## Prerequisites

- **Overwire** — the desktop app (macOS today) ships everything; for CLI-only use, `npm install -g overwire` (needs Node.js 20+). See the [install docs](https://docs.overwire.io/getting-started/installation/).
- **Nothing else for the default tour** — every workflow in both demos defaults to mock mode: no container engine, no network access needed.
- **Live mode only:** a Docker-API-compatible container engine (e.g., Docker Desktop, Colima, OrbStack, Rancher Desktop), plus network access for the first `npm ci` and action fetches.

## Single-repo demo (free)

Open `single-repo-demo/` in the desktop app, or from the CLI:

```sh
cd single-repo-demo
overwire run .github/workflows/ci.yml --config-root .overwire --event push
```

A self-contained Node.js project with two workflows, pre-configured variables, secrets, step modes, and event payloads. No cross-repo dependencies. See [single-repo-demo/README.md](single-repo-demo/README.md).

## Multi-repo demo (Pro)

Open `multi-repo-demo/` in the desktop app, or drive it from the CLI per [multi-repo-demo/CLI-TEST-COMMANDS.md](multi-repo-demo/CLI-TEST-COMMANDS.md).

A four-repository workspace across two fictional organizations showcasing multi-repo workspaces, governance simulation (rulesets, custom properties, organization settings), workflow chains, and cross-repo reusable workflows. See [multi-repo-demo/README.md](multi-repo-demo/README.md).

## Setup and local state

Both demos ship their `.overwire/` config fully populated — including the workspace peer registries (`instances.yml`) — so there is nothing to initialize: `overwire init` is only needed if you add or move repos, and it never overwrites existing files. Runs write only to git-ignored locations: `.overwire/state/` (API captures, sessions, suggestions), `.overwire/cache/`, and the per-user run store at `~/.cache/overwire/runs/`.

## Reset the demo

Tour runs leave `git status` clean. To wipe local run state anyway:

```sh
# from the repo root
rm -rf */.overwire/state */.overwire/cache multi-repo-demo/*/.overwire/state multi-repo-demo/*/.overwire/cache
rm -f  */.overwire/secrets.enc.json multi-repo-demo/*/.overwire/secrets.enc.json
```

Run records live outside the repo in `~/.cache/overwire/runs/` under the demo's fictional org names and are subject to Overwire's normal retention.

---

Overwire is not affiliated with, endorsed by, or sponsored by GitHub, Inc. GitHub and GitHub Actions are trademarks of GitHub, Inc. The organizations and repositories in this workspace are fictional.
