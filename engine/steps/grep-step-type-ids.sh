#!/bin/bash

find . -name \*.ts | grep -v '\.d\.ts' | xargs grep 'const STEP'
