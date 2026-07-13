import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-orders',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="page">
      <h1>My orders</h1>
      <p class="muted">FE-0 skeleton. Reserve/pay/cancel arrive in phase FE-2.</p>
    </section>
  `,
})
export class Orders {}
