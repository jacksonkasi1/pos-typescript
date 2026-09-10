import express from 'express';
import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import dotenv from 'dotenv';
import { createClient } from 'redis';

dotenv.config();

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
const redisSubscriber = createClient({ url: REDIS_URL });

const tableConnections = new Map<string, Set<WebSocket>>();
const tenantConnections = new Map<string, Set<WebSocket>>();

app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'ws-bridge-typescript',
    timestamp: new Date().toISOString(),
  });
});

wss.on('connection', (ws: WebSocket, req) => {
  const url = req.url || '';

  // /ws/table/:table_id
  const tableMatch = url.match(/^\/ws\/table\/([^/?]+)/);
  if (tableMatch && tableMatch[1]) {
    const tableId = tableMatch[1];
    if (!tableConnections.has(tableId)) {
      tableConnections.set(tableId, new Set());
    }
    tableConnections.get(tableId)!.add(ws);

    ws.on('close', () => {
      tableConnections.get(tableId)?.delete(ws);
    });
    return;
  }

  // /ws/tenant/:tenant_id
  const tenantMatch = url.match(/^\/ws\/tenant\/([^/?]+)/);
  if (tenantMatch && tenantMatch[1]) {
    const tenantId = tenantMatch[1];
    if (!tenantConnections.has(tenantId)) {
      tenantConnections.set(tenantId, new Set());
    }
    tenantConnections.get(tenantId)!.add(ws);

    ws.on('close', () => {
      tenantConnections.get(tenantId)?.delete(ws);
    });
    return;
  }

  ws.close(1008, 'Invalid endpoint');
});

function broadcast(clientSet: Set<WebSocket> | undefined, message: string) {
  if (!clientSet) return;
  for (const client of clientSet) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  }
}

async function startRedis() {
  try {
    await redisSubscriber.connect();
    console.log('Connected to Redis pub/sub');

    await redisSubscriber.pSubscribe('orders:*', (message, channel) => {
      const parts = channel.split(':');
      if (parts[1] === 'table' && parts[2]) {
        broadcast(tableConnections.get(parts[2]), message);
      } else if (parts[1] === 'tenant' && parts[2]) {
        broadcast(tenantConnections.get(parts[2]), message);
      }
    });

    await redisSubscriber.pSubscribe('reservations:*', (message, channel) => {
      const parts = channel.split(':');
      if (parts[1] === 'tenant' && parts[2]) {
        broadcast(tenantConnections.get(parts[2]), message);
      }
    });
  } catch (err) {
    console.warn('Redis connection not available (standalone mode):', err);
  }
}

startRedis();

const PORT = process.env.PORT || 8021;
server.listen(PORT, () => {
  console.log(`WebSocket Bridge running on port ${PORT}`);
});
