#!/bin/bash

if [ $# -ne 1 ]; then
  echo 'usage:'
  echo '  ' `basename "$0"` '<workflow.json>'
  exit 1
fi

node build/clis/generate-argument-schema.js $1
