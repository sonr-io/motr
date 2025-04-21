//go:build js && wasm
// +build js,wasm

package database

import (
	"database/sql"

	"github.com/sonr-io/motr/config"
	"github.com/sonr-io/motr/sink/models/common"
	"github.com/sonr-io/motr/sink/models/vault"
	_ "github.com/syumai/workers/cloudflare/d1"
)

type (
	CommonQueries *common.Queries
	VaultQueries  *vault.Queries
)

func NewCommonQueries(db *sql.DB) CommonQueries {
	return common.New(db)
}

func NewVaultQueries(db *sql.DB) VaultQueries {
	return vault.New(db)
}

type Controller interface {
	Common() common.Querier
}

type VaultController interface {
	Controller
	Vault() vault.Querier
}

type ControllerImpl struct {
	CommonDB common.Querier
	VaultDB  vault.Querier
}

func (c *ControllerImpl) Common() common.Querier {
	return c.CommonDB
}

func (c *ControllerImpl) Vault() vault.Querier {
	return c.VaultDB
}

func NewVaultController(c config.DBConfig) (VaultController, error) {
	cdb, err := c.GetCommon()
	if err != nil {
		return nil, err
	}
	vdb, err := c.GetVault()
	if err != nil {
		return nil, err
	}
	return &ControllerImpl{
		CommonDB: common.New(cdb),
		VaultDB:  vault.New(vdb),
	}, nil
}
