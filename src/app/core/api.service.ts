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

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);
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
