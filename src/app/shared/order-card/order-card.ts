import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  linkedSignal,
  signal,
} from '@angular/core';
import { DatePipe } from '@angular/common';
import { ApiService } from '../../core/api.service';
import { ClockService } from '../../core/clock.service';
import { AppError, OrderResponse } from '../../core/models';
import { StatusBadge } from '../status-badge/status-badge';
import { HoldTimer } from '../hold-timer/hold-timer';

@Component({
  selector: 'app-order-card',
  imports: [DatePipe, StatusBadge, HoldTimer],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './order-card.html',
  styleUrl: './order-card.css',
})
export class OrderCard {
  readonly order = input.required<OrderResponse>();

  private readonly api = inject(ApiService);
  private readonly clock = inject(ClockService);

  readonly current = linkedSignal(() => this.order());
  private readonly deadlineMs = linkedSignal(() => {
    const o = this.order();
    return o.status === 'HELD' && o.expiresInSec !== null ? Date.now() + o.expiresInSec * 1000 : 0;
  });
  readonly busy = signal(false);

  readonly remaining = computed(() => {
    if (this.current().status !== 'HELD') {
      return 0;
    }
    return Math.max(0, Math.ceil((this.deadlineMs() - this.clock.nowMs()) / 1000));
  });

  readonly timedOut = computed(() => this.current().status === 'HELD' && this.remaining() === 0);

  pay(): void {
    if (this.busy() || this.current().status !== 'HELD') {
      return;
    }
    this.busy.set(true);
    this.api.payOrder(this.current().orderId).subscribe({
      next: (o) => this.settle(o),
      error: (e: AppError) => this.onError(e),
    });
  }

  cancel(): void {
    if (this.busy() || this.current().status !== 'HELD') {
      return;
    }
    this.busy.set(true);
    this.api.cancelOrder(this.current().orderId).subscribe({
      next: (o) => this.settle(o),
      error: (e: AppError) => this.onError(e),
    });
  }

  recheck(): void {
    if (this.busy()) {
      return;
    }
    this.busy.set(true);
    this.api.getOrder(this.current().orderId).subscribe({
      next: (o) => this.settle(o),
      error: () => this.busy.set(false),
    });
  }

  private settle(o: OrderResponse): void {
    this.current.set(o);
    this.busy.set(false);
  }

  private onError(e: AppError): void {
    this.busy.set(false);
    if (e.status === 410) {
      this.current.update((o) => ({ ...o, status: 'EXPIRED', expiresInSec: null }));
    } else if (e.status === 409) {
      this.recheck();
    }
  }
}
