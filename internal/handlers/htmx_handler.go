package handlers

import (
	"github.com/labstack/echo/v4"
)

// StatusCheck is a struct that represents the status of the application
type StatusCheck struct {
	Ok       bool `json:"ok"`
	Services []struct {
		Name string `json:"name"`
		Ok   bool   `json:"ok"`
	} `json:"services"`
}

// HandleStatusCheck is a handler that checks the status of the application
func HandleStatusCheck(c echo.Context) error {
	return c.JSON(200, StatusCheck{
		Ok: true,
		Services: []struct {
			Name string `json:"name"`
			Ok   bool   `json:"ok"`
		}{
			{
				Name: "IPFS",
				Ok:   true,
			},
			{
				Name: "IBC",
				Ok:   true,
			},
			{
				Name: "Sonr",
				Ok:   true,
			},
		},
	})
}
