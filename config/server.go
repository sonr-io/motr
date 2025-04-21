//go:build js && wasm
// +build js,wasm

package config

import (
	"github.com/labstack/echo/v4"
	"github.com/syumai/workers"
)

// Server is a wrapper around the Echo server
type Server struct {
	echo   *echo.Echo
	Config Config
}

// New creates a new server
func New() (*Server, Config) {
	c := getConfig()
	s := &Server{
		echo:   echo.New(),
		Config: c,
	}
	return s, c
}

// Use registers a middleware
func (s *Server) Use(middleware ...echo.MiddlewareFunc) {
	s.echo.Use(middleware...)
}

// GET registers a route that matches GET requests
func (s *Server) GET(path string, handler echo.HandlerFunc) {
	s.echo.GET(path, handler)
}

// POST registers a route that matches POST requests
func (s *Server) POST(path string, handler echo.HandlerFunc) {
	s.echo.POST(path, handler)
}

// PUT registers a route that matches PUT requests
func (s *Server) PUT(path string, handler echo.HandlerFunc) {
	s.echo.PUT(path, handler)
}

// DELETE registers a route that matches DELETE requests
func (s *Server) DELETE(path string, handler echo.HandlerFunc) {
	s.echo.DELETE(path, handler)
}

// PATCH registers a route that matches PATCH requests
func (s *Server) PATCH(path string, handler echo.HandlerFunc) {
	s.echo.PATCH(path, handler)
}

// HEAD registers a route that matches HEAD requests
func (s *Server) HEAD(path string, handler echo.HandlerFunc) {
	s.echo.HEAD(path, handler)
}

// OPTIONS registers a route that matches OPTIONS requests
func (s *Server) OPTIONS(path string, handler echo.HandlerFunc) {
	s.echo.OPTIONS(path, handler)
}

// Any registers a route that matches all the HTTP methods
func (s *Server) Any(path string, handler echo.HandlerFunc) {
	s.echo.Any(path, handler)
}

// File serves files from the given file system root
func (s *Server) File(path string, file string) {
	s.echo.File(path, file)
}

// Static serves static files from the given root directory
func (s *Server) Static(path string, root string) {
	s.echo.Static(path, root)
}

// Serve starts the server
func (s *Server) Serve() {
	workers.Serve(s.echo)
}
