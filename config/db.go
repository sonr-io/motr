//go:build js && wasm
// +build js,wasm

package config

import (
	"database/sql"

	"github.com/sonr-io/motr/sink/models/common"
	"github.com/sonr-io/motr/sink/models/controller"
	"github.com/sonr-io/motr/sink/models/resolver"
	"github.com/syumai/workers/cloudflare"
	_ "github.com/syumai/workers/cloudflare/d1"
)

const (
	commonDBName     = "CommonDB"
	controllerDBName = "ControllerDB"
	resolverDBName   = "ResolverDB"
)

type DBConfig interface {
	GetCommon() *common.Queries
	GetController() *controller.Queries
	GetResolver() *resolver.Queries
}

func (c dbConfig) GetCommon() *common.Queries {
	return common.New(c.CommonDB)
}

func (c dbConfig) GetController() *controller.Queries {
	if c.Mode != ControllerMode {
		panic(ErrInvalidMode)
	}
	if c.Controller == nil {
		panic(ErrDBNotFound)
	}
	return controller.New(c.Controller)
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
	Controller *sql.DB
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
		dbCont, err := sql.Open("d1", controllerDBName)
		if err != nil {
			return nil, err
		}
		c.Controller = dbCont
		return c, nil
	case ResolverMode:
		dbRes, err := sql.Open("d1", resolverDBName)
		if err != nil {
			return nil, err
		}
		c.ResolverDB = dbRes
		return c, nil
	default:
		return nil, newError("unknown mode")
	}
}

func getMotrMode() MotrMode {
	mode := cloudflare.Getenv("MOTR_MODE")
	if mode == "" {
		return ControllerMode
	}
	return MotrMode(mode)
}
