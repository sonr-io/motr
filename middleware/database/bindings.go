//go:build js && wasm
// +build js,wasm

package database

import (
	"database/sql"

	"github.com/sonr-io/motr/internal/db/activity"
	"github.com/sonr-io/motr/internal/db/network"
	"github.com/sonr-io/motr/internal/db/users"

	_ "github.com/syumai/workers/cloudflare/d1"
)

var (
	activityDB activity.Querier
	networkDB  network.Querier
	userDB     users.Querier
)

const (
	kActivityBinding = "ACTIVITY_DB"
	kNetworkBinding  = "NETWORK_DB"
	kUsersBinding    = "USERS_DB"
)

func IsReady() bool {
	return activityDB != nil && networkDB != nil && userDB != nil
}

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

func Activity() activity.Querier {
	if activityDB == nil {
		panic("activityDB is not initialized")
	}
	return activityDB
}

func Network() network.Querier {
	if networkDB == nil {
		panic("networkDB is not initialized")
	}
	return networkDB
}

func Users() users.Querier {
	if userDB == nil {
		panic("userDB is not initialized")
	}
	return userDB
}
