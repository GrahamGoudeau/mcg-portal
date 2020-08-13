#!/bin/bash

# expecting files in the form vX.Y.Z.ddl
find db_migrations -name '*.ddl' | sort -V | while read -r f; do docker exec pg-docker psql -U postgres -h localhost -c "$(cat $f)"; done
