import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-event-detail',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="page">
      <h1>Event #{{ id() }}</h1>
      <p class="muted">FE-0 skeleton. Details + reservation arrive in phases FE-1/FE-2.</p>
    </section>
  `,
})
export class EventDetail {
  // Bound to :id via withComponentInputBinding() in app.config.
  readonly id = input<string>();
}
