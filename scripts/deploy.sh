#!/bin/bash

VERSION=$1

if [ -z "$VERSION" ]; then
  read -p "Please, input version: " VERSION
fi

npm run build && \
npm version $VERSION && \
git push && \
git push --tags && \
npm publish --access=public
