FROM node:16-alpine

RUN apk --no-cache add bash ca-certificates

WORKDIR /usr/src/app

COPY docker/backend/Dockerfile /Dockerfile
COPY docker/backend/docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN ln -s /usr/local/bin/docker-entrypoint.sh /docker-entrypoint.sh

ENV NPM_CONFIG_LOGLEVEL=warn

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

COPY backend/src/ ./

RUN npm install

# eval ssm params inside container until ECS supports ssm params in CFN
RUN wget https://github.com/Droplr/aws-env/raw/b215a696d96a5d651cf21a59c27132282d463473/bin/aws-env-linux-amd64 -O /bin/aws-env && \
  chmod +x /bin/aws-env

EXPOSE 8080

ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
CMD ["npm", "start"]
