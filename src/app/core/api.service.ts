import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, map, of } from 'rxjs';
import { SILENT } from './http-context';
import {
  AppError,
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

  createOrderRaw(userId: number, body: CreateOrderRequest, idempotencyKey: string): Observable<number> {
    return this.http
      .post(`${this.base}/orders`, body, {
        headers: { 'X-User-Id': String(userId), 'Idempotency-Key': idempotencyKey },
        context: new HttpContext().set(SILENT, true),
        observe: 'response',
      })
      .pipe(
        map((res) => res.status),
        catchError((e: AppError) => of(e.status)),
      );
  }

  payOrder(id: number): Observable<OrderResponse> {
    return this.http.post<OrderResponse>(`${this.base}/orders/${id}/pay`, {});
  }

  cancelOrder(id: number): Observable<OrderResponse> {
    return this.http.delete<OrderResponse>(`${this.base}/orders/${id}`);
  }

  getOrder(id: number, silent = false): Observable<OrderResponse> {
    return this.http.get<OrderResponse>(`${this.base}/orders/${id}`, {
      context: new HttpContext().set(SILENT, silent),
    });
  }

  getCacheStats(silent = false): Observable<StatsResponse> {
    return this.http.get<StatsResponse>(`${this.base}/admin/cache-stats`, {
      context: new HttpContext().set(SILENT, silent),
    });
  }
}
