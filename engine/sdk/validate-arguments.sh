#!/bin/bash

if [ $# -ne 2 ]; then
  echo 'usage:'
  echo '  ' `basename "$0"` '<workflow.json> <arguments.json>'
  exit 1
fi

node build/clis/validate-arguments.js $1 $2