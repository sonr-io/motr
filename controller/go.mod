module github.com/sonr-io/motr/controller

go 1.24.2

require (
	github.com/a-h/templ v0.3.857
	github.com/labstack/echo/v4 v4.13.3
	github.com/sonr-io/motr/ui v0.0.0-20230706135626-f1c3f3a0a
	github.com/syumai/workers v0.30.2
)

replace github.com/sonr-io/motr/ui => ../ui

require (
	github.com/labstack/gommon v0.4.2 // indirect
	github.com/mattn/go-colorable v0.1.13 // indirect
	github.com/mattn/go-isatty v0.0.20 // indirect
	github.com/valyala/bytebufferpool v1.0.0 // indirect
	github.com/valyala/fasttemplate v1.2.2 // indirect
	golang.org/x/crypto v0.36.0 // indirect
	golang.org/x/net v0.37.0 // indirect
	golang.org/x/sys v0.31.0 // indirect
	golang.org/x/text v0.23.0 // indirect
)
