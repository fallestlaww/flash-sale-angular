import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/api.service';
import { ToastService } from '../../core/toast.service';
import { EventResponse } from '../../core/models';

@Component({
  selector: 'app-catalog',
  imports: [FormsModule, JsonPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './catalog.html',
  styleUrl: './catalog.css',
})
export class Catalog {
  private readonly api = inject(ApiService);
  private readonly toast = inject(ToastService);

  // FE-0 smoke check: proves the whole HTTP stack works end-to-end
  // (proxy -> :8080, X-User-Id/error interceptors, ApiError mapping).
  probeId = 1;
  readonly loading = signal(false);
  readonly lastEvent = signal<EventResponse | null>(null);

  probe(): void {
    this.loading.set(true);
    this.lastEvent.set(null);
    this.api.getEvent(this.probeId).subscribe({
      next: (ev) => {
        this.lastEvent.set(ev);
        this.loading.set(false);
        this.toast.push(`OK: event #${ev.id} "${ev.name}"`, 'success');
      },
      error: () => {
        // The error toast was already shown by errorInterceptor.
        this.loading.set(false);
      },
    });
  }
}
