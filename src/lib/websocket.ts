// ============================================
// WebSocket Server Setup
// ============================================

import { WebSocket, Server as WebSocketServer } from 'ws';
import { WebSocketMessage } from '@/types';
import * as http from 'http';

interface ClientConnection {
  ws: WebSocket;
  userId: string;
  tripIds: Set<string>;
}

export class TripTallyWebSocket {
  private wss: WebSocketServer;
  private clients: Map<string, ClientConnection> = new Map();
  private tripSubscriptions: Map<string, Set<string>> = new Map();

  constructor(server: http.Server) {
    this.wss = new WebSocketServer({ server });
    this.setupConnectionHandler();
  }

  private setupConnectionHandler() {
    this.wss.on('connection', (ws: WebSocket, request) => {
      const clientId = generateClientId();

      // Authenticate connection
      const url = new URL(request.url || '', `http://${request.headers.host}`);
      const token = url.searchParams.get('token');

      if (!token) {
        ws.close(1008, 'Unauthorized');
        return;
      }

      // Store client connection
      const client: ClientConnection = {
        ws,
        userId: token, // In production, verify JWT here
        tripIds: new Set(),
      };

      this.clients.set(clientId, client);

      // Handle messages
      ws.on('message', (data: Buffer) => {
        try {
          const message = JSON.parse(data.toString());
          this.handleClientMessage(clientId, message);
        } catch (error) {
          console.error('WebSocket message error:', error);
        }
      });

      // Handle disconnection
      ws.on('close', () => {
        this.handleDisconnect(clientId);
      });

      ws.on('error', (error) => {
        console.error('WebSocket error:', error);
      });
    });
  }

  private handleClientMessage(clientId: string, message: any) {
    const client = this.clients.get(clientId);
    if (!client) return;

    if (message.type === 'subscribe') {
      // Subscribe to trip updates
      const tripId = message.tripId;
      client.tripIds.add(tripId);

      if (!this.tripSubscriptions.has(tripId)) {
        this.tripSubscriptions.set(tripId, new Set());
      }
      this.tripSubscriptions.get(tripId)!.add(clientId);
    } else if (message.type === 'unsubscribe') {
      // Unsubscribe from trip
      const tripId = message.tripId;
      client.tripIds.delete(tripId);

      const subscribers = this.tripSubscriptions.get(tripId);
      if (subscribers) {
        subscribers.delete(clientId);
      }
    }
  }

  private handleDisconnect(clientId: string) {
    const client = this.clients.get(clientId);
    if (!client) return;

    // Remove from all trip subscriptions
    for (const tripId of client.tripIds) {
      const subscribers = this.tripSubscriptions.get(tripId);
      if (subscribers) {
        subscribers.delete(clientId);
      }
    }

    this.clients.delete(clientId);
  }

  /**
   * Broadcast message to all subscribed users in a trip
   */
  public broadcastToTrip(tripId: string, message: WebSocketMessage) {
    const subscribers = this.tripSubscriptions.get(tripId);
    if (!subscribers) return;

    const payload = JSON.stringify(message);

    for (const clientId of subscribers) {
      const client = this.clients.get(clientId);
      if (client && client.ws.readyState === WebSocket.OPEN) {
        client.ws.send(payload);
      }
    }
  }

  /**
   * Send direct message to specific user
   */
  public sendToUser(userId: string, message: any) {
    for (const client of this.clients.values()) {
      if (client.userId === userId && client.ws.readyState === WebSocket.OPEN) {
        client.ws.send(JSON.stringify(message));
      }
    }
  }

  /**
   * Get number of connected clients
   */
  public getConnectionCount(): number {
    return this.clients.size;
  }

  /**
   * Get subscribers for a trip
   */
  public getTripSubscribers(tripId: string): number {
    return this.tripSubscriptions.get(tripId)?.size || 0;
  }
}

function generateClientId(): string {
  return `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Global WebSocket instance (will be initialized in server.ts)
let wsInstance: TripTallyWebSocket | null = null;

export function getWebSocketInstance(): TripTallyWebSocket | null {
  return wsInstance;
}

export function initializeWebSocket(server: http.Server): TripTallyWebSocket {
  wsInstance = new TripTallyWebSocket(server);
  return wsInstance;
}
