#!/bin/bash
set -x
set -e

if [ -f .env ]; then
  source .env
fi

./node_modules/.bin/ganache --fork  $ETHEREUM_MAINNET_URL --verbose --mnemonic "$GANACHE_MNEMONIC"
