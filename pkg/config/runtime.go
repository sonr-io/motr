package config

import (
	"database/sql"

	"github.com/onsonr/motr/x/identity"
	"github.com/onsonr/motr/x/portfolio"
	"github.com/onsonr/motr/x/user"
)

type DBConnection struct {
	DB        *sql.DB
	Identity  identity.Model
	Portfolio portfolio.Model
	User      user.Model
}

type RuntimeContext interface {
	GetMotrConfig() *MotrConfig
	GetDatabaseConnection() *DBConnection
}
