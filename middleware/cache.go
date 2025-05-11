//go:build js && wasm
// +build js,wasm

package middleware

import (
	"bytes"
	"io"
	"net/http"
	"strconv"

	"github.com/labstack/echo/v4"
	"github.com/sonr-io/motr/sink/config"
	"github.com/syumai/workers/cloudflare"
	"github.com/syumai/workers/cloudflare/cache"
)

// CloudflareCache represents the middleware for Cloudflare cache
type CloudflareCache struct {
	// Config holds the cache configuration
	Config config.CacheConfig
	// CacheableStatusCodes are HTTP status codes that should be cached (map for faster lookups)
	CacheableStatusCodes map[int]bool
	// CacheableContentTypes are content types that should be cached (map for faster lookups)
	CacheableContentTypes map[string]bool
}

// UseCloudflareCache creates a new CloudflareCache middleware
func UseCloudflareCache(cfg config.Config) echo.MiddlewareFunc {
	// If cache is disabled, return a pass-through middleware
	if !cfg.Cache.Enabled {
		return func(next echo.HandlerFunc) echo.HandlerFunc {
			return func(c echo.Context) error {
				return next(c)
			}
		}
	}

	// Convert slice to map for faster lookups
	cacheableStatusCodes := make(map[int]bool)
	for _, code := range cfg.Cache.CacheableStatusCodes {
		cacheableStatusCodes[code] = true
	}

	cacheableContentTypes := make(map[string]bool)
	for _, contentType := range cfg.Cache.CacheableContentTypes {
		cacheableContentTypes[contentType] = true
	}

	cacheMiddleware := &CloudflareCache{
		Config:                cfg.Cache,
		CacheableStatusCodes:  cacheableStatusCodes,
		CacheableContentTypes: cacheableContentTypes,
	}

	return cacheMiddleware.Process
}

// responseWriter is a custom response writer that captures the response
type responseWriter struct {
	echo.Response
	body       *bytes.Buffer
	statusCode int
	headers    http.Header
}

// newResponseWriter creates a new responseWriter
func newResponseWriter(c echo.Context) *responseWriter {
	return &responseWriter{
		Response:   *c.Response(),
		body:       bytes.NewBuffer(nil),
		statusCode: http.StatusOK,
		headers:    make(http.Header),
	}
}

// Write captures the response body
func (rw *responseWriter) Write(b []byte) (int, error) {
	rw.body.Write(b)
	return rw.Response.Write(b)
}

// WriteHeader captures the status code
func (rw *responseWriter) WriteHeader(code int) {
	rw.statusCode = code
	rw.Response.WriteHeader(code)
}

// Header returns the response headers
func (rw *responseWriter) Header() http.Header {
	return rw.Response.Header()
}

// ToHTTPResponse converts the response writer to an HTTP response
func (rw *responseWriter) ToHTTPResponse() *http.Response {
	return &http.Response{
		StatusCode: rw.statusCode,
		Header:     rw.Header(),
		Body:       io.NopCloser(bytes.NewReader(rw.body.Bytes())),
	}
}

// shouldBypassCache determines if the cache should be bypassed
func (cc *CloudflareCache) shouldBypassCache(c echo.Context) bool {
	// Check if bypass header is present
	if c.Request().Header.Get(cc.Config.BypassHeader) == cc.Config.BypassValue {
		return true
	}

	// Only cache GET and HEAD requests
	if c.Request().Method != http.MethodGet && c.Request().Method != http.MethodHead {
		return true
	}

	return false
}

// isCacheable determines if the response is cacheable
func (cc *CloudflareCache) isCacheable(rw *responseWriter) bool {
	// Check if status code is cacheable
	if !cc.CacheableStatusCodes[rw.statusCode] {
		return false
	}

	// Check if content type is cacheable
	contentType := rw.Header().Get(echo.HeaderContentType)
	for cacheableType := range cc.CacheableContentTypes {
		if contentType == cacheableType || (len(contentType) >= len(cacheableType) && contentType[:len(cacheableType)] == cacheableType) {
			return true
		}
	}

	return false
}

// Process is the middleware function
func (cc *CloudflareCache) Process(next echo.HandlerFunc) echo.HandlerFunc {
	return func(c echo.Context) error {
		// Skip cache if needed
		if cc.shouldBypassCache(c) {
			return next(c)
		}

		// Create a new cache instance
		cacheInstance := cache.New()

		// Try to get from cache
		cachedResponse, err := cacheInstance.Match(c.Request(), nil)
		if err == nil && cachedResponse != nil {
			// Set the response status code
			c.Response().WriteHeader(cachedResponse.StatusCode)

			// Set the response headers
			for key, values := range cachedResponse.Header {
				for _, value := range values {
					c.Response().Header().Add(key, value)
				}
			}

			// Add a header to indicate cache hit
			c.Response().Header().Add("X-Cache", "HIT")

			// Copy the response body
			io.Copy(c.Response().Writer, cachedResponse.Body)

			return nil
		}

		// Create a custom response writer to capture the response
		rw := newResponseWriter(c)
		c.Response().Writer = rw

		// Process the request
		err = next(c)
		if err != nil {
			return err
		}

		// Check if response should be cached
		if !cc.isCacheable(rw) {
			return nil
		}

		// Ensure Cache-Control header is set if not already
		if rw.Header().Get(echo.HeaderCacheControl) == "" {
			rw.Header().Set(echo.HeaderCacheControl, "max-age="+strconv.Itoa(cc.Config.DefaultMaxAge))
		}

		// Add a header to indicate cache miss
		rw.Header().Add("X-Cache", "MISS")

		// Store in cache asynchronously using WaitUntil for Cloudflare Workers
		cloudflare.WaitUntil(func() {
			err := cacheInstance.Put(c.Request(), rw.ToHTTPResponse())
			if err != nil {
				// Log error if needed
				c.Logger().Errorf("Failed to store response in cache: %v", err)
			}
		})

		return nil
	}
}
