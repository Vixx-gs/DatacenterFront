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
        // El backend responde 403 fuera de horario y 401 si falta el token o
        // ha caducado. Sin sesión (p. ej. en la pantalla de login) un 401 es
        // normal y no debe mostrar el aviso de horario.
        if (err.status === 403) {
          this.auth.logout('horario');
        } else if (err.status === 401 && token) {
          this.auth.logout();
        }
        return throwError(() => err);
      })
    );
  }
}
