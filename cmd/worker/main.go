//go:build js && wasm
// +build js,wasm

package main

import (
	"context"
	"fmt"
	"net/http"

	"github.com/labstack/echo/v4"
	"github.com/sonr-io/motr/config"
	"github.com/sonr-io/motr/middleware/database"
	"github.com/sonr-io/motr/middleware/kvstore"
	"github.com/sonr-io/motr/middleware/session"
	"github.com/sonr-io/motr/middleware/webauthn"
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
	e.Use(
		session.Middleware(),
		database.Middleware(),
		kvstore.Middleware(),
		webauthn.Middleware(),
	)
	config.RegisterViews(e)
	config.RegisterPartials(e)
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
	cron.ScheduleTaskNonBlock(t)
	workers.ServeNonBlock(e)
	workers.Ready()

	// Block until handler/task is done
	select {
	case <-workers.Done():
	case <-cron.Done():
	}
}
