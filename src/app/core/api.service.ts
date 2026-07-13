import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import {
  CreateEventRequest,
  CreateOrderRequest,
  EventResponse,
  OrderResponse,
  StatsResponse,
} from './models';

/**
 * Single typed layer over the REST API (:8080). X-User-Id for /orders is added
 * by userIdInterceptor; the Idempotency-Key is tied to a specific attempt and is
 * passed as an argument to createOrder rather than by an interceptor.
 */
@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);
  // All requests go to '/api'; the dev proxy rewrites them to sale-service :8080
  // (see proxy.conf.json). In prod the frontend is served behind the same origin/proxy.
  private readonly base = '/api';

  getEvent(id: number): Observable<EventResponse> {
    return this.http.get<EventResponse>(`${this.base}/events/${id}`);
  }

  createEvent(body: CreateEventRequest): Observable<EventResponse> {
    return this.http.post<EventResponse>(`${this.base}/events`, body);
  }

  createOrder(body: CreateOrderRequest, idempotencyKey: string): Observable<OrderResponse> {
    return this.http.post<OrderResponse>(`${this.base}/orders`, body, {
      headers: { 'Idempotency-Key': idempotencyKey },
    });
  }

  payOrder(id: number): Observable<OrderResponse> {
    return this.http.post<OrderResponse>(`${this.base}/orders/${id}/pay`, {});
  }

  cancelOrder(id: number): Observable<OrderResponse> {
    return this.http.delete<OrderResponse>(`${this.base}/orders/${id}`);
  }

  getOrder(id: number): Observable<OrderResponse> {
    return this.http.get<OrderResponse>(`${this.base}/orders/${id}`);
  }

  getCacheStats(): Observable<StatsResponse> {
    return this.http.get<StatsResponse>(`${this.base}/admin/cache-stats`);
  }
}
