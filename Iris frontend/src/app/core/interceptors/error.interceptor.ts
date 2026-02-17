import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { InteractionService } from '../services/interaction.service';
import { catchError, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const interact = inject(InteractionService);
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      const msg = error.error?.message || error.message || 'Server error';
      if (error.status !== 401) interact.error(msg);
      return throwError(() => error);
    })
  );
};