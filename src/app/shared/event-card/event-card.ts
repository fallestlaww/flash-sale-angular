import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { EventResponse } from '../../core/models';

@Component({
  selector: 'app-event-card',
  imports: [RouterLink, DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <a class="event-card" [routerLink]="['/events', event().id]">
      <div class="event-card__name">{{ event().name }}</div>
      <div class="event-card__row">
        <span>{{ event().startsAt | date: 'medium' }}</span>
        <span class="event-card__stock" [class.event-card__stock--out]="remaining() === 0">
          free: {{ remaining() }} / {{ event().totalStock }}
        </span>
      </div>
      <div class="event-card__hint">#{{ event().id }} · free after your holds/payments</div>
    </a>
  `,
  styles: `
    .event-card {
      display: block;
      padding: 0.9rem 1rem;
      border: 1px solid var(--border);
      border-radius: 10px;
      background: var(--surface);
      text-decoration: none;
      color: var(--text);
    }
    .event-card:hover {
      border-color: var(--accent);
    }
    .event-card__name {
      font-weight: 600;
      margin-bottom: 0.35rem;
    }
    .event-card__row {
      display: flex;
      justify-content: space-between;
      gap: 0.75rem;
      font-size: 0.9rem;
      color: var(--text-muted);
    }
    .event-card__stock {
      color: var(--accent);
      font-weight: 600;
    }
    .event-card__stock--out {
      color: #dc2626;
    }
    .event-card__hint {
      margin-top: 0.4rem;
      font-size: 0.75rem;
      color: var(--text-muted);
    }
  `,
})
export class EventCard {
  readonly event = input.required<EventResponse>();
  /** Free tickets left after the current user's active holds/payments. */
  readonly remaining = input.required<number>();
}
