import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { ToastService } from '../toast.service';
import { AppError } from '../models';

// Default human-readable texts per HTTP status (the backend message takes priority).
const MESSAGES: Record<number, string> = {
  400: 'Bad request',
  404: 'Not found',
  409: 'State conflict',
  410: 'Hold expired (GONE)',
  429: 'Too many requests — slow down',
  503: 'Hot-state store unavailable, please retry',
};

/**
 * Centralized error mapping: HttpErrorResponse -> AppError {status,message},
 * plus a global toast. No auto-retries (to avoid spawning Idempotency-Keys and
 * hammering the rate limit).
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const toast = inject(ToastService);
  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      const status = err.status;
      const backendMessage =
        err.error && typeof err.error === 'object' && typeof err.error.message === 'string'
          ? (err.error.message as string)
          : undefined;
      const message =
        status === 0
          ? 'No connection to the server (network / CORS / proxy)'
          : backendMessage ?? MESSAGES[status] ?? `Error ${status}`;

      toast.push(message, status >= 500 || status === 0 ? 'error' : 'warn');

      const appError: AppError = { status, message };
      return throwError(() => appError);
    }),
  );
};
