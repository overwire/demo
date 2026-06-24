# Overwire Demo

Demo workspaces for [Overwire](https://overwire.io), the local workflow workbench. Clone this repo and open either directory in Overwire.

## Single-repo demo (free)

Open `single-repo-demo/` in the desktop app, or from the CLI:

```sh
cd single-repo-demo
overwire init
overwire run .github/workflows/ci.yml --config-root .overwire --event push
```

A self-contained Node.js project with two workflows, pre-configured variables, secrets, step modes, and event payloads. No cross-repo dependencies. See [single-repo-demo/README.md](single-repo-demo/README.md).

## Multi-repo demo (Pro)

Open `multi-repo-demo/` in the desktop app, or from the CLI:

```sh
cd multi-repo-demo
overwire init --workspace
```

A four-repository workspace across two fictional organizations showcasing multi-repo workspaces, governance simulation (rulesets, custom properties, organization settings), workflow chains, and cross-repo reusable workflows. See [multi-repo-demo/README.md](multi-repo-demo/README.md).

---

Overwire is not affiliated with, endorsed by, or sponsored by GitHub, Inc., Microsoft Corporation, or Docker, Inc. GitHub and GitHub Actions are trademarks of GitHub, Inc. The organizations and repositories in this workspace are fictional.
