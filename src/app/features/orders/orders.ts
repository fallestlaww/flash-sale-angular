import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { catchError, forkJoin, of } from 'rxjs';
import { ApiService } from '../../core/api.service';
import { OrdersService } from '../../core/orders.service';
import { AppError, OrderResponse } from '../../core/models';
import { OrderCard } from '../../shared/order-card/order-card';

@Component({
  selector: 'app-orders',
  imports: [RouterLink, OrderCard],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './orders.html',
  styleUrl: './orders.css',
})
export class Orders {
  private readonly api = inject(ApiService);
  private readonly ordersSvc = inject(OrdersService);

  readonly loading = signal(false);
  readonly orders = signal<OrderResponse[]>([]);
  readonly loadError = signal(false);

  constructor() {
    this.load();
  }

  load(): void {
    const ids = this.ordersSvc.orderIds();
    if (ids.length === 0) {
      this.orders.set([]);
      return;
    }
    this.loading.set(true);
    this.loadError.set(false);
    forkJoin(
      ids.map((id) =>
        this.api.getOrder(id).pipe(
          catchError((err: AppError) => {
            if (err.status === 404) {
              this.ordersSvc.removeOrderId(id);
            } else {
              this.loadError.set(true);
            }
            return of(null);
          }),
        ),
      ),
    ).subscribe((results) => {
      this.orders.set(results.filter((o): o is OrderResponse => o !== null));
      this.loading.set(false);
    });
  }

  onReReserved(order: OrderResponse): void {
    this.orders.update((list) => [order, ...list]);
  }
}
