//go:build js && wasm
// +build js,wasm

package kvstore

var (
	sessionsKV Store
	handlesKV  Store
)

const (
	kHandlesBinding  = "HANDLES_KV"
	kSessionsBinding = "SESSIONS_KV"
)

func IsReady() bool {
	return sessionsKV != nil && handlesKV != nil
}

func Sessions() Store {
	if sessionsKV == nil {
		panic("sessionsKV is not initialized")
	}
	return sessionsKV
}

func Handles() Store {
	if handlesKV == nil {
		panic("handlesKV is not initialized")
	}
	return handlesKV
}
