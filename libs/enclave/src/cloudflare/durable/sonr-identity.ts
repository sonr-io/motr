import { DurableObject } from 'cloudflare:workers';

/**
 * Direct imports from enclave modules
 * Using relative imports to avoid circular dependencies during build
 */
import { EnclaveWorkerClient } from '../../worker-client.js';
import type {
  GetIssuerDIDResponse,
  NewAttenuatedTokenRequest,
  NewOriginTokenRequest,
  SignDataRequest,
  SignDataResponse,
  StoredUCANToken,
  UCANTokenResponse,
  VerifyDataRequest,
  VerifyDataResponse,
} from '../../types';

/**
 * SonrIdentityDurable - Durable Object wrapping @sonr.io/enclave
 *
 * Provides a persistent, isolated connection to a Sonr identity via the
 * enclave's WebAssembly-based cryptographic vault. Each instance represents
 * a single Sonr identity with:
 *
 * - MPC-based key management
 * - UCAN token operations
 * - Signing and verification
 * - Persistent state across requests
 * - WebSocket support for real-time updates
 * - Automatic session management
 *
 * IMPORTANT: This Durable Object creates its OWN enclave instance per identity.
 * It is separate from any enclave instances created in the main application.
 * This design provides:
 * - Process isolation per identity
 * - Independent lifecycle management
 * - Persistent state per identity across worker restarts
 * - Global distribution via Cloudflare's network
 */
export class SonrIdentityDurable extends DurableObject {
  private enclave: EnclaveWorkerClient | null = null;
  private accountAddress: string | null = null;
  private isInitialized = false;
  private sessions: Set<WebSocket> = new Set();
  private initPromise: Promise<void> | null = null;

  // Static map to ensure singleton per identity within this DO instance
  private static readonly enclaveInstances = new Map<string, EnclaveWorkerClient>();

  constructor(ctx: DurableObjectState, env: any) {
    super(ctx, env);
    console.log('[SonrIdentityDurable] Instance created');

    // Initialize on first request
    this.ctx.blockConcurrencyWhile(async () => {
      const stored = await this.ctx.storage.get<{
        accountAddress: string;
        isInitialized: boolean;
      }>('identity-state');

      if (stored) {
        this.accountAddress = stored.accountAddress;
        this.isInitialized = stored.isInitialized;
        console.log('[SonrIdentityDurable] Restored state for account:', this.accountAddress);
      }
    });
  }

  /**
   * Handle HTTP requests to the Durable Object
   */
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    console.log(`[SonrIdentityDurable] Request: ${request.method} ${path}`);

    // Handle WebSocket upgrade requests
    if (request.headers.get('Upgrade') === 'websocket') {
      return this.handleWebSocket(request);
    }

