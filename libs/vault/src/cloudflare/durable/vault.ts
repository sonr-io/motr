/**
 * VaultDurable - Durable Object for Vault WASM HTTP Server
 *
 * Each instance represents an isolated vault running the Go WASM HTTP server.
 * Provides payment processing and OIDC authentication capabilities.
 */

// Import WASM module and runtime
// These will be bundled by Wrangler
// @ts-expect-error - WASM module is built during compilation
import wasmModule from "../../../dist/vault.wasm";
import wasmExecScript from "../../../wasm_exec.js?raw";

export interface VaultState {
  initialized: boolean;
  vaultId: string;
  createdAt: number;
  lastAccessedAt: number;
}

/**
 * VaultDurable - Durable Object managing a WASM-based vault instance
 */
export class VaultDurable implements DurableObject {
  private state: DurableObjectState;
  private vaultId: string;
  private wasmInstance: WebAssembly.Instance | null = null;
  private wasmReady = false;
  private initializationPromise: Promise<void> | null = null;

  constructor(state: DurableObjectState, _env: unknown) {
    this.state = state;
    // Extract vault ID from the Durable Object ID
    this.vaultId = state.id.toString();

    // Block concurrent executions until constructor completes
    this.state.blockConcurrencyWhile(async () => {
      await this.initialize();
    });
  }

  /**
   * Initialize the WASM module
   */
  private async initialize(): Promise<void> {
    // Return existing initialization if already in progress
    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    // Check if already initialized
    if (this.wasmReady) {
      return;
    }

    this.initializationPromise = this.loadWasm();
    await this.initializationPromise;
  }

  /**
   * Load and instantiate the Go WASM module
   */
  private async loadWasm(): Promise<void> {
    try {
      console.log(`[VaultDurable:${this.vaultId}] Loading WASM module...`);

      // Initialize Go runtime
      // Note: We need to evaluate the wasm_exec.js script in the global scope
      // This is a bit tricky in Workers - we'll use a Function constructor
      const initGo = new Function(wasmExecScript);
      initGo();

      // @ts-expect-error - Go is defined by wasm_exec.js
      const go = new globalThis.Go();

      // Instantiate WASM module with Go imports
      const instance = await WebAssembly.instantiate(
        wasmModule,
        go.importObject,
      );

      this.wasmInstance = instance;

      // Run the Go program (starts the HTTP server)
      // Don't await - it runs indefinitely
      go.run(instance);

      this.wasmReady = true;

      // Store initialization state
      await this.state.storage.put<VaultState>("state", {
        initialized: true,
        vaultId: this.vaultId,
        createdAt: Date.now(),
        lastAccessedAt: Date.now(),
      });

      console.log(
        `[VaultDurable:${this.vaultId}] WASM initialized successfully`,
      );
    } catch (error) {
      console.error(
        `[VaultDurable:${this.vaultId}] Failed to initialize WASM:`,
        error,
      );
      this.wasmReady = false;
      throw error;
    }
  }

  /**
   * Handle HTTP requests
   */
  async fetch(request: Request): Promise<Response> {
    // Update last accessed time
    const state = await this.state.storage.get<VaultState>("state");
    if (state) {
      state.lastAccessedAt = Date.now();
      await this.state.storage.put("state", state);
    }

    // Ensure WASM is initialized
    if (!this.wasmReady) {
      await this.initialize();
    }

    // If still not ready, return error
    if (!this.wasmReady) {
      return Response.json(
        {
          error: "Vault not ready",
          message: "WASM module failed to initialize",
        },
        { status: 503 },
      );
    }

    try {
      const url = new URL(request.url);
      const path = url.pathname.replace(/^\/vault\//, "/");

      console.log(
        `[VaultDurable:${this.vaultId}] Handling: ${request.method} ${path}`,
      );

      // Handle requests based on path
      // The Go WASM HTTP server should handle these routes
      // For now, we'll proxy the request to the WASM server via fetch

      // Note: In a real implementation, we need to integrate with the Go WASM HTTP server
      // The wasm-http-server library intercepts fetch() calls
      // So we can just make a fetch request and it will be handled by Go

      const wasmRequest = new Request(`http://vault${path}${url.search}`, {
        method: request.method,
        headers: request.headers,
        body: request.body,
      });

      // This fetch will be intercepted by the Go WASM HTTP server
      const response = await fetch(wasmRequest);

      return response;
    } catch (error) {
      console.error(`[VaultDurable:${this.vaultId}] Request error:`, error);
      return Response.json(
        {
          error: "Request failed",
          message: error instanceof Error ? error.message : "Unknown error",
        },
        { status: 500 },
      );
    }
  }

  /**
   * Handle alarms (for periodic tasks)
   */
  async alarm(): Promise<void> {
    console.log(`[VaultDurable:${this.vaultId}] Alarm triggered`);
    // Could be used for cleanup, state sync, etc.
  }

  /**
   * Handle WebSocket connections
   */
  async webSocketMessage(
    ws: WebSocket,
    message: string | ArrayBuffer,
  ): Promise<void> {
    console.log(`[VaultDurable:${this.vaultId}] WebSocket message:`, message);
    // Could be used for real-time payment updates, etc.
  }

  async webSocketClose(
    ws: WebSocket,
    code: number,
    reason: string,
    wasClean: boolean,
  ): Promise<void> {
    console.log(
      `[VaultDurable:${this.vaultId}] WebSocket closed:`,
      code,
      reason,
      wasClean,
    );
  }
}
