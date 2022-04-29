#!/usr/bin/env bash

set -euo pipefail

if [[ -v "${AWS_ENV_PATH+x}" && -v "${AWS_REGION+x}" ]]; then
  eval $(aws-env -recursive)
fi

exec "$@"
