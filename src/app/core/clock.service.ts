import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ClockService {
  readonly nowMs = signal(Date.now());

  constructor() {
    setInterval(() => this.nowMs.set(Date.now()), 1000);
  }
}
