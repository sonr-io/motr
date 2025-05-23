// Code generated by templ - DO NOT EDIT.

// templ: version: v0.3.865
package charts

//lint:file-ignore SA4006 This context is only used if a nested component is present.

import "github.com/a-h/templ"
import templruntime "github.com/a-h/templ/runtime"

import (
	"encoding/json"
	"time"
)

type CandleData struct {
	Open  float64
	Close float64
	High  float64
	Low   float64
	Date  time.Time
}

// D3 script handle for deduplication
var d3Handle = templ.NewOnceHandle()

// D3 component for loading D3.js
func D3() templ.Component {
	return templruntime.GeneratedTemplate(func(templ_7745c5c3_Input templruntime.GeneratedComponentInput) (templ_7745c5c3_Err error) {
		templ_7745c5c3_W, ctx := templ_7745c5c3_Input.Writer, templ_7745c5c3_Input.Context
		if templ_7745c5c3_CtxErr := ctx.Err(); templ_7745c5c3_CtxErr != nil {
			return templ_7745c5c3_CtxErr
		}
		templ_7745c5c3_Buffer, templ_7745c5c3_IsBuffer := templruntime.GetBuffer(templ_7745c5c3_W)
		if !templ_7745c5c3_IsBuffer {
			defer func() {
				templ_7745c5c3_BufErr := templruntime.ReleaseBuffer(templ_7745c5c3_Buffer)
				if templ_7745c5c3_Err == nil {
					templ_7745c5c3_Err = templ_7745c5c3_BufErr
				}
			}()
		}
		ctx = templ.InitializeContext(ctx)
		templ_7745c5c3_Var1 := templ.GetChildren(ctx)
		if templ_7745c5c3_Var1 == nil {
			templ_7745c5c3_Var1 = templ.NopComponent
		}
		ctx = templ.ClearChildren(ctx)
		templ_7745c5c3_Var2 := templruntime.GeneratedTemplate(func(templ_7745c5c3_Input templruntime.GeneratedComponentInput) (templ_7745c5c3_Err error) {
			templ_7745c5c3_W, ctx := templ_7745c5c3_Input.Writer, templ_7745c5c3_Input.Context
			templ_7745c5c3_Buffer, templ_7745c5c3_IsBuffer := templruntime.GetBuffer(templ_7745c5c3_W)
			if !templ_7745c5c3_IsBuffer {
				defer func() {
					templ_7745c5c3_BufErr := templruntime.ReleaseBuffer(templ_7745c5c3_Buffer)
					if templ_7745c5c3_Err == nil {
						templ_7745c5c3_Err = templ_7745c5c3_BufErr
					}
				}()
			}
			ctx = templ.InitializeContext(ctx)
			templ_7745c5c3_Err = templruntime.WriteString(templ_7745c5c3_Buffer, 1, "<script type=\"module\">\n       \n            window.d3 = d3;\n        </script>")
			if templ_7745c5c3_Err != nil {
				return templ_7745c5c3_Err
			}
			return nil
		})
		templ_7745c5c3_Err = d3Handle.Once().Render(templ.WithChildren(ctx, templ_7745c5c3_Var2), templ_7745c5c3_Buffer)
		if templ_7745c5c3_Err != nil {
			return templ_7745c5c3_Err
		}
		return nil
	})
}

// CandleChart component
func CandleChart(data []CandleData) templ.Component {
	return templruntime.GeneratedTemplate(func(templ_7745c5c3_Input templruntime.GeneratedComponentInput) (templ_7745c5c3_Err error) {
		templ_7745c5c3_W, ctx := templ_7745c5c3_Input.Writer, templ_7745c5c3_Input.Context
		if templ_7745c5c3_CtxErr := ctx.Err(); templ_7745c5c3_CtxErr != nil {
			return templ_7745c5c3_CtxErr
		}
		templ_7745c5c3_Buffer, templ_7745c5c3_IsBuffer := templruntime.GetBuffer(templ_7745c5c3_W)
		if !templ_7745c5c3_IsBuffer {
			defer func() {
				templ_7745c5c3_BufErr := templruntime.ReleaseBuffer(templ_7745c5c3_Buffer)
				if templ_7745c5c3_Err == nil {
					templ_7745c5c3_Err = templ_7745c5c3_BufErr
				}
			}()
		}
		ctx = templ.InitializeContext(ctx)
		templ_7745c5c3_Var3 := templ.GetChildren(ctx)
		if templ_7745c5c3_Var3 == nil {
			templ_7745c5c3_Var3 = templ.NopComponent
		}
		ctx = templ.ClearChildren(ctx)
		templ_7745c5c3_Err = D3().Render(ctx, templ_7745c5c3_Buffer)
		if templ_7745c5c3_Err != nil {
			return templ_7745c5c3_Err
		}
		templ_7745c5c3_Err = templruntime.WriteString(templ_7745c5c3_Buffer, 2, "<div id=\"candleChart\" class=\"@container relative\"><div class=\"relative h-72 w-full\" style=\"--marginTop: 10px; --marginRight: 60px; --marginBottom: 56px; --marginLeft: 30px;\"></div></div><script type=\"module\">\n\t     import * as d3 from \"https://cdn.jsdelivr.net/npm/d3@7/+esm\";\n        // Convert Go data to JavaScript\n            \n        // Declare the chart dimensions and margins.\n        const width = 640;\n        const height = 400;\n        const marginTop = 20;\n        const marginRight = 20;\n        const marginBottom = 30;\n        const marginLeft = 40;\n\n        // Declare the x (horizontal position) scale.\n        const x = d3.scaleUtc()\n            .domain([new Date(\"2023-01-01\"), new Date(\"2024-01-01\")])\n            .range([marginLeft, width - marginRight]);\n\n        // Declare the y (vertical position) scale.\n        const y = d3.scaleLinear()\n            .domain([0, 100])\n            .range([height - marginBottom, marginTop]);\n\n        // Create the SVG container.\n        const svg = d3.create(\"svg\")\n            .attr(\"width\", width)\n            .attr(\"height\", height);\n\n        // Add the x-axis.\n        svg.append(\"g\")\n            .attr(\"transform\", `translate(0,${height - marginBottom})`)\n            .call(d3.axisBottom(x));\n\n        // Add the y-axis.\n        svg.append(\"g\")\n            .attr(\"transform\", `translate(${marginLeft},0)`)\n            .call(d3.axisLeft(y));\n\n        // Append the SVG element.\n        container.append(svg.node());    \n    </script>")
		if templ_7745c5c3_Err != nil {
			return templ_7745c5c3_Err
		}
		return nil
	})
}

// formatDataForJS converts the Go data structure to a JavaScript-compatible JSON string
func formatDataForJS(data []CandleData) string {
	type jsData struct {
		Date  string  `json:"date"`
		Open  float64 `json:"open"`
		Close float64 `json:"close"`
		High  float64 `json:"high"`
		Low   float64 `json:"low"`
	}

	jsDataArray := make([]jsData, len(data))
	for i, d := range data {
		jsDataArray[i] = jsData{
			Date:  d.Date.Format(time.RFC3339),
			Open:  d.Open,
			Close: d.Close,
			High:  d.High,
			Low:   d.Low,
		}
	}

	jsonBytes, err := json.Marshal(jsDataArray)
	if err != nil {
		return "[]"
	}
	return string(jsonBytes)
}

var _ = templruntime.GeneratedTemplate
