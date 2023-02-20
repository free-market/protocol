#!/usr/bin/env bash
set -e
set -x
rm -rf build types
pnpm exec truffle compile
pnpm run generate-clients
pnpm exec tsc
pnpm run import-truffle-networks
