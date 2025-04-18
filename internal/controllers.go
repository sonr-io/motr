//go:build js && wasm
// +build js,wasm

package internal

import (
	"github.com/sonr-io/motr/config"
	"github.com/sonr-io/motr/sink/models/common"
	"github.com/sonr-io/motr/sink/models/resolver"
	"github.com/sonr-io/motr/sink/models/vault"
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

type controller struct {
	common   common.Querier
	resolver resolver.Querier
	vault    vault.Querier
}

func (c controller) Common() common.Querier {
	return c.common
}

func (c controller) Resolver() resolver.Querier {
	return c.resolver
}

func (c controller) Vault() vault.Querier {
	return c.vault
}

func NewVaultController(c config.DBConfig) (VaultController, error) {
	cdb, err := c.GetVault()
	if err != nil {
		return nil, err
	}
	vdb, err := c.GetVault()
	if err != nil {
		return nil, err
	}
	return controller{
		common: common.New(cdb),
		vault:  vault.New(vdb),
	}, nil
}

func NewResolverController(c config.DBConfig) (ResolverController, error) {
	cdb, err := c.GetResolver()
	if err != nil {
		return nil, err
	}
	rdb, err := c.GetResolver()
	if err != nil {
		return nil, err
	}
	return controller{
		common:   common.New(cdb),
		resolver: resolver.New(rdb),
	}, nil
}
