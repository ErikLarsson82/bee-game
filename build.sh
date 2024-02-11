#!/usr/bin/env bash
rm -rf dist/*
mkdir -p dist
cp -r images dist #remove if all packed
cp images/spritesheet.png dist/
cp images/spritesheet.json dist/
cp index.html dist
cp ironchest-bee.ttf dist
cp pico8-mono.ttf dist
