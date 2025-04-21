//go:build js && wasm
// +build js,wasm

package server

import (
	"github.com/labstack/echo/v4"
	"github.com/sonr-io/motr/config"
	"github.com/sonr-io/motr/internal/middleware"
	"github.com/syumai/workers"
)

// Server is a wrapper around the Echo server
type Server struct {
	Echo   *echo.Echo
	Config config.Config
}

// New creates a new server
func New() *Server {
	s := &Server{
		Echo:   echo.New(),
		Config: config.GetConfig(),
	}
	s.Echo.Use(middleware.UseSession(s.Config))
	return s
}

// GET registers a route that matches GET requests
func (s *Server) GET(path string, handler echo.HandlerFunc) {
	s.Echo.GET(path, handler)
}

// POST registers a route that matches POST requests
func (s *Server) POST(path string, handler echo.HandlerFunc) {
	s.Echo.POST(path, handler)
}

// PUT registers a route that matches PUT requests
func (s *Server) PUT(path string, handler echo.HandlerFunc) {
	s.Echo.PUT(path, handler)
}

// DELETE registers a route that matches DELETE requests
func (s *Server) DELETE(path string, handler echo.HandlerFunc) {
	s.Echo.DELETE(path, handler)
}

// PATCH registers a route that matches PATCH requests
func (s *Server) PATCH(path string, handler echo.HandlerFunc) {
	s.Echo.PATCH(path, handler)
}

// HEAD registers a route that matches HEAD requests
func (s *Server) HEAD(path string, handler echo.HandlerFunc) {
	s.Echo.HEAD(path, handler)
}

// OPTIONS registers a route that matches OPTIONS requests
func (s *Server) OPTIONS(path string, handler echo.HandlerFunc) {
	s.Echo.OPTIONS(path, handler)
}

// Any registers a route that matches all the HTTP methods
func (s *Server) Any(path string, handler echo.HandlerFunc) {
	s.Echo.Any(path, handler)
}

// File serves files from the given file system root
func (s *Server) File(path string, file string) {
	s.Echo.File(path, file)
}

// Static serves static files from the given root directory
func (s *Server) Static(path string, root string) {
	s.Echo.Static(path, root)
}

// Serve starts the server
func (s *Server) Serve() {
	workers.Serve(s.Echo)
}

