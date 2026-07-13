import { ChangeDetectionStrategy, Component, inject, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/api.service';
import { OrdersService } from '../../core/orders.service';
import { OrderResponse } from '../../core/models';

@Component({
  selector: 'app-reserve-form',
  imports: [FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './reserve-form.html',
  styleUrl: './reserve-form.css',
})
export class ReserveForm {
  readonly eventId = input.required<number>();
  readonly reserved = output<OrderResponse>();

  private readonly api = inject(ApiService);
  private readonly orders = inject(OrdersService);

  qty = 1;
  readonly submitting = signal(false);
  readonly resending = signal(false);
  readonly lastKey = signal<string | null>(null);
  readonly demoResult = signal<string | null>(null);
  private lastOrderId: number | null = null;
  private lastQty = 0;

  reserve(): void {
    if (this.submitting()) {
      return;
    }
    const qty = Math.trunc(this.qty);
    if (!Number.isFinite(qty) || qty <= 0) {
      return;
    }
    const key = crypto.randomUUID();
    this.lastKey.set(key);
    this.lastQty = qty;
    this.demoResult.set(null);
    this.submitting.set(true);
    this.api.createOrder({ eventId: this.eventId(), qty }, key).subscribe({
      next: (order) => {
        this.lastOrderId = order.orderId;
        this.orders.addOrderId(order.orderId);
        this.reserved.emit(order);
        this.submitting.set(false);
      },
      error: () => this.submitting.set(false),
    });
  }

  resendSameKey(): void {
    const key = this.lastKey();
    if (!key || this.resending()) {
      return;
    }
    this.resending.set(true);
    this.api.createOrder({ eventId: this.eventId(), qty: this.lastQty }, key).subscribe({
      next: (order) => {
        const first = this.lastOrderId;
        this.demoResult.set(
          first !== null && order.orderId === first
            ? `Same key → same order #${order.orderId} (no second booking) ✓`
            : `Resent → order #${order.orderId} (first was #${first})`,
        );
        this.resending.set(false);
      },
      error: () => this.resending.set(false),
    });
  }
}
