run:
	docker build . --tag flask-example && \
	docker \
		run \
		--rm \
		-v $$(pwd)/static:/app/static \
		-p 5000:5000 \
		flask-example:latest
