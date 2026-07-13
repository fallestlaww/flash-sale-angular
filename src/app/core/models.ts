// Types aligned 1:1 with the sale-service (:8080) backend DTOs.
// Instant is serialized as an ISO-8601 string.

export interface EventResponse {
  id: number;
  name: string;
  startsAt: string; // ISO-8601 (Instant)
  totalStock: number; // INITIAL amount, NOT the current remaining stock
}

export type OrderStatus = 'HELD' | 'PAID' | 'CANCELLED' | 'EXPIRED';

export interface OrderResponse {
  orderId: number;
  eventId: number;
  qty: number;
  status: OrderStatus;
  expiresInSec: number | null; // present for HELD
  createdAt: string; // ISO-8601
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

// Single error shape returned by the backend (ApiError).
export interface ApiError {
  timestamp: string;
  status: number;
  error: string;
  message: string;
  path: string;
}

// Internal typed error thrown by error.interceptor into the stream.
export interface AppError {
  status: number;
  message: string;
}

export interface CreateEventRequest {
  name: string;
  startsAt: string; // ISO-8601
  totalStock: number;
}

export interface CreateOrderRequest {
  eventId: number;
  qty: number;
}
