//go:build js && wasm
// +build js,wasm

package session

import (
	"github.com/labstack/echo/v4"
	"github.com/sonr-io/motr/config"
	"github.com/syumai/workers/cloudflare/kv"
)

type Context struct {
	echo.Context
	ID     string         `json:"id"`
	Config *config.Config `json:"config"`
	Status *Session       `json:"status"`
}

func UnwrapContext(c echo.Context) *Context {
	cc := c.(*Context)
	if cc == nil {
		panic("Session Context not found")
	}
	return cc
}

// SaveStatus saves the state of the current session into the KV store
func (sc *Context) SaveStatus(kv *kv.Namespace) error {
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
func (sc *Context) LoadStatus(kv *kv.Namespace) (*Session, error) {
	ststr, err := kv.GetString(sc.ID, nil)
	if err != nil {
		return nil, err
	}
	st := &Session{}
	err = st.Unmarshal([]byte(ststr))
	if err != nil {
		return nil, err
	}
	sc.Status = st
	return st, nil
}
