#!/bin/bash
set -x
set -e
dirs=`find . -maxdepth 1 -not -name add-asset -not -name . -type d`
echo $dirs
for d in $dirs
do
  cp add-asset/tsconfig.json $d
	# echo $d
	# cd $d
	# pwd
	# pnpm i -S react
	# pnpm i -D @types/react
	# cp ../add-asset/tslib/index.ts tslib
	# cp ../add-asset/tslib/step-info.ts tslib
	# cp ../add-asset/tsconfig.json .
	# cd ..

done

