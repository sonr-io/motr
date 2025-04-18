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
	if c.Mode != ControllerMode {
		panic(ErrInvalidMode)
	}
	if c.VaultDB == nil {
		panic(ErrDBNotFound)
	}
	return vault.New(c.VaultDB)
}

func (c dbConfig) GetResolver() *resolver.Queries {
	if c.Mode != ResolverMode {
		panic(ErrInvalidMode)
	}
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

func connectDBs() (DBConfig, error) {
	c := dbConfig{
		Mode: getMotrMode(),
	}
	// Get common DB config
	dbComm, err := sql.Open("d1", commonDBName)
	if err != nil {
		return nil, err
	}
	c.CommonDB = dbComm

	// Get specific DB config based on mode
	switch c.Mode {
	case ControllerMode:
		dbCont, err := sql.Open("d1", vaultDBName)
		if err != nil {
			return nil, err
		}
		c.VaultDB = dbCont
		return c, nil
	case ResolverMode:
		dbRes, err := sql.Open("d1", resolverDBName)
		if err != nil {
			return nil, err
		}
		c.ResolverDB = dbRes
		return c, nil
	}
	return c, nil
}

func getMotrMode() MotrMode {
	mode := cloudflare.Getenv("MOTR_MODE")
	if mode == "" {
		return ControllerMode
	}
	return MotrMode(mode)
}
