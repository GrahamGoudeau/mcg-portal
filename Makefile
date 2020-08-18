DEV_BACKEND_HOSTNAME="localhost:5000"
DEV_PORT=5000
DEV_DATABASE_URL="postgres://postgres:docker@host.docker.internal:5432/postgres?sslmode=disable"
DEV_JWT_KEY="mcg-portal-jwt-key"
DEV_MAILGUN_DOMAIN="DEV"
DEV_MAILGUN_API_KEY="DEV"

POSTGRES_IMAGE=12.3-alpine

run-server:
	docker build \
		--build-arg REACT_APP_HOSTNAME=${DEV_BACKEND_HOSTNAME} \
		--build-arg PORT=${DEV_PORT} \
		--build-arg DATABASE_URL=${DEV_DATABASE_URL} \
		--build-arg JWT_KEY=${DEV_JWT_KEY} \
		--build-arg ALLOW_HTTP=true \
		--build-arg MAILGUN_DOMAIN=${DEV_MAILGUN_DOMAIN} \
		--build-arg MAILGUN_API_KEY=${DEV_MAILGUN_API_KEY} \
		. \
		-f Dockerfile \
		-t mcg-portal \
	&& docker run --rm -p 5000:5000 mcg-portal:latest

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
		postgres:${POSTGRES_IMAGE}
	bash ./runDbInit.sh

run-postgres-attached:
	docker \
    		run \
    		--rm \
    		--name pg-docker \
    		-e POSTGRES_PASSWORD=docker \
    		-p 5432:5432 \
    		-v $$HOME/docker/volumes/postgres:/var/lib/postgresql/data \
    		postgres:${POSTGRES_IMAGE}

run-psql:
	docker exec -it pg-docker psql -U postgres -h localhost

teardown-db:
	rm -rf $$HOME/docker/volumes/postgres
	docker container rm -f pg-docker
	sleep 3 # wait for docker to actually kill the container

reclaim-docker-space:
	docker rm $$(docker ps -q -f 'status=exited') || echo "No processes to clean up"
	docker rmi $$(docker images -q -f "dangling=true") || echo "No images to clean up"

reset-postgres:
	docker exec -it pg-docker psql -U postgres -h localhost -c "$$(cat ./dataInit.sql )"
