FROM node:14-alpine

RUN apk --no-cache add bash ca-certificates

WORKDIR /usr/src/app

COPY docker/frontend/Dockerfile /Dockerfile
COPY docker/frontend/docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh

RUN ln -s /usr/local/bin/docker-entrypoint.sh /docker-entrypoint.sh

ENV NPM_CONFIG_LOGLEVEL=warn

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

COPY frontend/src/ ./

RUN yarn install

# eval ssm params inside container until ECS supports ssm params in CFN
RUN wget https://github.com/Droplr/aws-env/raw/b215a696d96a5d651cf21a59c27132282d463473/bin/aws-env-linux-amd64 -O /bin/aws-env && \
  chmod +x /bin/aws-env

EXPOSE 8080

ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
CMD ["yarn", "run", "start"]
