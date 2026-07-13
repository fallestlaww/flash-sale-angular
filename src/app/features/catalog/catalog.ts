import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { catchError, forkJoin, of } from 'rxjs';
import { ApiService } from '../../core/api.service';
import { CatalogService } from '../../core/catalog.service';
import { AppError, EventResponse } from '../../core/models';
import { EventCard } from '../../shared/event-card/event-card';

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

  readonly loading = signal(false);
  readonly events = signal<EventResponse[]>([]);
  readonly loadError = signal(false);

  constructor() {
    this.load();
  }

  load(): void {
    const ids = this.catalog.eventIds();
    if (ids.length === 0) {
      this.events.set([]);
      return;
    }
    this.loading.set(true);
    this.loadError.set(false);
    forkJoin(
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
    ).subscribe((results) => {
      this.events.set(results.filter((e): e is EventResponse => e !== null));
      this.loading.set(false);
    });
  }
}
