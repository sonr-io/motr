// Note the 'go.1.23.4' below, that matches the version you just found:
importScripts('https://cdn.jsdelivr.net/gh/golang/go@go1.23.1/misc/wasm/wasm_exec.js')
importScripts('https://cdn.jsdelivr.net/gh/nlepage/go-wasm-http-server@v2.2.1/sw.js')



  
addEventListener('activate', (event) => {
  event.waitUntil(clients.claim())
})

registerWasmHTTPListener('app.wasm', { base: 'vault' })
