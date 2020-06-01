run:
	docker build . --tag flask-example && docker run --rm -p 5000:5000 flask-example:latest
