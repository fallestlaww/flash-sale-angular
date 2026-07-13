import { Injectable, signal } from '@angular/core';

export type ToastKind = 'info' | 'success' | 'warn' | 'error';

export interface Toast {
  id: number;
  kind: ToastKind;
  message: string;
}

/**
 * Global toasts/banners. error.interceptor pushes messages here for
 * 400/404/409/410/429/503; features may add success/info manually.
 */
@Injectable({ providedIn: 'root' })
export class ToastService {
  private seq = 0;
  private readonly _toasts = signal<Toast[]>([]);
  readonly toasts = this._toasts.asReadonly();

  push(message: string, kind: ToastKind = 'info', timeoutMs = 5000): void {
    const id = ++this.seq;
    this._toasts.update((list) => [...list, { id, kind, message }]);
    if (timeoutMs > 0) {
      setTimeout(() => this.dismiss(id), timeoutMs);
    }
  }

  dismiss(id: number): void {
    this._toasts.update((list) => list.filter((t) => t.id !== id));
  }
}
