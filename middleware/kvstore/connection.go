//go:build js && wasm
// +build js,wasm

package kvstore

// connection is a database context
type Connection interface {
	Handles() Store
	Sessions() Store
	IsReady() bool
}

type connection struct {
	ready    bool
	handles  Store
	sessions Store
}

func (q *connection) initialize() {
	q.handles = openStore(kHandlesBinding)
	q.sessions = openStore(kSessionsBinding)
	q.ready = true
}

func (q *connection) IsReady() bool {
	return q.ready
}

func (q *connection) Handles() Store {
	return q.handles
}

func (q *connection) Sessions() Store {
	return q.sessions
}

// open creates a new database connection
func open() Connection {
	conn := &connection{
		ready: false,
	}
	conn.initialize()
	handlesKV = conn.Handles()
	sessionsKV = conn.Sessions()
	return conn
}
