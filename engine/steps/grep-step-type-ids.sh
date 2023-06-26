#!/bin/bash

find . -name \*.ts | grep -v '\.d\.ts' | xargs grep 'const STEP_TYPE_ID' | perl -p -e 's/(.*):export const (.*) = (.*)/\3 \2 \1/' | sort -n
echo -----
find . -name \*.ts | grep -v '\.d\.ts' | xargs grep 'const STEP_TYPE_ID' | perl -p -e 's/(.*):export const (.*) = (.*)/\3 \2/' | sort -n
