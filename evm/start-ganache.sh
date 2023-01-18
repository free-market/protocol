#!/bin/bash
set -x
set -e

if [ -f .env ]; then
  source .env
fi

./node_modules/.bin/ganache --fork  $MAINNET_ETHEREUM --verbose --mnemonic "$GANACHE_MNEMONIC"
