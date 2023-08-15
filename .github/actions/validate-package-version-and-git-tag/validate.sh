#!/usr/bin/env bash

prefix=$1
gitRef=$2

verifyTagMatchesPackageJsonVersion() {
  if [[ $gitRef =~ $prefix(.*) ]]; then
    refVersion=${BASH_REMATCH[1]}
    # echo "gitRef '$gitRef' is prefixed by '$prefix'"
    packageVersion=`cat $1 | jq -r '.version'`
    # echo $packageVersion
    # echo "gitRef version  = $refVersion"
    # echo "package version = $packageVersion"
    if [ $packageVersion == $refVersion ]; then
      echo $1: gitRef $gitRef is prefixed by $prefix and versions match
      return
      # exit 0
    else
      echo $1 versions do not match
      exit 1
    fi
  fi
  echo "$1 gitRef '$gitRef' is does not prefixed by '$prefix'"
  exit 1
}

packageJsons=`find . -maxdepth 4 -type f -name package.json | grep -v node_modules`
for pkgj in $packageJsons; do
  verifyTagMatchesPackageJsonVersion $pkgj
done

# a='refs/tags/client-sdk-0.2.0'
# b='refs/tags/client-sdk-'
# echo "x gitRef '$gitRef' is prefixed by '$prefix'"
# if [[ $gitRef =~ $prefix(.*) ]]; then
#   echo omg
#   echo ${BASH_REMATCH[0]}
#   echo ${BASH_REMATCH[1]}
#   echo ${BASH_REMATCH[2]}
#   echo --
# fi
