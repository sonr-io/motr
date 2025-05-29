//go:build js && wasm
// +build js,wasm

package main

import (
	"context"
	"fmt"
	"net/http"

	"github.com/labstack/echo/v4"
	"github.com/sonr-io/motr/middleware/database"
	"github.com/sonr-io/motr/middleware/session"
	"github.com/sonr-io/motr/middleware/sonrapi"
	"github.com/sonr-io/motr/middleware/webauthn"
	"github.com/sonr-io/motr/routes"
	"github.com/syumai/workers"
	"github.com/syumai/workers/cloudflare/cron"

	_ "github.com/syumai/workers/cloudflare/d1"
)

// ╭──────────────────────────────────────────────────╮
// │                  Initialization                  │
// ╰──────────────────────────────────────────────────╯

// Setup the HTTP handler
func loadHandler() http.Handler {
	e := echo.New()
	e.Use(session.Middleware(), database.Middleware(), sonrapi.Middleware(), webauthn.Middleware())
	routes.SetupViews(e)
	routes.SetupPartials(e)
	return e
}

// Setup the cron task
func loadTask() cron.Task {
	return func(ctx context.Context) error {
		e, err := cron.NewEvent(ctx)
		if err != nil {
			return err
		}
		fmt.Println(e.ScheduledTime.Unix())
		return nil
	}
}

// ╭─────────────────────────────────────────────────╮
// │                  Main Function                  │
// ╰─────────────────────────────────────────────────╯

func main() {
	// Setup CRON jobs
	e := loadHandler()
	t := loadTask()

	// Configure Worker
	workers.ServeNonBlock(e)
	cron.ScheduleTaskNonBlock(t)
	workers.Ready()

	// Block until handler/task is done
	select {
	case <-workers.Done():
	case <-cron.Done():
	}
}
