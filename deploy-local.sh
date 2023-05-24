#!/bin/bash
set -x
set -e
find . -type d | grep 'deployments/local' | xargs rm -rf
pnpm exec turbo run deploy-contracts --concurrency=1 -- --network local
cd engine/runner
pnpm exec ts-node build-frontdoor-json.ts
