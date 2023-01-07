#!/bin/bash
set -x
set -e
source .env
./node_modules/.bin/ganache --fork  $MAINNET_ETHEREUM --verbose --mnemonic "$GANACHE_MNEMONIC" 
