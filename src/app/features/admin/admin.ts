import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { CatalogService } from '../../core/catalog.service';
import { ToastService } from '../../core/toast.service';
import { EventResponse } from '../../core/models';

@Component({
  selector: 'app-admin',
  imports: [FormsModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './admin.html',
  styleUrl: './admin.css',
})
export class Admin {
  private readonly api = inject(ApiService);
  private readonly catalog = inject(CatalogService);
  private readonly toast = inject(ToastService);

  name = '';
  startsAt = '';
  totalStock: number | null = null;

  readonly submitting = signal(false);
  readonly created = signal<EventResponse | null>(null);

  submit(): void {
    const name = this.name.trim();
    if (!name) {
      this.toast.push('Name is required', 'warn');
      return;
    }
    if (!this.startsAt) {
      this.toast.push('Start time is required', 'warn');
      return;
    }
    if (this.totalStock === null || this.totalStock <= 0) {
      this.toast.push('Total stock must be greater than 0', 'warn');
      return;
    }

    const startsAtIso = new Date(this.startsAt).toISOString();
    this.submitting.set(true);
    this.api.createEvent({ name, startsAt: startsAtIso, totalStock: this.totalStock }).subscribe({
      next: (ev) => {
        this.catalog.addEventId(ev.id);
        this.created.set(ev);
        this.submitting.set(false);
        this.toast.push(`Event #${ev.id} created`, 'success');
        this.name = '';
        this.startsAt = '';
        this.totalStock = null;
      },
      error: () => this.submitting.set(false),
    });
  }
}
