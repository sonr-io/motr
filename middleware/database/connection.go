//go:build js && wasm
// +build js,wasm

package database

import (
	"github.com/sonr-io/motr/internal/db/activity"
	"github.com/sonr-io/motr/internal/db/network"
	"github.com/sonr-io/motr/internal/db/users"
)


// connection is a database context
type Connection interface {
	IsReady() bool
	Activity() activity.Querier
	Network() network.Querier
	Users() users.Querier
}

type connection struct {
	activity activity.Querier
	network  network.Querier
	users    users.Querier
	ready    bool
}

func (q *connection) IsReady() bool {
	return q.ready
}

func (q *connection) Activity() activity.Querier {
	return q.activity
}

func (q *connection) Network() network.Querier {
	return q.network
}

func (q *connection) Users() users.Querier {
	return q.users
}

// open creates a new database connection
func open() Connection {
	conn := &connection{
		ready: false,
	}
	conn.initialize()
	activityDB = conn.Activity()
	networkDB = conn.Network()
	userDB = conn.Users()
	return conn
}
