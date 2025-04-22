package vault

import "github.com/sonr-io/motr/sink/entities/credential"

type LoginOptions struct {
	Account            string
	Handle             string
	Challenge          string
	AllowedCredentials []*credential.CredentialDescriptor
}

type RegisterOptions struct {
	Address   string
	Handle    string
	Challenge string
}
