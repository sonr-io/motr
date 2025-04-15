# Build stage
FROM golang:1.21-alpine AS builder

# Install necessary dependencies
RUN apk add --no-cache nodejs npm git curl
RUN go install github.com/a-h/templ/cmd/templ@latest

# Install Earthly
RUN curl -fsSL https://github.com/earthly/earthly/releases/latest/download/earthly-linux-amd64 -o /usr/local/bin/earthly && \
    chmod +x /usr/local/bin/earthly

# Set up working directory
WORKDIR /app

# Copy go.mod and go.sum first for better caching
COPY go.mod go.sum* ./
RUN go mod download

# Copy package.json
COPY package.json package-lock.json* ./
RUN npm install

# Copy the rest of the source code
COPY . .

# Build the application
RUN npm run build

# Runtime stage
FROM alpine:latest

# Install necessary runtime dependencies
RUN apk add --no-cache ca-certificates

WORKDIR /app

# Copy built artifacts from the builder stage
COPY --from=builder /app/build /app/build

# Set the command to run the app
CMD ["./app"]
