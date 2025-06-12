#!/usr/bin/env bash
# scripts/run-integration.sh

DIR="$(cd "$(dirname "$0")" && pwd)"
source $DIR/setenv.sh
# npm run docker:up timescaledb
# Runnig Postgres db service using base compose file
docker-compose -f docker-compose.base.yml up timescaledb -d
echo '🟡 - Waiting for database to be ready...'
export WAITFORIT_TIMEOUT=3
$DIR/wait-for-it.sh "${DATABASE_URL}" -- echo '🟢 - Database is ready!'

npm run prisma

npm t

npm run docker:down