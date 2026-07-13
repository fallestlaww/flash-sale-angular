import { Injectable, signal } from '@angular/core';

const STORAGE_KEY = 'flash-sale.eventIds';

@Injectable({ providedIn: 'root' })
export class CatalogService {
  private readonly _eventIds = signal<number[]>(this.load());
  readonly eventIds = this._eventIds.asReadonly();

  addEventId(id: number): void {
    if (!Number.isFinite(id) || id <= 0) {
      return;
    }
    this._eventIds.update((ids) => (ids.includes(id) ? ids : [...ids, id]));
    this.save();
  }

  removeEventId(id: number): void {
    this._eventIds.update((ids) => ids.filter((x) => x !== id));
    this.save();
  }

  private save(): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this._eventIds()));
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
