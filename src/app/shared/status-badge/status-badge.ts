import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { OrderStatus } from '../../core/models';

@Component({
  selector: 'app-status-badge',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<span class="badge" [class]="'badge--' + status().toLowerCase()">{{ status() }}</span>`,
  styles: `
    .badge {
      display: inline-block;
      padding: 0.15rem 0.5rem;
      border-radius: 999px;
      font-size: 0.72rem;
      font-weight: 700;
      letter-spacing: 0.02em;
    }
    .badge--held {
      background: #e8efff;
      color: #2563eb;
    }
    .badge--paid {
      background: #e7f6ec;
      color: #16a34a;
    }
    .badge--cancelled {
      background: #f0f2f5;
      color: #6b7280;
    }
    .badge--expired {
      background: #fdecec;
      color: #dc2626;
    }
  `,
})
export class StatusBadge {
  readonly status = input.required<OrderStatus>();
}
