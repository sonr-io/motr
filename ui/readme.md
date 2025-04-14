# Nebula UI Components

A comprehensive library of Golang [Templ](https://templ.guide/) components for building modern, type-safe web applications with a focus on blockchain interfaces.

## Overview

The Nebula UI library provides a collection of reusable, accessible, and type-safe components designed to work seamlessly with Go's server-side rendering. Built with Templ, these components offer strong typing and efficient rendering for web applications.

## Installation

```bash
go get github.com/sonr-io/nebula/ui
```

## Usage

Import components directly from their respective packages:

```go
import (
    "github.com/sonr-io/nebula/ui/cards"
    "github.com/sonr-io/nebula/ui/inputs"
    // other component categories
)

// In your HTTP handler
func handler(w http.ResponseWriter, r *http.Request) {
    // Example using AccountCard
    card := cards.AccountCard(cards.AccountCardData{
        Address: "sonr1abcd...",
        Name: "User Name",
        Handle: "@handle",
        Block: "42069"
    })
    
    // Render the component
    card.Render(r.Context(), w)
}
```

## Component Categories

### Cards

Display content in boxed card layouts.

| Component | Description | Props |
|-----------|-------------|-------|
| `AccountCard` | Displays account information | `Address`, `Name`, `Handle`, `Block` |

### Inputs

Form input components for user interaction.

| Component | Description | Props |
|-----------|-------------|-------|
| `HandleInput` | Input field for user handles | `State`, `Placeholder`, `Value` |

### Layouts

Components for page and content structure.

| Component | Description | Props |
|-----------|-------------|-------|
| `Container` | Basic container with padding | `Width`, `MaxWidth` |
| `Grid` | Responsive grid layout | `Columns`, `Gap` |
| `Stack` | Vertical or horizontal stack | `Direction`, `Gap`, `Align` |

### Navigation

Components for site navigation.

| Component | Description | Props |
|-----------|-------------|-------|
| `Navbar` | Top navigation bar | `Title`, `Links` |
| `Sidebar` | Side navigation panel | `Items`, `Collapsed` |
| `TabGroup` | Tab-based navigation | `Tabs`, `ActiveTab` |

### Feedback

Components for user feedback.

| Component | Description | Props |
|-----------|-------------|-------|
| `Alert` | Contextual feedback messages | `Type`, `Message` |
| `Toast` | Temporary notifications | `Type`, `Message`, `Duration` |
| `Progress` | Progress indicators | `Value`, `Max`, `ShowLabel` |

### Data Display

Components for displaying data.

| Component | Description | Props |
|-----------|-------------|-------|
| `Table` | Data tables | `Headers`, `Rows` |
| `List` | Ordered and unordered lists | `Items`, `Ordered` |
| `Tag` | Label elements | `Label`, `Color` |

## Development

### Prerequisites

- Go 1.21+
- Templ CLI

### Generating Components

After modifying `.templ` files, generate the Go code:

```bash
templ generate
```

### Testing

```bash
go test ./...
```

## License

MIT License
