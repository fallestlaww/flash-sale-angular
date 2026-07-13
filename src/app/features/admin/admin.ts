import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-admin',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="page">
      <h1>Admin</h1>
      <p class="muted">FE-0 skeleton. Event creation — FE-1; metrics dashboard — FE-4.</p>
    </section>
  `,
})
export class Admin {}
