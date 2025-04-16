FROM golang:1.24.2
WORKDIR /app

# Install Node.js and Bun
RUN apt-get update && apt-get install -y \
    curl \
    unzip \
    && curl -fsSL https://deb.nodesource.com/setup_current.x | bash - \
    && apt-get install -y nodejs \
    && curl -fsSL https://bun.sh/install | bash \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Add Bun to PATH
ENV PATH="/root/.bun/bin:${PATH}"

# Install templ
RUN go install github.com/a-h/templ/cmd/templ@latest

# Install workers-assets-gen
RUN go install github.com/syumai/workers/cmd/workers-assets-gen@latest

# Copy project files
COPY . .

# Build commands
CMD ["bun", "x", "wrangler", "dev"]
