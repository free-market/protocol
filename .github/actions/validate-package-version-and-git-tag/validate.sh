#!/usr/bin/env bash

prefix=$1
gitRef=$2

if [[ $gitRef =~ $prefix(.*) ]]; then
  refVersion=${BASH_REMATCH[1]}
  echo "gitRef '$gitRef' is prefixed by '$prefix'"
  packageVersion=`cat evm/package.json | jq -r '.version'`
  echo "gitRef version  = $refVersion"
  echo "package version = $packageVersion"
  if [ $packageVersion == $refVersion ]; then
    echo versions match
    exit 0
  else
    echo versions do not match
    exit 1
  fi
fi
echo "gitRef '$gitRef' is does not prefixed by '$prefix'"
exit 1