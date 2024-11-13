.PHONY: api webui docker-build docker-export clean

IMAGE_NAME := mcdsm
TAG := $(shell date +'%Y-%m-%d')

all: api webui docker-build

api:
	cd api && poetry export -f requirements.txt --output requirements.txt

webui:
	cd webui && npm run build

docker-build:
	docker build -t $(IMAGE_NAME):$(TAG) .
	docker image tag $(IMAGE_NAME):$(TAG) $(IMAGE_NAME):latest

docker-export:
	rm -f $(IMAGE_NAME).tar
	docker image save $(IMAGE_NAME):latest -o $(IMAGE_NAME).tar

clean:
	rm -f api/requirements.txt
	rm -rf webui/dist/
	rm -f $(IMAGE_NAME).tar
