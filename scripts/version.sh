#!/usr/bin/env sh
set -euo pipefail

version=$(git describe --tags $(git rev-list --tags --max-count=1) | sed 's/^v//' )

if [[ ! $(git describe --exact-match --tags HEAD > /dev/null 2>&1) ]]; then
  version="${version}-$(git rev-parse --short HEAD)"
fi

echo "${version}"
echo "${version}" > version
