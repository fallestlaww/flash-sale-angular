import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { ApiService } from '../../core/api.service';
import { UserService } from '../../core/user.service';
import { ToastService } from '../../core/toast.service';

interface ScenarioResult {
  title: string;
  total: number;
  ok: number;
  conflict: number;
  rateLimited: number;
  other: number;
}

@Component({
  selector: 'app-demo',
  imports: [FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './demo.html',
  styleUrl: './demo.css',
})
export class Demo {
  private readonly api = inject(ApiService);
  private readonly userService = inject(UserService);
  private readonly toast = inject(ToastService);

  eventId: number | null = null;
  qty = 1;
  oversellN = 200;
  oversellUsers = 50;
  spamN = 25;

  readonly oversellRunning = signal(false);
  readonly rateRunning = signal(false);
  readonly oversellResult = signal<ScenarioResult | null>(null);
  readonly rateResult = signal<ScenarioResult | null>(null);

  runOversell(): void {
    const eventId = this.validEventId();
    if (eventId === null || this.oversellRunning()) {
      return;
    }
    const n = Math.max(1, Math.trunc(this.oversellN));
    const users = Math.max(1, Math.trunc(this.oversellUsers));
    const qty = Math.max(1, Math.trunc(this.qty));
    this.oversellRunning.set(true);
    this.oversellResult.set(null);
    const reqs = Array.from({ length: n }, (_, i) =>
      this.api.createOrderRaw((i % users) + 1, { eventId, qty }, crypto.randomUUID()),
    );
    forkJoin(reqs).subscribe((statuses) => {
      this.oversellResult.set(this.tally('Oversell', statuses));
      this.oversellRunning.set(false);
    });
  }

  runRateLimit(): void {
    const eventId = this.validEventId();
    if (eventId === null || this.rateRunning()) {
      return;
    }
    const n = Math.max(1, Math.trunc(this.spamN));
    const qty = Math.max(1, Math.trunc(this.qty));
    const userId = this.userService.currentUserId();
    this.rateRunning.set(true);
    this.rateResult.set(null);
    const reqs = Array.from({ length: n }, () =>
      this.api.createOrderRaw(userId, { eventId, qty }, crypto.randomUUID()),
    );
    forkJoin(reqs).subscribe((statuses) => {
      this.rateResult.set(this.tally(`Rate-limit (user ${userId})`, statuses));
      this.rateRunning.set(false);
    });
  }

  private validEventId(): number | null {
    const id = this.eventId;
    if (id === null || !Number.isFinite(id) || id <= 0) {
      this.toast.push('Set a valid event id first', 'warn');
      return null;
    }
    return Math.trunc(id);
  }

  private tally(title: string, statuses: number[]): ScenarioResult {
    const r: ScenarioResult = {
      title,
      total: statuses.length,
      ok: 0,
      conflict: 0,
      rateLimited: 0,
      other: 0,
    };
    for (const s of statuses) {
      if (s === 201) {
        r.ok++;
      } else if (s === 409) {
        r.conflict++;
      } else if (s === 429) {
        r.rateLimited++;
      } else {
        r.other++;
      }
    }
    return r;
  }
}
