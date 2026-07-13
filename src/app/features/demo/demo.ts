import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-demo',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="page">
      <h1>Demo lab</h1>
      <p class="muted">FE-0 skeleton. Oversell / rate-limit / idempotency arrive in phase FE-4.</p>
    </section>
  `,
})
export class Demo {}
