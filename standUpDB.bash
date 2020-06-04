#!/bin/bash

exitCode=1
iterations=0

# wait until we can successfully accept connections
until [ $exitCode -eq 0 ] || [ $iterations -eq 20 ]; do
  sleep 3
  echo "Waiting for DB to come online, attempt $((iterations + 1)) of 20"
  docker exec -it pg-docker psql -U postgres -h localhost -c 'select 1;' >/dev/null
  exitCode=$?
  iterations=$((iterations + 1))
done

# initialize test data that you want the db to be populated with when it comes up
docker exec -it pg-docker psql -U postgres -h localhost -c "
CREATE TABLE my_test_table();
"
