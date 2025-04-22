package types

type LoginOptions struct {
	Account            string
	Handle             string
	Challenge          string
	AllowedCredentials []*CredentialDescriptor
}

type RegisterOptions struct {
	Address   string
	Handle    string
	Challenge string
}
