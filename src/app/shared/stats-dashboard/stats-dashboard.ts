import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, interval, of, startWith, switchMap } from 'rxjs';
import { ApiService } from '../../core/api.service';
import { AppError, StatsResponse } from '../../core/models';
import { Sparkline } from '../sparkline/sparkline';

const POLL_MS = 2500;
const HISTORY = 40;

@Component({
  selector: 'app-stats-dashboard',
  imports: [DecimalPipe, Sparkline],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './stats-dashboard.html',
  styleUrl: './stats-dashboard.css',
})
export class StatsDashboard {
  private readonly api = inject(ApiService);

  readonly stats = signal<StatsResponse | null>(null);
  readonly error = signal<string | null>(null);
  readonly history = signal<number[]>([]);

  constructor() {
    interval(POLL_MS)
      .pipe(
        startWith(0),
        switchMap(() => this.api.getCacheStats(true).pipe(catchError((e: AppError) => of(e)))),
        takeUntilDestroyed(),
      )
      .subscribe((res) => {
        if ('hits' in res) {
          this.stats.set(res);
          this.error.set(null);
          this.history.update((h) => [...h, res.hitRate].slice(-HISTORY));
        } else {
          this.error.set(res.status === 503 ? 'Self-Redis unavailable (503)' : res.message);
        }
      });
  }
}
