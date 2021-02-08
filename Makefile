NAME = chat-like-microservice
REGISTRY = gcr.io/awesome-nucleus-303917
VERSION = $(shell git describe --tags --dirty --always --long)

PROJECT_ROOT = $(shell pwd)

DEV_IMAGE_NAME = ${NAME}-dev
DEV_CONTAINER_NAME = ${DEV_IMAGE_NAME}
DEV_PORT = 3000

.PHONY: all push dev dev-logs start-dev debug-dev stop-dev destroy-dev

all:
	docker build -t ${NAME} .

push:
	docker tag ${NAME}:latest ${NAME}:${VERSION}
	docker tag ${NAME}:latest ${REGISTRY}/${NAME}:${VERSION}
	docker push ${REGISTRY}/${NAME}:${VERSION}

dev:
	docker build -t ${DEV_IMAGE_NAME} .

dev-logs:
	docker logs -f ${DEV_CONTAINER_NAME}

start-dev:
	docker start ${DEV_CONTAINER_NAME} || docker run -d --name ${DEV_CONTAINER_NAME} -v ${PROJECT_ROOT}/src:/app/src -p ${DEV_PORT}:3000 ${DEV_IMAGE_NAME}

debug-dev:
	docker exec -it ${DEV_CONTAINER_NAME} /bin/sh

stop-dev:
	docker stop ${DEV_CONTAINER_NAME}

destroy-dev: stop-dev
	docker rm ${DEV_CONTAINER_NAME}

deploy-like-dev:
  gcloud app deploy --no-promote
