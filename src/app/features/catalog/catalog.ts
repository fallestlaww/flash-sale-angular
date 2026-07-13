import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { catchError, forkJoin, of } from 'rxjs';
import { ApiService } from '../../core/api.service';
import { CatalogService } from '../../core/catalog.service';
import { OrdersService } from '../../core/orders.service';
import { AppError, EventResponse, OrderResponse } from '../../core/models';
import { EventCard } from '../../shared/event-card/event-card';

/** An event plus the free-ticket count remaining after the user's active holds/payments. */
export interface CatalogItem {
  event: EventResponse;
  remaining: number;
}

@Component({
  selector: 'app-catalog',
  imports: [RouterLink, EventCard],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './catalog.html',
  styleUrl: './catalog.css',
})
export class Catalog {
  private readonly api = inject(ApiService);
  private readonly catalog = inject(CatalogService);
  private readonly ordersSvc = inject(OrdersService);

  readonly loading = signal(false);
  readonly items = signal<CatalogItem[]>([]);
  readonly loadError = signal(false);

  constructor() {
    this.load();
  }

  load(): void {
    const ids = this.catalog.eventIds();
    if (ids.length === 0) {
      this.items.set([]);
      return;
    }
    this.loading.set(true);
    this.loadError.set(false);

    const orderIds = this.ordersSvc.orderIds();
    const events$ = forkJoin(
      ids.map((id) =>
        this.api.getEvent(id).pipe(
          catchError((err: AppError) => {
            if (err.status === 404) {
              this.catalog.removeEventId(id);
            } else {
              this.loadError.set(true);
            }
            return of(null);
          }),
        ),
      ),
    );
    const orders$ = orderIds.length
      ? forkJoin(orderIds.map((id) => this.api.getOrder(id, true).pipe(catchError(() => of(null)))))
      : of([] as (OrderResponse | null)[]);

    forkJoin({ events: events$, orders: orders$ }).subscribe(({ events, orders }) => {
      const consumed = this.consumedByEvent(orders);
      this.items.set(
        events
          .filter((e): e is EventResponse => e !== null)
          .map((event) => ({
            event,
            remaining: Math.max(0, event.totalStock - (consumed.get(event.id) ?? 0)),
          })),
      );
      this.loading.set(false);
    });
  }

  /** Sums qty of the user's stock-holding orders (HELD/PAID) per event; CANCELLED/EXPIRED release stock. */
  private consumedByEvent(orders: (OrderResponse | null)[]): Map<number, number> {
    return orders.reduce((acc, o) => {
      if (o && (o.status === 'HELD' || o.status === 'PAID')) {
        acc.set(o.eventId, (acc.get(o.eventId) ?? 0) + o.qty);
      }
      return acc;
    }, new Map<number, number>());
  }
}
