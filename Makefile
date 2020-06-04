run-server:
	docker build . -f Dockerfile -t app-demo && docker run --rm -p 5000:5000 app-demo:latest

# Get a shell where you can run `yarn install` etc and have it affect the package.json and related files
run-yarn-shell:
	docker build . -f Dockerfile -t yarn-shell --target ui_build
	docker run --entrypoint sh --rm -it --name yarn-shell -v $$PWD/ui:/ui yarn-shell:latest
	rm -rf ui/node_modules

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
