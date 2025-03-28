package embed

import (
	"encoding/json"
	"reflect"
	"strings"

	_ "embed"

	"github.com/onsonr/motr/pkg/types"
)

//go:embed index.html
var IndexHTML []byte

//go:embed main.js
var MainJS []byte

//go:embed sw.js
var WorkerJS []byte

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
func NewVaultConfig(addr string, ucanCID string) *types.Config {
	return &types.Config{
		MotrToken:      ucanCID,
		MotrAddress:    addr,
		IpfsGatewayURL: "http://localhost:80",
		SonrAPIURL:     "http://localhost:1317",
		SonrRPCURL:     "http://localhost:26657",
		SonrChainID:    "sonr-testnet-1",
	}
}

func NewWebManifest() ([]byte, error) {
	return json.Marshal(baseWebManifest)
}

var baseWebManifest = types.WebManifest{
	Name:      "Sonr Vault",
	ShortName: "Sonr.ID",
	StartURL:  "/index.html",
	Display:   "standalone",
	DisplayOverride: []string{
		"fullscreen",
		"minimal-ui",
	},
	Icons: []types.IconDefinition{
		{
			Src:   "/icons/icon-192x192.png",
			Sizes: "192x192",
			Type:  "image/png",
		},
	},
	ServiceWorker: types.ServiceWorker{
		Scope:    "/",
		Src:      "/sw.js",
		UseCache: true,
	},
	ProtocolHandlers: []types.ProtocolHandler{
		{
			Scheme: "did.sonr",
			URL:    "/resolve/sonr/%s",
		},
		{
			Scheme: "did.eth",
			URL:    "/resolve/eth/%s",
		},
		{
			Scheme: "did.btc",
			URL:    "/resolve/btc/%s",
		},
		{
			Scheme: "did.usdc",
			URL:    "/resolve/usdc/%s",
		},
		{
			Scheme: "did.ipfs",
			URL:    "/resolve/ipfs/%s",
		},
	},
}

func getSchema(structType interface{}) string {
	t := reflect.TypeOf(structType)
	if t.Kind() == reflect.Ptr {
		t = t.Elem()
	}

	if t.Kind() != reflect.Struct {
		return ""
	}

	var fields []string
	for i := 0; i < t.NumField(); i++ {
		field := t.Field(i)
		fieldName := toCamelCase(field.Name)
		fields = append(fields, fieldName)
	}

	// Add "++" at the beginning, separated by a comma
	return "++, " + strings.Join(fields, ", ")
}

func toCamelCase(s string) string {
	if s == "" {
		return s
	}
	if len(s) == 1 {
		return strings.ToLower(s)
	}
	return strings.ToLower(s[:1]) + s[1:]
}
