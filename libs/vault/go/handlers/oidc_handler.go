//go:build wasm
// +build wasm

package handlers

import (
	"net/http"
	"strings"

	"motr/go/middleware"
	"motr/go/utils"
)

// HandleOIDCDiscovery returns OIDC discovery document
func HandleOIDCDiscovery(w http.ResponseWriter, r *http.Request) {
	if r.Method == "OPTIONS" {
		utils.HandleCORS(w)
		return
	}

	discovery := middleware.GetOIDCProvider().GetDiscovery()
	utils.WriteJSON(w, http.StatusOK, discovery)
}

// HandleJWKS returns JSON Web Key Set
func HandleJWKS(w http.ResponseWriter, r *http.Request) {
	if r.Method == "OPTIONS" {
		utils.HandleCORS(w)
		return
	}

	jwk := middleware.GetJWTManager().GetPublicKeyJWK()
	utils.WriteJSON(w, http.StatusOK, map[string]interface{}{
		"keys": []map[string]interface{}{jwk},
	})
}

// HandleAuthorize handles authorization requests
func HandleAuthorize(w http.ResponseWriter, r *http.Request) {
	if r.Method == "OPTIONS" {
		utils.HandleCORS(w)
		return
	}

	if r.Method != "GET" && r.Method != "POST" {
		utils.WriteError(w, http.StatusMethodNotAllowed, "Method not allowed")
		return
	}

	// Parse authorization request
	clientID := r.FormValue("client_id")
	redirectURI := r.FormValue("redirect_uri")
	responseType := r.FormValue("response_type")
	scope := r.FormValue("scope")
	state := r.FormValue("state")
	nonce := r.FormValue("nonce")
	codeChallenge := r.FormValue("code_challenge")
	codeChallengeMethod := r.FormValue("code_challenge_method")

	// Validate request
	if clientID == "" || redirectURI == "" || responseType == "" {
		utils.WriteError(w, http.StatusBadRequest, "Missing required parameters")
		return
	}

	// For demo, auto-approve with test user
	userID := "test-user"

	// Generate authorization code
	authCode, err := middleware.GetOIDCProvider().GenerateAuthorizationCode(
		clientID, redirectURI, scope, state, nonce, userID,
		codeChallenge, codeChallengeMethod,
	)
	if err != nil {
		utils.WriteError(w, http.StatusBadRequest, err.Error())
		return
	}

	// Return authorization code
	utils.WriteJSON(w, http.StatusOK, map[string]interface{}{
		"code":         authCode.Code,
		"state":        state,
		"redirect_uri": redirectURI,
	})
}

// HandleToken handles token requests
func HandleToken(w http.ResponseWriter, r *http.Request) {
	if r.Method == "OPTIONS" {
		utils.HandleCORS(w)
		return
	}

	if r.Method != "POST" {
		utils.WriteError(w, http.StatusMethodNotAllowed, "Method not allowed")
		return
	}

	// Parse token request
	var req middleware.TokenRequest
	req.GrantType = r.FormValue("grant_type")
	req.Code = r.FormValue("code")
	req.RedirectURI = r.FormValue("redirect_uri")
	req.ClientID = r.FormValue("client_id")
	req.ClientSecret = r.FormValue("client_secret")
	req.RefreshToken = r.FormValue("refresh_token")
	req.Scope = r.FormValue("scope")
	req.CodeVerifier = r.FormValue("code_verifier")

	// Handle based on grant type
	var resp *middleware.TokenResponse
	var err error

	switch req.GrantType {
	case "authorization_code":
		resp, err = middleware.GetOIDCProvider().ExchangeCode(&req)
	case "refresh_token":
		// TODO: Implement refresh token flow
		utils.WriteError(w, http.StatusNotImplemented, "Refresh token not yet implemented")
		return
	default:
		utils.WriteError(w, http.StatusBadRequest, "Unsupported grant type")
		return
	}

	if err != nil {
		utils.WriteError(w, http.StatusBadRequest, err.Error())
		return
	}

	utils.WriteJSON(w, http.StatusOK, resp)
}

// HandleUserInfo returns user information
func HandleUserInfo(w http.ResponseWriter, r *http.Request) {
	if r.Method == "OPTIONS" {
		utils.HandleCORS(w)
		return
	}

	if r.Method != "GET" && r.Method != "POST" {
		utils.WriteError(w, http.StatusMethodNotAllowed, "Method not allowed")
		return
	}

	// Get bearer token from Authorization header
	authHeader := r.Header.Get("Authorization")
	if authHeader == "" {
		utils.WriteError(w, http.StatusUnauthorized, "Missing authorization header")
		return
	}

	// Extract token
	parts := strings.Split(authHeader, " ")
	if len(parts) != 2 || parts[0] != "Bearer" {
		utils.WriteError(w, http.StatusUnauthorized, "Invalid authorization header")
		return
	}

	accessToken := parts[1]

	// Get user info
	userInfo, err := middleware.GetOIDCProvider().GetUserInfo(accessToken)
	if err != nil {
		utils.WriteError(w, http.StatusUnauthorized, err.Error())
		return
	}

	utils.WriteJSON(w, http.StatusOK, userInfo)
}
