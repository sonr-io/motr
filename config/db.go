//go:build js && wasm
// +build js,wasm

package config

import (
	"database/sql"

	"github.com/sonr-io/motr/sink/models/common"
	"github.com/sonr-io/motr/sink/models/resolver"
	"github.com/sonr-io/motr/sink/models/vault"
	"github.com/syumai/workers/cloudflare"
	_ "github.com/syumai/workers/cloudflare/d1"
)

const (
	commonDBName   = "COMMON_DB"
	resolverDBName = "RESOLVER_DB"
	vaultDBName    = "CONTROLLER_DB"
)

type DBConfig interface {
	GetCommon() *common.Queries
	GetVault() *vault.Queries
	GetResolver() *resolver.Queries
}

func (c dbConfig) GetCommon() *common.Queries {
	return common.New(c.CommonDB)
}

func (c dbConfig) GetVault() *vault.Queries {
	if c.VaultDB == nil {
		panic(ErrDBNotFound)
	}
	return vault.New(c.VaultDB)
}

func (c dbConfig) GetResolver() *resolver.Queries {
	if c.ResolverDB == nil {
		panic(ErrDBNotFound)
	}
	return resolver.New(c.ResolverDB)
}

type dbConfig struct {
	CommonDB   *sql.DB
	VaultDB    *sql.DB
	ResolverDB *sql.DB
	Mode       MotrMode
}

func connectDBs() DBConfig {
	// Get mode
	c := dbConfig{
		Mode: getMotrMode(),
	}

	// Get common DB config
	dbComm, _ := sql.Open("d1", commonDBName)
	dbRes, _ := sql.Open("d1", resolverDBName)
	dbCont, _ := sql.Open("d1", vaultDBName)

	// Set DBs
	c.CommonDB = dbComm
	c.ResolverDB = dbRes
	c.VaultDB = dbCont
	return c
}

func getMotrMode() MotrMode {
	mode := cloudflare.Getenv("MOTR_MODE")
	if mode == "" {
		return ControllerMode
	}
	return MotrMode(mode)
}
