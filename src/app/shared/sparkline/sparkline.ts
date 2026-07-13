import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-sparkline',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <svg class="spark" [attr.viewBox]="'0 0 ' + width + ' ' + height" preserveAspectRatio="none">
      @if (poly()) {
        <polyline [attr.points]="poly()" fill="none" stroke="currentColor" stroke-width="2" />
      }
    </svg>
  `,
  styles: `
    .spark {
      display: block;
      width: 100%;
      height: 48px;
      color: var(--accent);
    }
  `,
})
export class Sparkline {
  readonly values = input.required<number[]>();
  readonly width = 240;
  readonly height = 48;

  readonly poly = computed(() => {
    const vs = this.values();
    if (vs.length < 2) {
      return '';
    }
    const stepX = this.width / (vs.length - 1);
    return vs
      .map((v, i) => {
        const clamped = Math.max(0, Math.min(1, v));
        const x = i * stepX;
        const y = this.height - clamped * this.height;
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(' ');
  });
}
