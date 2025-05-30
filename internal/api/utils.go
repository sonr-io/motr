//go:build js && wasm
// +build js,wasm

package api

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/syumai/workers/cloudflare/fetch"
)

func buildRequest(c context.Context, url string) *fetch.Request {
	r, err := fetch.NewRequest(c, http.MethodGet, url, nil)
	if err != nil {
		fmt.Println(err)
		return nil
	}
	r.Header.Set("User-Agent", "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:109.0) Gecko/20100101 Firefox/111.0")
	return r
}

func doFetch(c *fetch.Client, r *fetch.Request, v Response) error {
	resp, err := c.Do(r, nil)
	if err != nil {
		return fmt.Errorf("request failed: %w", err)
	}
	defer resp.Body.Close() // Ensure body is always closed

	// Check for non-200 status codes
	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		return fmt.Errorf("unexpected status code: %d", resp.StatusCode)
	}

	// Directly decode JSON into the response struct
	if err := json.NewDecoder(resp.Body).Decode(v); err != nil {
		return fmt.Errorf("failed to decode response: %w", err)
	}

	return nil
}
