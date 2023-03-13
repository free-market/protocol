#!/bin/bash

if [ $# -ne 3 ]; then
  echo 'usage:'
  echo '  ' `basename "$0"` '<workflow.json> <arguments.json> <source-chain>'
  exit 1
fi

node build/clis/execute-workflow.js $1 $2 $3