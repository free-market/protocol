#!/usr/bin/env bash
set -e
set -x
pnpm exec truffle compile
pnpm run generate-clients
