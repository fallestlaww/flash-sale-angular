import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-hold-timer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<span class="hold-timer" [class.expiring]="seconds() <= 30">⏳ {{ label() }}</span>`,
  styles: `
    .hold-timer {
      font-variant-numeric: tabular-nums;
      font-weight: 600;
      color: var(--text-muted);
    }
    .expiring {
      color: var(--warn);
    }
  `,
})
export class HoldTimer {
  readonly seconds = input.required<number>();

  readonly label = computed(() => {
    const s = Math.max(0, this.seconds());
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  });
}
