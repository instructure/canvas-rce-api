#!/bin/bash
export COMPOSE_FILE=./docker-compose.yml

# build the container
docker-compose build

# start the containers
docker-compose up -d

# run dependency scanner
docker-compose run --rm -e SNYK_TOKEN=$SNYK_TOKEN web npm run security:dependency-monitor

# run unit tests
docker-compose exec -T web npm run test-cov
unit_status=$?
docker cp $(docker-compose ps -q web):/usr/src/app/coverage coverage

# check formatting
docker-compose run --rm web npm run fmt:check
fmt_status=$?

# lint all the things
docker-compose run --rm web npm run lint
lint_status=$?

docker-compose stop

# jenkins uses the exit code to decide whether you passed or not
((unit_status)) && exit $unit_status
((fmt_status)) && exit $fmt_status
((lint_status)) && exit $lint_status
exit 0
