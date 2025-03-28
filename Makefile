
VERSION := $(shell echo $(shell git describe --tags) | sed 's/^v//')
COMMIT := $(shell git log -1 --format='%H')

.PHONY: all build generate test

all: generate build

build:
	@task -t .taskfile.dist.yml build

generate:
	@task -t .taskfile.dist.yml gen
