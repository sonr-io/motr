//go:build js && wasm
// +build js,wasm

package config

import (
	"database/sql"

	"github.com/sonr-io/motr/sink/models"
	_ "github.com/syumai/workers/cloudflare/d1"
	"github.com/syumai/workers/cloudflare/kv"
)

func (c CloudflareConfig) GetCommon() (*sql.DB, error) {
	return sql.Open("d1", c.Database)
}

func (c CloudflareConfig) GetQuerier() (models.Querier, error) {
	db, err := c.GetCommon()
	if err != nil {
		return nil, err
	}
	return models.New(db), nil
}

func (c CloudflareConfig) GetSessions() (*kv.Namespace, error) {
	return kv.NewNamespace(c.Sessions)
}

func (c CloudflareConfig) GetHandles() (*kv.Namespace, error) {
	return kv.NewNamespace(c.Handles)
}
