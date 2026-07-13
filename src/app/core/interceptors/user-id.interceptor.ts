import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { UserService } from '../user.service';

export const userIdInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.url.includes('/orders') && !req.headers.has('X-User-Id')) {
    const userService = inject(UserService);
    req = req.clone({
      setHeaders: { 'X-User-Id': String(userService.currentUserId()) },
    });
  }
  return next(req);
};
