# Agent notes

This is the Overwire demo workspace: four fictional repositories (two organizations) exercising every supported workflow feature. Open it in the Overwire desktop app or drive it entirely from the CLI.

- **The contract for driving Overwire**: run `overwire agents`, or read the guide online at https://docs.overwire.io/automation/ai-agents/. A Claude Code skill is installable from https://github.com/overwire/agents.
- **Verified commands**: every command in [CLI-TEST-COMMANDS.md](./CLI-TEST-COMMANDS.md) passes in default mock mode — start there.
- **Validate before running**: `overwire validate --config-root <app>/.overwire --json` from this directory (replace `<app>` with starter-app, pipeline-app, compliance-app, or enterprise-actions). compliance-app intentionally reports findings from `bad-practices.yml` — it exists as a lint target.
- **Config files carry `$schema` headers** pointing at https://docs.overwire.io/schemas/ — keep them when editing, copy them when adding files.
- **Workflows run by config root**: `overwire run <app>/.github/workflows/<wf>.yml --config-root <app>/.overwire -e <event> --json`. Mock is the default and needs no container engine.
- Do not rename the fictional owners (`acme-corp`, `wire-corp`): cross-repo `uses:` references and `.overwire/instances.yml` resolve against them.
