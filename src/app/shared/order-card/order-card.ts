import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  linkedSignal,
  output,
  signal,
} from '@angular/core';
import { DatePipe } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, filter, interval, of, switchMap } from 'rxjs';
import { ApiService } from '../../core/api.service';
import { ClockService } from '../../core/clock.service';
import { OrdersService } from '../../core/orders.service';
import { AppError, OrderResponse } from '../../core/models';
import { StatusBadge } from '../status-badge/status-badge';
import { HoldTimer } from '../hold-timer/hold-timer';

const POLL_MS = 5000;

@Component({
  selector: 'app-order-card',
  imports: [DatePipe, StatusBadge, HoldTimer],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './order-card.html',
  styleUrl: './order-card.css',
})
export class OrderCard {
  readonly order = input.required<OrderResponse>();
  readonly reReserved = output<OrderResponse>();

  private readonly api = inject(ApiService);
  private readonly clock = inject(ClockService);
  private readonly orders = inject(OrdersService);

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

  constructor() {
    interval(POLL_MS)
      .pipe(
        filter(() => this.current().status === 'HELD' && !this.busy()),
        switchMap(() =>
          this.api.getOrder(this.current().orderId, true).pipe(catchError(() => of(null))),
        ),
        takeUntilDestroyed(),
      )
      .subscribe((o) => {
        if (o) {
          this.current.set(o);
        }
      });
  }

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

  reserveAgain(): void {
    if (this.busy() || this.current().status !== 'EXPIRED') {
      return;
    }
    this.busy.set(true);
    const key = crypto.randomUUID();
    this.api
      .createOrder({ eventId: this.current().eventId, qty: this.current().qty }, key)
      .subscribe({
        next: (o) => {
          this.orders.addOrderId(o.orderId);
          this.reReserved.emit(o);
          this.busy.set(false);
        },
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
