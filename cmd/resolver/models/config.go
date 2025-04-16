package models

// MotrConfig is the configuration for the Motr application assumed to be in the same directory as the dwn index
type ResolverConfig struct {
	CID        string `json:"cid"`
	Address    string `json:"address"`
	GatewayURL string `json:"gateway_url"`
	APIURL     string `json:"api_url"`
	RPCURL     string `json:"rpc_url"`
	ChainID    string `json:"chain_id"`
	Version    string `json:"version"`
}
