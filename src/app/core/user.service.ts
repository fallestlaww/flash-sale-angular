import { Injectable, signal } from '@angular/core';

const STORAGE_KEY = 'flash-sale.userId';

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly _currentUserId = signal<number>(this.load());
  readonly currentUserId = this._currentUserId.asReadonly();

  setUser(id: number): void {
    if (!Number.isFinite(id) || id <= 0) {
      return;
    }
    const normalized = Math.trunc(id);
    this._currentUserId.set(normalized);
    localStorage.setItem(STORAGE_KEY, String(normalized));
  }

  private load(): number {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw !== null ? Number(raw) : NaN;
    return Number.isFinite(parsed) && parsed > 0 ? Math.trunc(parsed) : 1;
  }
}
