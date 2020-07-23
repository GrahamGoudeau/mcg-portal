#!/bin/bash

if [ -z "$VERSION" ]; then
  echo '$VERSION not set'
  exit 1
fi

if [ "$(git status --porcelain | wc -l | grep -Eo '[0-9]+')" != "0" ]; then
  echo 'git status --porcelain is not empty'
  exit 1
fi

set -e

git fetch
remoteHEAD=$(git rev-parse origin/master)
localHEAD=$(git rev-parse HEAD)

if [ "$remoteHEAD" != "$localHEAD" ]; then
  echo "origin/master is not at the same commit as local"
  exit 1
fi

heroku container:push web
heroku container:release web

git tag -a "$VERSION" "$localHEAD" -m "$VERSION"
