# BrinkOfWar

## Deploying locally

Basic instructions for deploying an instance for development are below.

### 1. Clone the repo

`git clone git@gitlab.com:codeorder/brinkofwar.git`

### 2. Run with docker

`docker-compose -f docker/docker-compose.yml -f docker/docker-compose-dev.yml build`

`docker-compose -f docker/docker-compose.yml -f docker/docker-compose-dev.yml up`

### 3. Run database migrations

Connect to the database with your preferred PostgreSQL client using the credentials `downtown-mafia:downtown-mafia` on database `downtown-mafia` and run the SQL found in `backend/src/intial.sql`.

### 4. Restart your instance

For the database changes to apply you must restart your instance by terminating docker-compose and running `docker-compose -f docker/docker-compose.yml -f docker/docker-compose-dev.yml up` again.

Your instance should now be fully operational for development.
