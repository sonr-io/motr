VERSION 0.8
FROM alpine:latest
WORKDIR /work

IMPORT ./controller AS controller
IMPORT ./resolver AS resolver
IMPORT ./signer AS signer

build:
    BUILD controller+build
    BUILD resolver+build
    BUILD signer+build
    SAVE ARTIFACT signer/plugin.wasm AS LOCAL ./signer.wasm

repo:
    FROM tinygo/tinygo:0.37.0
    WORKDIR /work
    COPY . .
    SAVE IMAGE repo:local
