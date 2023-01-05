#!/bin/bash
set -x
set -e
source .env
# ./node_modules/.bin/ganache --fork  https://eth-mainnet.alchemyapi.io/v2/$ALCHEMY_API_KEY --networkId 1010101 --verbose --mnemonic "$FMP_GANACHE_MNEMONIC" 
./node_modules/.bin/ganache  --networkId 1010101 --verbose --mnemonic "$FMP_GANACHE_MNEMONIC" 
