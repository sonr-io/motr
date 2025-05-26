//go:build js && wasm
// +build js,wasm

package middleware

import (
	"github.com/labstack/echo/v4"
	"github.com/sonr-io/motr/shared/current"
	"github.com/sonr-io/motr/sink/config"
	"github.com/sonr-io/motr/sink/models"
	"github.com/syumai/workers/cloudflare/kv"
)

type SessionContext struct {
	echo.Context
	ID       string
	DB       models.Querier
	Config   config.Config
	Handles  *kv.Namespace
	Sessions *kv.Namespace
	Status   *current.Status
}

func UnwrapSession(c echo.Context) *SessionContext {
	cc := c.(*SessionContext)
	if cc == nil {
		panic("Session Context not found")
	}
	return cc
}

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
func (sc *SessionContext) LoadStatus(kv *kv.Namespace) (*current.Status, error) {
	ststr, err := kv.GetString(sc.ID, nil)
	if err != nil {
		return nil, err
	}
	st := &current.Status{}
	err = st.Unmarshal([]byte(ststr))
	if err != nil {
		return nil, err
	}
	sc.Status = st
	return st, nil
}
