package vault

import "github.com/sonr-io/motr/controllers/credential"

type LoginOptions struct {
	Account            string
	Handle             string
	HelpText           string
	Label              string
	Challenge          string
	AllowedCredentials []*credential.CredentialDescriptor
}

type RegisterOptions struct {
	Address   string
	Handle    string
	Challenge string
}
