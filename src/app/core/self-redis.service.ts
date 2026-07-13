import { HttpClient, HttpContext, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { SILENT } from './http-context';
import { StatsResponse } from './models';
import {
  RedisCas,
  RedisCounter,
  RedisSetResult,
  RedisSize,
  RedisSnapshot,
  RedisTtl,
  RedisValue,
} from './redis-models';

function ctx(): HttpContext {
  return new HttpContext().set(SILENT, true);
}

@Injectable({ providedIn: 'root' })
export class SelfRedisService {
  private readonly http = inject(HttpClient);
  private readonly base = '/api/admin/redis';

  private keyUrl(key: string): string {
    return `${this.base}/keys/${encodeURIComponent(key)}`;
  }

  getKey(key: string): Observable<RedisValue> {
    return this.http.get<RedisValue>(this.keyUrl(key), { context: ctx() });
  }

  set(
    key: string,
    value: string,
    ttlSeconds: number | null,
    mode: 'set' | 'nx' | 'xx',
  ): Observable<RedisValue | RedisSetResult> {
    let params = new HttpParams();
    if (mode === 'nx') {
      params = params.set('nx', 'true');
    } else if (mode === 'xx') {
      params = params.set('xx', 'true');
    }
    const body: Record<string, unknown> = { value };
    if (ttlSeconds !== null) {
      body['ttlSeconds'] = ttlSeconds;
    }
    return this.http.put<RedisValue | RedisSetResult>(this.keyUrl(key), body, {
      params,
      context: ctx(),
    });
  }

  del(key: string): Observable<void> {
    return this.http.delete<void>(this.keyUrl(key), { context: ctx() });
  }

  flush(): Observable<void> {
    return this.http.delete<void>(`${this.base}/keys`, { context: ctx() });
  }

  getTtl(key: string): Observable<RedisTtl> {
    return this.http.get<RedisTtl>(`${this.keyUrl(key)}/ttl`, { context: ctx() });
  }

  expire(key: string, ttlSeconds: number): Observable<RedisTtl> {
    return this.http.put<RedisTtl>(`${this.keyUrl(key)}/ttl`, { ttlSeconds }, { context: ctx() });
  }

  persist(key: string): Observable<RedisTtl> {
    return this.http.delete<RedisTtl>(`${this.keyUrl(key)}/ttl`, { context: ctx() });
  }

  increment(key: string, by: number): Observable<RedisCounter> {
    return this.http.post<RedisCounter>(`${this.keyUrl(key)}/increment`, { by }, { context: ctx() });
  }

  decrement(key: string, by: number): Observable<RedisCounter> {
    return this.http.post<RedisCounter>(`${this.keyUrl(key)}/decrement`, { by }, { context: ctx() });
  }

  cas(key: string, expected: string, value: string): Observable<RedisCas> {
    return this.http.post<RedisCas>(
      `${this.keyUrl(key)}/cas`,
      { expected, value },
      { context: ctx() },
    );
  }

  stats(): Observable<StatsResponse> {
    return this.http.get<StatsResponse>(`${this.base}/stats`, { context: ctx() });
  }

  size(): Observable<RedisSize> {
    return this.http.get<RedisSize>(`${this.base}/size`, { context: ctx() });
  }

  snapshotSave(): Observable<RedisSnapshot> {
    return this.http.post<RedisSnapshot>(`${this.base}/snapshot`, {}, { context: ctx() });
  }

  snapshotLoad(): Observable<RedisSnapshot> {
    return this.http.post<RedisSnapshot>(`${this.base}/snapshot/load`, {}, { context: ctx() });
  }
}
