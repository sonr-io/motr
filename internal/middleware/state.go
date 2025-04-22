//go:build js && wasm
// +build js,wasm

package middleware

import (
	"github.com/sonr-io/motr/sink"
	"github.com/syumai/workers/cloudflare/kv"
)

// SaveStatus saves the state of the current session into the KV store
func (sc *SessionContext) SaveStatus(kv *kv.Namespace) error {
	stbz, err := sc.Status.Marshal()
	if err != nil {
		return err
	}
	if err := kv.PutString(sc.ID, string(stbz), nil); err != nil {
		return err
	}
	return nil
}

// LoadStatus loads the state of the current session from the KV store
func (sc *SessionContext) LoadStatus(kv *kv.Namespace) (*sink.Status, error) {
	ststr, err := kv.GetString(sc.ID, nil)
	if err != nil {
		return nil, err
	}
	st := &sink.Status{}
	err = st.Unmarshal([]byte(ststr))
	if err != nil {
		return nil, err
	}
	sc.Status = st
	return st, nil
}
