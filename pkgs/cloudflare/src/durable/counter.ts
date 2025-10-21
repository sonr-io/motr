import { DurableObject } from 'cloudflare:workers';
/**
 * CounterDurable - A simple counter Durable Object demonstrating basic patterns
 *
 * This Durable Object maintains a persistent counter value that can be
 * incremented, decremented, and reset. It demonstrates:
 * - State persistence using storage API
 * - HTTP request handling
 * - WebSocket support for real-time updates
 */
export class CounterDurable extends DurableObject {
  private counter: number = 0;
  private sessions: Set<WebSocket> = new Set();

  constructor(ctx: DurableObjectState, env: any) {
    super(ctx, env);
    // Initialize counter from storage on startup
    this.ctx.blockConcurrencyWhile(async () => {
      const stored = await this.ctx.storage.get<number>('counter');
      this.counter = stored ?? 0;
    });
  }

  /**
   * Handle HTTP requests to the Durable Object
   */
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    // Handle WebSocket upgrade requests
    if (request.headers.get('Upgrade') === 'websocket') {
      return this.handleWebSocket(request);
    }

    switch (path) {
      case '/increment':
        return this.handleIncrement();
      case '/decrement':
        return this.handleDecrement();
      case '/reset':
        return this.handleReset();
      case '/value':
        return this.handleGetValue();
      default:
        return new Response('Not Found', { status: 404 });
    }
  }

  /**
   * Increment the counter and persist the new value
   */
  private async handleIncrement(): Promise<Response> {
    this.counter++;
    await this.ctx.storage.put('counter', this.counter);
    this.broadcast({ type: 'update', value: this.counter });
    return Response.json({ value: this.counter });
  }

  /**
   * Decrement the counter and persist the new value
   */
  private async handleDecrement(): Promise<Response> {
    this.counter--;
    await this.ctx.storage.put('counter', this.counter);
    this.broadcast({ type: 'update', value: this.counter });
    return Response.json({ value: this.counter });
  }

  /**
   * Reset the counter to 0
   */
  private async handleReset(): Promise<Response> {
    this.counter = 0;
    await this.ctx.storage.put('counter', this.counter);
    this.broadcast({ type: 'update', value: this.counter });
    return Response.json({ value: this.counter });
  }

  /**
   * Get the current counter value
   */
  private handleGetValue(): Response {
    return Response.json({ value: this.counter });
  }

  /**
   * Handle WebSocket connections for real-time updates
   */
  private handleWebSocket(request: Request): Response {
    const pair = new WebSocketPair();
    const [client, server] = Object.values(pair);

    this.ctx.acceptWebSocket(server);
    this.sessions.add(server);

    // Send current value immediately
    server.send(JSON.stringify({ type: 'init', value: this.counter }));

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

        switch (data.type) {
          case 'increment':
            await this.handleIncrement();
            break;
          case 'decrement':
            await this.handleDecrement();
            break;
          case 'reset':
            await this.handleReset();
            break;
        }
      } catch (error) {
        ws.send(JSON.stringify({ type: 'error', message: 'Invalid message format' }));
      }
    }
  }

  /**
   * Handle WebSocket close events
   */
  async webSocketClose(ws: WebSocket) {
    this.sessions.delete(ws);
  }

  /**
   * Broadcast a message to all connected WebSocket clients
   */
  private broadcast(message: any) {
    const messageStr = JSON.stringify(message);
    for (const session of this.sessions) {
      try {
        session.send(messageStr);
      } catch (error) {
        // Remove failed sessions
        this.sessions.delete(session);
      }
    }
  }

  /**
   * Cleanup when the Durable Object is evicted from memory
   */
  async alarm() {
    // Optional: implement periodic cleanup or maintenance tasks
  }
}
