//go:build js && wasm
// +build js,wasm

package database

import (
	"github.com/sonr-io/motr/config"
	"github.com/sonr-io/motr/sink/models/common"
	"github.com/sonr-io/motr/sink/models/resolver"
	"github.com/sonr-io/motr/sink/models/vault"
	_ "github.com/syumai/workers/cloudflare/d1"
)

type Controller interface {
	Common() common.Querier
}

type VaultController interface {
	Controller
	Vault() vault.Querier
}

type ResolverController interface {
	Controller
	Resolver() resolver.Querier
}

type ControllerImpl struct {
	CommonDB   common.Querier
	ResolverDB resolver.Querier
	VaultDB    vault.Querier
}

func (c *ControllerImpl) Common() common.Querier {
	return c.CommonDB
}

func (c *ControllerImpl) Resolver() resolver.Querier {
	return c.ResolverDB
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

func NewResolverController(c config.DBConfig) (ResolverController, error) {
	cdb, err := c.GetCommon()
	if err != nil {
		return nil, err
	}
	rdb, err := c.GetResolver()
	if err != nil {
		return nil, err
	}
	return &ControllerImpl{
		CommonDB:   common.New(cdb),
		ResolverDB: resolver.New(rdb),
	}, nil
}

// NewFullController creates a controller with connections to all databases
func NewFullController(c config.DBConfig) (*ControllerImpl, error) {
	// Get common DB
	cdb, err := c.GetCommon()
	if err != nil {
		return nil, err
	}

	// Get resolver DB
	rdb, err := c.GetResolver()
	if err != nil {
		return nil, err
	}

	// Get vault DB
	vdb, err := c.GetVault()
	if err != nil {
		return nil, err
	}

	return &ControllerImpl{
		CommonDB:   common.New(cdb),
		ResolverDB: resolver.New(rdb),
		VaultDB:    vault.New(vdb),
	}, nil
}
