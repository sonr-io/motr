//go:build wasm
// +build wasm

package handlers

import (
	"encoding/json"
	"net/http"
	"strings"

	"motr/go/middleware"
	"motr/go/utils"
)

// W3C Payment Handler API Handlers

// HandlePaymentInstruments returns available payment instruments
func HandlePaymentInstruments(w http.ResponseWriter, r *http.Request) {
	if r.Method == "OPTIONS" {
		utils.HandleCORS(w)
		return
	}

	if r.Method != "GET" {
		utils.WriteError(w, http.StatusMethodNotAllowed, "Method not allowed")
		return
	}

	instruments := middleware.GetPaymentHandler().GetInstruments()
	utils.WriteJSON(w, http.StatusOK, map[string]interface{}{
		"instruments": instruments,
	})
}

// HandleCanMakePayment checks if payment can be made
func HandleCanMakePayment(w http.ResponseWriter, r *http.Request) {
	if r.Method == "OPTIONS" {
		utils.HandleCORS(w)
		return
	}

	if r.Method != "POST" {
		utils.WriteError(w, http.StatusMethodNotAllowed, "Method not allowed")
		return
	}

	var req struct {
		MethodData []middleware.PaymentMethod `json:"methodData"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		utils.WriteError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	canMakePayment := middleware.GetPaymentHandler().CanMakePayment(req.MethodData)
	utils.WriteJSON(w, http.StatusOK, map[string]interface{}{
		"canMakePayment": canMakePayment,
	})
}

// HandlePaymentRequest handles W3C PaymentRequestEvent
func HandlePaymentRequest(w http.ResponseWriter, r *http.Request) {
	if r.Method == "OPTIONS" {
		utils.HandleCORS(w)
		return
	}

	if r.Method != "POST" {
		utils.WriteError(w, http.StatusMethodNotAllowed, "Method not allowed")
		return
	}

	// Parse payment request event
	var reqData json.RawMessage
	if err := json.NewDecoder(r.Body).Decode(&reqData); err != nil {
		utils.WriteError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	paymentReq, err := middleware.SerializePaymentRequest(reqData)
	if err != nil {
		utils.WriteError(w, http.StatusBadRequest, "Invalid payment request")
		return
	}

	// Process payment request
	tx, err := middleware.GetPaymentHandler().ProcessPayment(paymentReq)
	if err != nil {
		utils.WriteError(w, http.StatusInternalServerError, "Payment processing failed")
		return
	}

	// Return payment response
	if tx.Response != nil {
		utils.WriteJSON(w, http.StatusOK, tx.Response)
	} else {
		utils.WriteJSON(w, http.StatusAccepted, map[string]interface{}{
			"transactionId": tx.ID,
			"status":        tx.Status,
		})
	}
}

// Payment Gateway Handlers

// HandlePaymentProcess processes a payment transaction using W3C Payment Handler API
func HandlePaymentProcess(w http.ResponseWriter, r *http.Request) {
	if r.Method == "OPTIONS" {
		utils.HandleCORS(w)
		return
	}

	if r.Method != "POST" {
		utils.WriteError(w, http.StatusMethodNotAllowed, "Method not allowed")
		return
	}

	// Parse payment request
	var reqData json.RawMessage
	if err := json.NewDecoder(r.Body).Decode(&reqData); err != nil {
		utils.WriteError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	paymentReq, err := middleware.SerializePaymentRequest(reqData)
	if err != nil {
		utils.WriteError(w, http.StatusBadRequest, "Invalid payment request")
		return
	}

	// Process payment
	tx, err := middleware.GetPaymentHandler().ProcessPayment(paymentReq)
	if err != nil {
		utils.WriteError(w, http.StatusInternalServerError, "Payment processing failed")
		return
	}

	utils.WriteJSON(w, http.StatusOK, tx)
}

// HandlePaymentValidate validates a payment method
func HandlePaymentValidate(w http.ResponseWriter, r *http.Request) {
	if r.Method == "OPTIONS" {
		utils.HandleCORS(w)
		return
	}

	if r.Method != "POST" {
		utils.WriteError(w, http.StatusMethodNotAllowed, "Method not allowed")
		return
	}

	// Parse validation request
	var req struct {
		Method string                 `json:"method"`
		Data   map[string]interface{} `json:"data"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		utils.WriteError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	// Validate payment method
	valid, err := middleware.GetPaymentHandler().ValidatePaymentMethod(req.Method, req.Data)
	if err != nil {
		utils.WriteError(w, http.StatusInternalServerError, "Validation failed")
		return
	}

	utils.WriteJSON(w, http.StatusOK, map[string]interface{}{
		"valid":   valid,
		"method":  req.Method,
		"message": "Payment method validation complete",
	})
}

// HandlePaymentStatus returns payment transaction status
func HandlePaymentStatus(w http.ResponseWriter, r *http.Request) {
	if r.Method == "OPTIONS" {
		utils.HandleCORS(w)
		return
	}

	if r.Method != "GET" {
		utils.WriteError(w, http.StatusMethodNotAllowed, "Method not allowed")
		return
	}

	// Extract transaction ID from path
	txID := strings.TrimPrefix(r.URL.Path, "/api/payment/status/")
	if txID == "" {
		utils.WriteError(w, http.StatusBadRequest, "Transaction ID required")
		return
	}

	// Get transaction from handler
	tx, exists := middleware.GetPaymentHandler().GetTransaction(txID)
	if !exists {
		utils.WriteError(w, http.StatusNotFound, "Transaction not found")
		return
	}

	utils.WriteJSON(w, http.StatusOK, tx)
}

// HandlePaymentRefund processes a refund
func HandlePaymentRefund(w http.ResponseWriter, r *http.Request) {
	if r.Method == "OPTIONS" {
		utils.HandleCORS(w)
		return
	}

	if r.Method != "POST" {
		utils.WriteError(w, http.StatusMethodNotAllowed, "Method not allowed")
		return
	}

	// TODO: Implement refund processing
	utils.WriteJSON(w, http.StatusOK, map[string]interface{}{
		"refund_id": "ref_" + utils.GenerateID(),
		"status":    "processing",
		"message":   "Refund initiated",
	})
}
