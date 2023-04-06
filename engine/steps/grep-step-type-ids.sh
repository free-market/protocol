#!/bin/bash

find . -name \*.ts | xargs grep 'const STEP'
