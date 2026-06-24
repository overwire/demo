# Overwire Single-Repo Demo

A self-contained single-repo demo for [Overwire](https://overwire.io), the local workflow workbench.

## Quick start

Open the `single-repo-demo/` directory in Overwire, or run from the CLI:

```sh
overwire run .github/workflows/ci.yml --event push
```

## What's included

- **Two workflows** -- `ci.yml` (build and test) and `env-and-expressions.yml` (variables, secrets, and expression evaluation)
- **Overwire config** -- pre-configured variables, secrets, step modes, dispatch defaults, and event payloads in `.overwire/`
- **A simple Node.js app** -- `src/` with a greeter module, tests, and build/lint scripts

## Mock by default

Both workflows default to mock mode, so everything runs without a container engine or network access. Flip individual steps to live from the editor mode chips to execute inside a real runner container.
