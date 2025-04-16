package vault

import "github.com/labstack/echo/v4"

// UseMiddleware is a middleware that adds a new key to the context
func UseMiddleware(c Config) echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			return next(c)
		}
	}
}
