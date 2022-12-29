#!/usr/bin/env bash
set -x
set -e

pnpm i
pnpm run clean
pnpm exec tsc
pnpm run build
pnpm run deploy
pnpm test
