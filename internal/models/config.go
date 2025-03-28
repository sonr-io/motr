package models

type Config struct {
	MotrToken      string `json:"motrToken"`
	MotrAddress    string `json:"motrAddress"`
	IpfsGatewayURL string `json:"ipfsGatewayUrl"`
	SonrAPIURL     string `json:"sonrApiUrl"`
	SonrRPCURL     string `json:"sonrRpcUrl"`
	SonrChainID    string `json:"sonrChainId"`
}