    try {
      switch (path) {
        case '/initialize':
          return await this.handleInitialize(request);
        case '/status':
          return this.handleStatus();
        case '/did':
          return await this.handleGetDID();
        case '/tokens/origin':
          return await this.handleNewOriginToken(request);
        case '/tokens/attenuated':
          return await this.handleNewAttenuatedToken(request);
        case '/tokens/list':
          return await this.handleListTokens();
        case '/sign':
          return await this.handleSign(request);
        case '/verify':
          return await this.handleVerify(request);
        case '/accounts/switch':
          return await this.handleSwitchAccount(request);
        case '/accounts/list':
          return await this.handleListAccounts();
        default:
          return new Response('Not Found', { status: 404 });
      }
    } catch (error) {
      console.error('[SonrIdentityDurable] Request error:', error);
      return Response.json(
        {
          error: error instanceof Error ? error.message : 'Unknown error',
          path
        },
        { status: 500 }
      );
    }
  }

  /**
   * Initialize the enclave with WASM and account address
   */
  private async handleInitialize(request: Request): Promise<Response> {
    if (this.isInitialized && this.enclave) {
      console.log('[SonrIdentityDurable] Already initialized');
      return Response.json({
        success: true,
        accountAddress: this.accountAddress,
        message: 'Already initialized'
      });
    }

    const { wasmPath, accountAddress } = await request.json<{
      wasmPath: string;
      accountAddress: string;
    }>();

    console.log('[SonrIdentityDurable] Initializing enclave for account:', accountAddress);

    // Prevent concurrent initialization
    if (this.initPromise) {
      await this.initPromise;
      return Response.json({
        success: true,
        accountAddress: this.accountAddress
      });
    }

    this.initPromise = (async () => {
      // Check if we already have an enclave instance for this identity
      const existingEnclave = SonrIdentityDurable.enclaveInstances.get(accountAddress);

      if (existingEnclave && existingEnclave.isReady()) {
        console.log('[SonrIdentityDurable] Reusing existing enclave instance for:', accountAddress);
        this.enclave = existingEnclave;
      } else {
        // Create new enclave instance
        console.log('[SonrIdentityDurable] Creating NEW enclave instance for:', accountAddress);

        this.enclave = new EnclaveWorkerClient({
          vaultConfig: {
            enablePersistence: true,
          },
          debug: true,
          requestTimeout: 30000,
        });

        await this.enclave.initialize(wasmPath, accountAddress);

        // Store in singleton map
        SonrIdentityDurable.enclaveInstances.set(accountAddress, this.enclave);
      }

      this.accountAddress = accountAddress;
      this.isInitialized = true;

      // Persist state
      await this.ctx.storage.put('identity-state', {
        accountAddress: this.accountAddress,
        isInitialized: this.isInitialized,
      });

      console.log('[SonrIdentityDurable] Initialization complete');
      this.broadcast({
        type: 'initialized',
        accountAddress: this.accountAddress
      });
    })();

    try {
      await this.initPromise;
      return Response.json({
        success: true,
        accountAddress: this.accountAddress
      });
    } catch (error) {
      this.initPromise = null;
      throw error;
    }
  }

  /**
   * Get initialization status
   */
  private handleStatus(): Response {
    return Response.json({
      isInitialized: this.isInitialized,
      accountAddress: this.accountAddress,
      hasEnclave: this.enclave !== null,
      connectedSessions: this.sessions.size,
    });
  }

  /**
   * Get issuer DID and address
   */
  private async handleGetDID(): Promise<Response> {
    this.ensureInitialized();

    console.log('[SonrIdentityDurable] Getting issuer DID');
    const result = await this.enclave!.getIssuerDID();

    return Response.json(result);
  }

  /**
   * Create a new origin UCAN token
   */
  private async handleNewOriginToken(request: Request): Promise<Response> {
    this.ensureInitialized();

    const tokenRequest = await request.json<NewOriginTokenRequest>();

    console.log('[SonrIdentityDurable] Creating origin token for audience:', tokenRequest.audience_did);
    const result = await this.enclave!.newOriginToken(tokenRequest);

    this.broadcast({
      type: 'token_created',
      tokenType: 'origin',
      audience: tokenRequest.audience_did
    });

    return Response.json(result);
  }

  /**
   * Create a new attenuated UCAN token
   */
  private async handleNewAttenuatedToken(request: Request): Promise<Response> {
    this.ensureInitialized();

    const tokenRequest = await request.json<NewAttenuatedTokenRequest>();

    console.log('[SonrIdentityDurable] Creating attenuated token for audience:', tokenRequest.audience_did);
    const result = await this.enclave!.newAttenuatedToken(tokenRequest);

    this.broadcast({
      type: 'token_created',
      tokenType: 'attenuated',
      audience: tokenRequest.audience_did
    });

    return Response.json(result);
  }

  /**
   * List all persisted tokens
   */
  private async handleListTokens(): Promise<Response> {
    this.ensureInitialized();

    console.log('[SonrIdentityDurable] Listing tokens');
    const tokens = await this.enclave!.getPersistedTokens();

    return Response.json({ tokens });
  }

  /**
   * Sign data with the vault's MPC enclave
   */
  private async handleSign(request: Request): Promise<Response> {
    this.ensureInitialized();

    const { data } = await request.json<{ data: number[] }>();
    const dataArray = new Uint8Array(data);

    console.log('[SonrIdentityDurable] Signing data of length:', dataArray.length);
    const result = await this.enclave!.signData({ data: dataArray });

    this.broadcast({
      type: 'data_signed',
      dataLength: dataArray.length
    });

    // Convert Uint8Array to array for JSON serialization
    return Response.json({
      signature: Array.from(result.signature),
      error: result.error,
    });
  }

  /**
   * Verify a signature
   */
  private async handleVerify(request: Request): Promise<Response> {
    this.ensureInitialized();

    const { data, signature } = await request.json<{
      data: number[];
      signature: number[]
    }>();

    const dataArray = new Uint8Array(data);
    const signatureArray = new Uint8Array(signature);

    console.log('[SonrIdentityDurable] Verifying signature');
    const result = await this.enclave!.verifyData({
      data: dataArray,
      signature: signatureArray
    });

    return Response.json(result);
  }

  /**
   * Switch to a different account
   */
  private async handleSwitchAccount(request: Request): Promise<Response> {
    this.ensureInitialized();

    const { accountAddress } = await request.json<{ accountAddress: string }>();

    console.log('[SonrIdentityDurable] Switching to account:', accountAddress);
    await this.enclave!.switchAccount(accountAddress);

    this.accountAddress = accountAddress;

    // Update persisted state
    await this.ctx.storage.put('identity-state', {
      accountAddress: this.accountAddress,
      isInitialized: this.isInitialized,
    });

    this.broadcast({
      type: 'account_switched',
      accountAddress
    });

    return Response.json({ success: true, accountAddress });
  }

  /**
   * List all persisted accounts
   */
  private async handleListAccounts(): Promise<Response> {
    this.ensureInitialized();

    console.log('[SonrIdentityDurable] Listing accounts');
    const accounts = await this.enclave!.listPersistedAccounts();

    return Response.json({ accounts });
  }

  /**
   * Handle WebSocket connections for real-time updates
   */
  private handleWebSocket(request: Request): Response {
    const pair = new WebSocketPair();
    const [client, server] = Object.values(pair);

    this.ctx.acceptWebSocket(server);
    this.sessions.add(server);

    console.log('[SonrIdentityDurable] WebSocket connected. Total sessions:', this.sessions.size);

    // Send current status immediately
    server.send(JSON.stringify({
      type: 'status',
      isInitialized: this.isInitialized,
      accountAddress: this.accountAddress
    }));

    return new Response(null, {
      status: 101,
      webSocket: client,
    });
  }

  /**
   * Handle WebSocket messages
   */
  async webSocketMessage(ws: WebSocket, message: string | ArrayBuffer) {
    if (typeof message === 'string') {
      try {
        const data = JSON.parse(message);

        console.log('[SonrIdentityDurable] WebSocket message:', data.type);

        switch (data.type) {
          case 'ping':
            ws.send(JSON.stringify({ type: 'pong', timestamp: Date.now() }));
            break;
          case 'status':
            ws.send(JSON.stringify({
              type: 'status',
              isInitialized: this.isInitialized,
              accountAddress: this.accountAddress
            }));
            break;
          default:
            ws.send(JSON.stringify({
              type: 'error',
              message: 'Unknown message type'
            }));
        }
      } catch (error) {
        console.error('[SonrIdentityDurable] WebSocket message error:', error);
        ws.send(JSON.stringify({
          type: 'error',
          message: 'Invalid message format'
        }));
      }
    }
  }

  /**
   * Handle WebSocket close events
   */
  async webSocketClose(ws: WebSocket) {
    this.sessions.delete(ws);
    console.log('[SonrIdentityDurable] WebSocket disconnected. Remaining sessions:', this.sessions.size);
  }

  /**
   * Broadcast a message to all connected WebSocket clients
   */
  private broadcast(message: any) {
    const messageStr = JSON.stringify(message);
    let failedCount = 0;

    for (const session of this.sessions) {
      try {
        session.send(messageStr);
      } catch (error) {
        console.error('[SonrIdentityDurable] Failed to send to session:', error);
        this.sessions.delete(session);
        failedCount++;
      }
    }

    if (failedCount > 0) {
      console.log('[SonrIdentityDurable] Removed', failedCount, 'failed sessions');
    }
  }


  /**
   * Ensure the enclave is initialized
   */
  private ensureInitialized(): void {
    if (!this.isInitialized || !this.enclave) {
      throw new Error('Enclave not initialized. Call /initialize first.');
    }
  }

  /**
   * Cleanup when the Durable Object is evicted from memory
   */
  async alarm() {
    console.log('[SonrIdentityDurable] Alarm triggered - performing cleanup');

    // Clean up expired tokens
    if (this.enclave && this.isInitialized) {
      try {
        await this.enclave.removeExpiredTokens();
        console.log('[SonrIdentityDurable] Expired tokens removed');
      } catch (error) {
        console.error('[SonrIdentityDurable] Failed to remove expired tokens:', error);
      }
    }

    // Schedule next cleanup (24 hours)
    await this.ctx.storage.setAlarm(Date.now() + 24 * 60 * 60 * 1000);
  }

  /**
   * Static method to get all active enclave instances
   * Useful for debugging and monitoring
   */
  static getActiveEnclaves(): string[] {
    return Array.from(SonrIdentityDurable.enclaveInstances.keys());
  }

  /**
   * Static method to cleanup unused enclave instances
   * This should be called periodically to free resources
   */
  static async cleanupUnusedEnclaves(): Promise<void> {
    const instances = Array.from(SonrIdentityDurable.enclaveInstances.entries());

    for (const [accountAddress, enclave] of instances) {
      // Check if enclave is still ready
      if (!enclave.isReady()) {
        console.log('[SonrIdentityDurable] Removing inactive enclave for:', accountAddress);
        await enclave.cleanup();
        SonrIdentityDurable.enclaveInstances.delete(accountAddress);
      }
    }

    console.log('[SonrIdentityDurable] Cleanup complete. Active enclaves:',
      SonrIdentityDurable.enclaveInstances.size);
  }
}
