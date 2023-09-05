#!/bin/bash

set -e

if [ "$#" -ne 1 ]; then
  echo "Usage: $0 <argument>"
  exit 1
fi

tag_name=$1

update_version() {
  local new_version=$1
  local file=$2

  echo updating version in $file
  jq --arg version "$new_version" '.version = $version' "$file" > "temp.json" && mv "temp.json" "$file"
}

 packagePaths=`find . -maxdepth 4 -name package.json`
 for packagePath in $packagePaths; do
   update_version $tag_name $packagePath
 done

set -x
set +e
git tag -d "client-sdk-$tag_name"
git push origin --delete "client-sdk-$tag_name"
set -e

git add -A
git commit -m "updating version to $tag_name"

git tag "client-sdk-$tag_name"

git push origin "client-sdk-$tag_name"
