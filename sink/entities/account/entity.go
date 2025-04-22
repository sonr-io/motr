package account

import (
	"strconv"

	"github.com/a-h/templ"
	"github.com/sonr-io/motr/sink/models"
)

type AccountEntity interface {
	GetModel() models.Account
	GetCard(handle string) templ.Component
	ShortAddr() string
}

type AccountsEntity interface {
	GetModels() []models.Account
	GetList() templ.Component
	GetDropdown() templ.Component
}

func NewAccountEntity(account models.Account) AccountEntity {
	return &accountEntity{Account: account}
}

func NewAccountsEntity(accounts []models.Account) AccountsEntity {
	return &accountsEntity{Accounts: accounts}
}

type accountEntity struct {
	models.Account
}

func (a *accountEntity) ShortAddr() string {
	if len(a.Address) <= 20 {
		return a.Address
	}
	return a.Address[:16] + "..." + a.Address[len(a.Address)-4:]
}

func (a *accountEntity) GetModel() models.Account {
	return a.Account
}

func (a *accountEntity) GetCard(handle string) templ.Component {
	return cardComponent(handle, a.ShortAddr(), strconv.FormatInt(a.BlockCreated, 10), a.Label)
}

type accountsEntity struct {
	Accounts []models.Account
}

func (a *accountsEntity) GetModels() []models.Account {
	return a.Accounts
}

func (a *accountsEntity) GetList() templ.Component {
	return nil
}

func (a *accountsEntity) GetDropdown() templ.Component {
	return nil
}
