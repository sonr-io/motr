package fmtr

import "fmt"

func Float64ToPercent(value float64) string {
	return fmt.Sprintf("%.2f%%", value)
}
