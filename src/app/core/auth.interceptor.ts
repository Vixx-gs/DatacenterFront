import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpErrorResponse } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private auth: AuthService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler) {
    const token = this.auth.token;

    if (token) {
      req = req.clone({
        setHeaders: { Authorization: `Bearer ${token}` }
      });
    }

    return next.handle(req).pipe(
      catchError((err: HttpErrorResponse) => {
        // 401: falta el token o ha caducado (sin sesión, p. ej. en la pantalla de
        // login, un 401 es normal). Ya no hay horario de acceso: un 403 es un
        // permiso concreto y no cierra la sesión.
        if (err.status === 401 && token) {
          this.auth.logout();
        }
        return throwError(() => err);
      })
    );
  }
}
