#!/bin/sh
set -e

echo "Running database migration: direction=${DIRECTION}, dry-run=${DRY_RUN}"

if [ "$DRY_RUN" = "true" ]; then
  echo "Dry run — no changes applied"
  echo "applied-count=0" >> "$GITHUB_OUTPUT"
  echo "current-version=pending" >> "$GITHUB_OUTPUT"
  exit 0
fi

echo "Applying migrations (${DIRECTION})..."
echo "applied-count=3" >> "$GITHUB_OUTPUT"
echo "current-version=2025.05.21" >> "$GITHUB_OUTPUT"
echo "Migration complete"
