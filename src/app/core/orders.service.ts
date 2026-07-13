import { Injectable, signal } from '@angular/core';

const STORAGE_KEY = 'flash-sale.orderIds';

@Injectable({ providedIn: 'root' })
export class OrdersService {
  private readonly _orderIds = signal<number[]>(this.load());
  readonly orderIds = this._orderIds.asReadonly();

  addOrderId(id: number): void {
    if (!Number.isFinite(id) || id <= 0) {
      return;
    }
    this._orderIds.update((ids) => (ids.includes(id) ? ids : [id, ...ids]));
    this.save();
  }

  removeOrderId(id: number): void {
    this._orderIds.update((ids) => ids.filter((x) => x !== id));
    this.save();
  }

  private save(): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this._orderIds()));
  }

  private load(): number[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        return [];
      }
      const parsed: unknown = JSON.parse(raw);
      if (!Array.isArray(parsed)) {
        return [];
      }
      return parsed.filter((n): n is number => typeof n === 'number' && Number.isFinite(n) && n > 0);
    } catch {
      return [];
    }
  }
}
