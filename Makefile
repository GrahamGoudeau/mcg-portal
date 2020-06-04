run-server:
	docker build . -f Dockerfile -t app-demo && docker run --rm -p 5000:5000 app-demo:latest

init-postgres:
	mkdir -p $$HOME/docker/volumes/postgres
	docker \
		run \
		--rm \
		--name pg-docker \
		-e POSTGRES_PASSWORD=docker \
		-d \
		-p 5432:5432 \
		-v $$HOME/docker/volumes/postgres:/var/lib/postgresql/data \
		postgres:9.6-alpine
	bash ./standUpDB.bash

run-psql:
	docker exec -it pg-docker psql -U postgres -h localhost

teardown-db:
	rm -rf $$HOME/docker/volumes/postgres
	docker container rm -f pg-docker
	sleep 3 # wait for docker to actually kill the container
