import { ChangeDetectionStrategy, Component, inject, input, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { Subject, catchError, map, merge, of, switchMap } from 'rxjs';
import { ApiService } from '../../core/api.service';
import { AppError, EventResponse, OrderResponse } from '../../core/models';
import { ReserveForm } from '../../shared/reserve-form/reserve-form';
import { OrderCard } from '../../shared/order-card/order-card';

@Component({
  selector: 'app-event-detail',
  imports: [DatePipe, RouterLink, ReserveForm, OrderCard],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './event-detail.html',
  styleUrl: './event-detail.css',
})
export class EventDetail {
  readonly id = input<string>();

  private readonly api = inject(ApiService);
  private readonly refresh$ = new Subject<void>();

  readonly event = signal<EventResponse | null>(null);
  readonly loading = signal(false);
  readonly notFound = signal(false);
  readonly loadError = signal(false);
  readonly createdOrders = signal<OrderResponse[]>([]);

  constructor() {
    merge(toObservable(this.id), this.refresh$)
      .pipe(
        map(() => Number(this.id())),
        switchMap((id) => {
          if (!Number.isFinite(id) || id <= 0) {
            this.notFound.set(true);
            this.event.set(null);
            return of(null);
          }
          this.loading.set(true);
          this.notFound.set(false);
          this.loadError.set(false);
          return this.api.getEvent(id).pipe(
            catchError((err: AppError) => {
              if (err.status === 404) {
                this.notFound.set(true);
              } else {
                this.loadError.set(true);
              }
              return of(null);
            }),
          );
        }),
        takeUntilDestroyed(),
      )
      .subscribe((ev) => {
        this.event.set(ev);
        this.loading.set(false);
      });
  }

  refresh(): void {
    this.refresh$.next();
  }

  onReserved(order: OrderResponse): void {
    this.createdOrders.update((list) => [order, ...list]);
  }
}
