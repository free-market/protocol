#!/usr/bin/env bash
set -e
set -x
pnpm clean
pnpm build
pnpm run import-truffle-networks
pnpm test
