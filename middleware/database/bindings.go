//go:build js && wasm
// +build js,wasm

package database

import (
	"database/sql"

	"github.com/sonr-io/motr/internal/sink/activity"
	"github.com/sonr-io/motr/internal/sink/network"
	"github.com/sonr-io/motr/internal/sink/users"

	_ "github.com/syumai/workers/cloudflare/d1"
)

var (
	kActivityBinding = "ACTIVITY_DB"
	kNetworkBinding  = "NETWORK_DB"
	kUsersBinding    = "USERS_DB"
)

func (c *connection) initialize() {
	c.activity = activity.New(openD1(kActivityBinding))
	c.network = network.New(openD1(kNetworkBinding))
	c.users = users.New(openD1(kUsersBinding))
	c.ready = true
}

func openD1(name string) *sql.DB {
	db, err := sql.Open("d1", name)
	if err != nil {
		panic(err)
	}
	return db
}
