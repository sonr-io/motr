//go:build js && wasm
// +build js,wasm

package cflare

import (
	"encoding/json"
)

type KVNamespace interface {
	// Generic Operations
	Has(key string) (bool, error)
	Get(key string) ([]byte, error)
	Put(key string, value []byte) error
	Delete(key string) error

	// Bytes Operations
	GetBytes(key string) ([]byte, error)
	PutBytes(key string, value []byte) error
	DeleteBytes(key string) error

	// String Operations
	GetString(key string) (string, error)
	PutString(key string, value string) error
	DeleteString(key string) error

	// JSON Operations
	GetJSON[T any](key string) (T, error)
	PutJSON[T json.Marshaler](key string, value T) error
	DeleteJSON(key string) error
}
