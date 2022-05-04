#!/usr/bin/env bash

set -e

echo "Run entrypoint..."
echo AWS_ENV_PATH=$AWS_ENV_PATH
echo AWS_REGION=$AWS_REGION

# if [[ -v "${AWS_ENV_PATH+x}" && -v "${AWS_REGION+x}" ]]; then
if [[ "$AWS_ENV_PATH" && "$AWS_REGION" ]]; then
  echo "Get ssm parameter store..."
  eval $(aws-env -recursive)
fi

echo POSTGRES_HOSTNAME=$POSTGRES_HOSTNAME
echo POSTGRES_DATABASE=$POSTGRES_DATABASE
echo POSTGRES_USERNAME=$POSTGRES_USERNAME
echo REDIS_HOSTNAME=$REDIS_HOSTNAME

exec "$@"
