
generate:
	go run github.com/syumai/workers/cmd/workers-assets-gen -mode=go

build: generate
	GOOS=js GOARCH=wasm go build -ldflags="-s -w" -o ./build/app.wasm .

start:
	wrangler dev

deploy: 
	wrangler deploy
