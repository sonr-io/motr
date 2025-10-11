//go:build js && wasm
// +build js,wasm

package main

import (
	"log"
	"net/http"

	"motr/handlers"
	"motr/middleware"

	wasmhttp "github.com/nlepage/go-wasm-http-server/v2"
)

func main() {
	// Set up HTTP routes
	setupRoutes()

	// Start the WASM HTTP server
	log.Println("Motor Payment Gateway & OIDC Server starting...")
	log.Println("Available endpoints:")
	log.Println("  Health: /health, /status")
	log.Println("  Payment API: /api/payment/*")
	log.Println("  OIDC: /.well-known/*, /authorize, /token, /userinfo")

	wasmhttp.Serve(nil)
}

// setupRoutes configures all HTTP routes with security middleware
func setupRoutes() {
	// Health and status endpoints (no rate limiting)
	http.HandleFunc("/health", handlers.HandleHealth)
	http.HandleFunc("/status", handlers.HandleStatus)

	// W3C Payment Handler API endpoints with security
	http.HandleFunc("/payment/instruments", middleware.SecurityMiddleware(handlers.HandlePaymentInstruments))
	http.HandleFunc("/payment/canmakepayment", middleware.SecurityMiddleware(handlers.HandleCanMakePayment))
	http.HandleFunc("/payment/paymentrequest", middleware.SecurityMiddleware(handlers.HandlePaymentRequest))

	// Payment Gateway endpoints with security
	http.HandleFunc("/api/payment/process", middleware.SecurityMiddleware(handlers.HandlePaymentProcess))
	http.HandleFunc("/api/payment/validate", middleware.SecurityMiddleware(handlers.HandlePaymentValidate))
	http.HandleFunc("/api/payment/status/", middleware.SecurityMiddleware(handlers.HandlePaymentStatus))
	http.HandleFunc("/api/payment/refund", middleware.SecurityMiddleware(handlers.HandlePaymentRefund))

	// OIDC endpoints with security
	http.HandleFunc("/.well-known/openid-configuration", handlers.HandleOIDCDiscovery) // No rate limit for discovery
	http.HandleFunc("/.well-known/jwks.json", handlers.HandleJWKS)                     // No rate limit for JWKS
	http.HandleFunc("/authorize", middleware.SecurityMiddleware(handlers.HandleAuthorize))
	http.HandleFunc("/token", middleware.SecurityMiddleware(handlers.HandleToken))
	http.HandleFunc("/userinfo", middleware.SecurityMiddleware(handlers.HandleUserInfo))
}
