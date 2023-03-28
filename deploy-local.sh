#!/bin/bash
set -x
set -e
find . -type d | grep 'deployments/local' | xargs rm -rf
pnpm run deploy-contracts -- --network local
cd engine/runner
pnpm exec ts-node build-frontdoor-json.ts
