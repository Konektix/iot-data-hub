#!/usr/bin/env bash
# scripts/run-integration.sh

. ./scripts/run-docker-compose.sh

DIR="$(cd "$(dirname "$0")" && pwd)"
source $DIR/setenv.sh
# Runnig Postgres db service using base compose file
run_docker_compose -f docker-compose.base.yml up iot-data-hub-db -d
echo '🟡 - Waiting for database to be ready...'
export WAITFORIT_TIMEOUT=3
$DIR/wait-for-it.sh "${DATABASE_URL}" -- echo '🟢 - Database is ready!'

npm run prisma

npm t

run_docker_compose down