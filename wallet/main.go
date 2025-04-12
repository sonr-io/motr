package main

import (
	"github.com/extism/go-pdk"
)

//go:wasmexport greet
func greet() int32 {
	input := pdk.Input()
	greeting := `Hello, ` + string(input) + `!`
	pdk.OutputString(greeting)
	return 0
}
