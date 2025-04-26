package app

import "errors"

func newError(msg string) error {
	return errors.New(msg)
}

var (
	ErrInvalidMode = newError("invalid mode")
	ErrDBNotFound  = newError("db not found")
)
