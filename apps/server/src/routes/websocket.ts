import { Elysia } from 'elysia';

// WebSocket connection management
const connections = new Map<string, WebSocket>();
let connectionCounter = 0;

// Price update broadcasting (mock implementation)
function broadcastPriceUpdate(symbol: string, price: number, change: number) {
  const update = {
    type: 'price_update',
    symbol,
    price,
    change24h: change,
    timestamp: new Date().toISOString(),
  };

  // Broadcast to all connected clients
  for (const [id, ws] of connections) {
    try {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(update));
      }
    } catch (error) {
      console.error(`Failed to send to connection ${id}:`, error);
      connections.delete(id);
    }
  }
}

// Mock price update generator
setInterval(() => {
  const symbols = ['BTC', 'ETH', 'SOL', 'ADA', 'DOT'];
  const randomSymbol = symbols[Math.floor(Math.random() * symbols.length)];
  const mockPrice = 10000 + Math.random() * 50000;
  const mockChange = (Math.random() - 0.5) * 10;

  broadcastPriceUpdate(randomSymbol, mockPrice, mockChange);
}, 5000); // Update every 5 seconds

export const websocketRoutes = new Elysia({ prefix: '/ws' })
  .ws('/prices', {
    open(ws) {
      const connectionId = `conn_${++connectionCounter}`;
      connections.set(connectionId, ws);

      console.log(`WebSocket connection opened: ${connectionId}`);
      console.log(`Total connections: ${connections.size}`);

      // Send welcome message
      ws.send(
        JSON.stringify({
          type: 'welcome',
          message: 'Connected to Motr price feed',
          connectionId,
          timestamp: new Date().toISOString(),
        })
      );
    },

    message(ws, message) {
      try {
        const data = JSON.parse(message as string);
        console.log('Received message:', data);

        // Handle subscription messages
        if (data.type === 'subscribe') {
          ws.send(
            JSON.stringify({
              type: 'subscription_confirmed',
              symbols: data.symbols || ['BTC', 'ETH'],
              timestamp: new Date().toISOString(),
            })
          );
        }
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
        ws.send(
          JSON.stringify({
            type: 'error',
            message: 'Invalid message format',
            timestamp: new Date().toISOString(),
          })
        );
      }
    },

    close(ws, code, reason) {
      // Find and remove the connection
      for (const [id, socket] of connections) {
        if (socket === ws) {
          connections.delete(id);
          console.log(`WebSocket connection closed: ${id}, code: ${code}, reason: ${reason}`);
          console.log(`Total connections: ${connections.size}`);
          break;
        }
      }
    },
  })

  .get('/prices/stream', ({ request }) => {
    // Alternative SSE endpoint for browsers that don't support WebSocket
    if (request.headers.get('accept') === 'text/event-stream') {
      return new Response(
        new ReadableStream({
          start(controller) {
            // Send initial connection message
            controller.enqueue(
              `data: ${JSON.stringify({
                type: 'connected',
                message: 'SSE connection established',
                timestamp: new Date().toISOString(),
              })}\n\n`
            );

            // Set up periodic updates
            const interval = setInterval(() => {
              try {
                const symbols = ['BTC', 'ETH', 'SOL'];
                const randomSymbol = symbols[Math.floor(Math.random() * symbols.length)];
                const mockPrice = 10000 + Math.random() * 50000;
                const mockChange = (Math.random() - 0.5) * 10;

                const update = {
                  type: 'price_update',
                  symbol: randomSymbol,
                  price: mockPrice,
                  change24h: mockChange,
                  timestamp: new Date().toISOString(),
                };

                controller.enqueue(`data: ${JSON.stringify(update)}\n\n`);
              } catch (error) {
                console.error('SSE stream error:', error);
                controller.error(error);
              }
            }, 3000); // Update every 3 seconds

            // Clean up on abort
            request.signal.addEventListener('abort', () => {
              clearInterval(interval);
              controller.close();
            });
          },
        }),
        {
          headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            Connection: 'keep-alive',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Cache-Control',
          },
        }
      );
    }

    return new Response('SSE endpoint - use Accept: text/event-stream header', {
      status: 400,
      headers: { 'Content-Type': 'text/plain' },
    });
  })

  .get('/status', () => {
    return {
      websocket: {
        connections: connections.size,
        status: 'active',
      },
      timestamp: new Date().toISOString(),
    };
  });
