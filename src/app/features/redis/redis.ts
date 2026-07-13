import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Observable, catchError, concat, forkJoin, map, of, tap } from 'rxjs';
import { SelfRedisService } from '../../core/self-redis.service';
import { AppError } from '../../core/models';

interface LogEntry {
  id: number;
  ok: boolean;
  op: string;
  text: string;
}

interface Step {
  label: string;
  call: () => Observable<unknown>;
}

@Component({
  selector: 'app-redis',
  imports: [FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './redis.html',
  styleUrl: './redis.css',
})
export class Redis {
  private readonly redis = inject(SelfRedisService);

  key = 't:demo';
  value = 'hello';
  ttlSeconds: number | null = 60;
  mode: 'set' | 'nx' | 'xx' = 'set';
  by = 1;
  expected = 'HELD';
  casValue = 'PAID';
  expireTtl = 30;
  bulkN = 150;

  private seq = 0;
  readonly log = signal<LogEntry[]>([]);
  readonly bulkRunning = signal(false);

  doGet(): void {
    this.run(`GET ${this.key}`, this.redis.getKey(this.key));
  }

  doSet(): void {
    this.run(`SET ${this.key} (${this.mode})`, this.redis.set(this.key, this.value, this.ttlSeconds, this.mode));
  }

  doDelete(): void {
    this.run(`DELETE ${this.key}`, this.redis.del(this.key), '204 deleted');
  }

  doTtl(): void {
    this.run(`TTL ${this.key}`, this.redis.getTtl(this.key));
  }

  doExpire(): void {
    this.run(`EXPIRE ${this.key} ${this.expireTtl}s`, this.redis.expire(this.key, this.expireTtl));
  }

  doPersist(): void {
    this.run(`PERSIST ${this.key}`, this.redis.persist(this.key));
  }

  doIncr(): void {
    this.run(`INCR ${this.key} +${this.by}`, this.redis.increment(this.key, this.by));
  }

  doDecr(): void {
    this.run(`DECR ${this.key} -${this.by}`, this.redis.decrement(this.key, this.by));
  }

  doCas(): void {
    this.run(`CAS ${this.key} ${this.expected}->${this.casValue}`, this.redis.cas(this.key, this.expected, this.casValue));
  }

  doStats(): void {
    this.run('STATS', this.redis.stats());
  }

  doSize(): void {
    this.run('SIZE', this.redis.size());
  }

  doSnapshotSave(): void {
    this.run('SNAPSHOT save', this.redis.snapshotSave());
  }

  doSnapshotLoad(): void {
    this.run('SNAPSHOT load', this.redis.snapshotLoad());
  }

  doFlush(): void {
    if (!confirm('Flush ALL keys in Self-Redis? This wipes stock:/hold:/idem: too.')) {
      return;
    }
    this.run('FLUSH all', this.redis.flush(), '204 flushed');
  }

  bulkFill(): void {
    if (this.bulkRunning()) {
      return;
    }
    const n = Math.max(1, Math.trunc(this.bulkN));
    this.bulkRunning.set(true);
    this.push(true, `▶ BULK FILL ${n}`, 'firing set requests…');
    const reqs = Array.from({ length: n }, (_, i) =>
      this.redis.set(`bulk:${i}`, 'x', null, 'set').pipe(
        map(() => true),
        catchError(() => of(false)),
      ),
    );
    forkJoin(reqs).subscribe((results) => {
      const ok = results.filter(Boolean).length;
      this.push(true, `BULK FILL ${n}`, `${ok}/${n} set ok — check Stats (evictions) / Size`);
      this.bulkRunning.set(false);
      this.doStats();
      this.doSize();
    });
  }

  clearLog(): void {
    this.log.set([]);
  }

  run51(): void {
    this.scenario('5.1 set/get/ttl', [
      { label: 'PUT t:hello ttl60', call: () => this.redis.set('t:hello', 'world', 60, 'set') },
      { label: 'GET t:hello', call: () => this.redis.getKey('t:hello') },
      { label: 'GET ttl', call: () => this.redis.getTtl('t:hello') },
      { label: 'cleanup DEL', call: () => this.redis.del('t:hello') },
    ]);
  }

  run52(): void {
    this.scenario('5.2 nx idempotency', [
      { label: 'PUT nx order-1', call: () => this.redis.set('t:idem', 'order-1', null, 'nx') },
      { label: 'PUT nx order-2', call: () => this.redis.set('t:idem', 'order-2', null, 'nx') },
      { label: 'GET t:idem', call: () => this.redis.getKey('t:idem') },
      { label: 'cleanup DEL', call: () => this.redis.del('t:idem') },
    ]);
  }

  run53(): void {
    this.scenario('5.3 incr/decr', [
      { label: 'INCR +100', call: () => this.redis.increment('t:stock', 100) },
      { label: 'DECR -3', call: () => this.redis.decrement('t:stock', 3) },
      { label: 'cleanup DEL', call: () => this.redis.del('t:stock') },
    ]);
  }

  run54(): void {
    this.scenario('5.4 CAS', [
      { label: 'SET HELD', call: () => this.redis.set('t:cas', 'HELD', null, 'set') },
      { label: 'CAS HELD->PAID', call: () => this.redis.cas('t:cas', 'HELD', 'PAID') },
      { label: 'CAS HELD->PAID again', call: () => this.redis.cas('t:cas', 'HELD', 'PAID') },
      { label: 'GET t:cas', call: () => this.redis.getKey('t:cas') },
      { label: 'cleanup DEL', call: () => this.redis.del('t:cas') },
    ]);
  }

  run55(): void {
    this.scenario('5.5 expire/persist', [
      { label: 'SET t:exp', call: () => this.redis.set('t:exp', 'v', null, 'set') },
      { label: 'EXPIRE 30s', call: () => this.redis.expire('t:exp', 30) },
      { label: 'GET ttl', call: () => this.redis.getTtl('t:exp') },
      { label: 'PERSIST', call: () => this.redis.persist('t:exp') },
      { label: 'GET ttl', call: () => this.redis.getTtl('t:exp') },
      { label: 'cleanup DEL', call: () => this.redis.del('t:exp') },
    ]);
  }

  private scenario(title: string, steps: Step[]): void {
    this.push(true, `▶ ${title}`, 'running…');
    concat(
      ...steps.map((s) =>
        s.call().pipe(
          tap((r) => this.push(true, s.label, this.fmt(r))),
          catchError((e: AppError) => {
            this.push(false, s.label, `${e.status} ${e.message}`);
            return of(null);
          }),
        ),
      ),
    ).subscribe();
  }

  private run(op: string, obs: Observable<unknown>, okText?: string): void {
    obs.subscribe({
      next: (r) => this.push(true, op, okText ?? this.fmt(r)),
      error: (e: AppError) => this.push(false, op, `${e.status} ${e.message}`),
    });
  }

  private push(ok: boolean, op: string, text: string): void {
    const id = ++this.seq;
    this.log.update((l) => [{ id, ok, op, text }, ...l].slice(0, 100));
  }

  private fmt(r: unknown): string {
    return r === null || r === undefined ? '(no body)' : JSON.stringify(r);
  }
}
