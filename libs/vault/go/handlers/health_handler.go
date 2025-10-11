//go:build wasm
// +build wasm

// Package handlers provides HTTP handlers for the Motor Payment Gateway & OIDC Server
package handlers

import (
	"net/http"
	"time"

	"motr/go/utils"
)

// Health & Status Handlers

// HandleHealth returns service health status
func HandleHealth(w http.ResponseWriter, r *http.Request) {
	if r.Method == "OPTIONS" {
		utils.HandleCORS(w)
		return
	}

	utils.WriteJSON(w, http.StatusOK, map[string]interface{}{
		"status":    "healthy",
		"service":   "motor-gateway",
		"timestamp": time.Now().Unix(),
	})
}

// HandleStatus returns detailed service status
func HandleStatus(w http.ResponseWriter, r *http.Request) {
	if r.Method == "OPTIONS" {
		utils.HandleCORS(w)
		return
	}

	utils.WriteJSON(w, http.StatusOK, map[string]interface{}{
		"status":  "operational",
		"version": "1.0.0",
		"services": map[string]string{
			"payment_gateway": "active",
			"oidc_provider":   "active",
		},
		"uptime": time.Now().Unix(),
	})
}
