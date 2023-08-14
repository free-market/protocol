#!/bin/bash
set -x
set -e
if [[ -z "$1" ]];  then
	echo provide network name as parameter
	exit 1
fi
echo pnpm exec turbo run deploy-contracts --concurrency=1 -- --network $1
cd engine/runner
echo pnpm exec ts-node build-frontdoor-json.ts
