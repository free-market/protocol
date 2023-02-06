#!/usr/bin/env bash
set -e
set -x
pnpm clean
pnpm exec truffle compile
pnpm run generate-clients
pnpm exec tsc
#pnpm exec truffle migrate
#pnpm exec truffle test

