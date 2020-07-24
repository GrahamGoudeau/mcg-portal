#!/bin/bash

exitCode=1
iterations=0

# wait until we can successfully accept connections
until [ $exitCode -eq 0 ] || [ $iterations -eq 20 ]; do
  sleep 3
  echo "Waiting for DB to come online, attempt $((iterations + 1)) of 20"

  # Just attempt to do a dummy `SELECT 1;` to see if it succeeds
  docker exec -it pg-docker psql -U postgres -h localhost -c 'select 1;' >/dev/null
  exitCode=$?

  iterations=$((iterations + 1))
done

# initialize test data that you want the db to be the populated with when it comes up
docker exec -it pg-docker psql -U postgres -h localhost -c "$(cat dataInit.sql)"

