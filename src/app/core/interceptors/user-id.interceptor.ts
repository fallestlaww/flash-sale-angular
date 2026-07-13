import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { UserService } from '../user.service';

export const userIdInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.url.includes('/orders')) {
    const userService = inject(UserService);
    req = req.clone({
      setHeaders: { 'X-User-Id': String(userService.currentUserId()) },
    });
  }
  return next(req);
};
