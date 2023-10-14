#!/usr/bin/env bash
rm -rf dist/*
cp -r src dist
cp -r images dist
cp index.html dist
cp ironchest-bee.ttf dist
cp pico8-mono.ttf dist

mkdir dist/node_modules

mkdir dist/node_modules/pixi.js
mkdir dist/node_modules/pixi.js/dist
cp node_modules/pixi.js/dist/pixi.min.js dist/node_modules/pixi.js/dist/

mkdir dist/node_modules/@pixi
mkdir dist/node_modules/@pixi/math-extras
mkdir dist/node_modules/@pixi/math-extras/dist
mkdir dist/node_modules/@pixi/math-extras/dist/browser
cp node_modules/@pixi/math-extras/dist/browser/math-extras.js dist/node_modules/@pixi/math-extras/dist/browser/

mkdir dist/node_modules/js-cookie
mkdir dist/node_modules/js-cookie/dist
cp node_modules/js-cookie/dist/js.cookie.js dist/node_modules/js-cookie/dist/