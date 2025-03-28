package embed

// motr "github.com/onsonr/motr/pkg/config"

const SchemaVersion = 1

const (
	AppManifestFileName   = "app.webmanifest"
	DWNConfigFileName     = "dwn.json"
	IndexHTMLFileName     = "index.html"
	MainJSFileName        = "main.js"
	ServiceWorkerFileName = "sw.js"
)

// // spawnVaultDirectory creates a new directory with the default files
//
//	func NewVaultFS(cfg *Config) (files.Directory, error) {
//		manifestBz, err := NewWebManifest()
//		if err != nil {
//			return nil, err
//		}
//		cnfBz, err := json.Marshal(cfg)
//		if err != nil {
//			return nil, err
//		}
//		return files.NewMapDirectory(map[string]files.Node{
//			AppManifestFileName:   files.NewBytesFile(manifestBz),
//			DWNConfigFileName:     files.NewBytesFile(cnfBz),
//			IndexHTMLFileName:     files.NewBytesFile(IndexHTML),
//			MainJSFileName:        files.NewBytesFile(MainJS),
//			ServiceWorkerFileName: files.NewBytesFile(WorkerJS),
//		}), nil
//	}
//
// NewVaultConfig returns the default vault config
func NewVaultConfig(addr string, ucanCID string) *Config {
	return &Config{
		MotrToken:      ucanCID,
		MotrAddress:    addr,
		IpfsGatewayURL: "http://localhost:80",
		SonrAPIURL:     "http://localhost:1317",
		SonrRPCURL:     "http://localhost:26657",
		SonrChainID:    "sonr-testnet-1",
	}
}

type Config struct {
	MotrToken      string `json:"motrToken"`
	MotrAddress    string `json:"motrAddress"`
	IpfsGatewayURL string `json:"ipfsGatewayUrl"`
	SonrAPIURL     string `json:"sonrApiUrl"`
	SonrRPCURL     string `json:"sonrRpcUrl"`
	SonrChainID    string `json:"sonrChainId"`
}
