package config

type Config struct {
	// TODO
	MotrToken      string `json:"motr_token"`
	MotrAddress    string `json:"motr_address"`
	IpfsGatewayURL string `json:"ipfs_gateway_url"`
	SonrAPIURL     string `json:"sonr_api_url"`
	SonrRPCURL     string `json:"sonr_rpc_url"`
	SonrChainID    string `json:"sonr_chain_id"`
}
