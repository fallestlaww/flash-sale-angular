export interface EventResponse {
  id: number;
  name: string;
  startsAt: string;
  totalStock: number;
}

export type OrderStatus = 'HELD' | 'PAID' | 'CANCELLED' | 'EXPIRED';

export interface OrderResponse {
  orderId: number;
  eventId: number;
  qty: number;
  status: OrderStatus;
  expiresInSec: number | null;
  createdAt: string;
}

export interface StatsResponse {
  hits: number;
  misses: number;
  evictions: number;
  expirations: number;
  requests: number;
  hitRate: number;
  size: number;
}

export interface ApiError {
  timestamp: string;
  status: number;
  error: string;
  message: string;
  path: string;
}

export interface AppError {
  status: number;
  message: string;
}

export interface CreateEventRequest {
  name: string;
  startsAt: string;
  totalStock: number;
}

export interface CreateOrderRequest {
  eventId: number;
  qty: number;
}
