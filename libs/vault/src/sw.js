// ServiceWorker for Motor Vault WASM HTTP Server
// This file loads the Go WASM runtime and registers the HTTP server

// Load Go WASM runtime (adjust version based on your Go version)
importScripts('https://cdn.jsdelivr.net/gh/golang/go@go1.24/misc/wasm/wasm_exec.js');

// Load the go-wasm-http-server library
importScripts('https://cdn.jsdelivr.net/gh/nlepage/go-wasm-http-server@v2.2.1/sw.js');

// Register the WASM HTTP listener
registerWasmHTTPListener('./vault.wasm', {
  base: '/vault',
  cacheName: 'motor-vault-wasm'
});

// Skip installed stage and jump to activating stage
addEventListener('install', (event) => {
  event.waitUntil(skipWaiting());
});

// Start controlling clients as soon as the SW is activated
addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});