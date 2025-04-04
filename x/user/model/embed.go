package model

import _ "embed"

//go:embed query.sql
var Query string

//go:embed schema.sql
var Schema string
