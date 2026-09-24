import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private base = environment.apiUrl;
  private _token: string | null = null;  // Token en memoria, NO en localStorage
  private _usuario: string | null = null;
  private inactivityTimer: any;
  private readonly INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutos

  constructor(private http: HttpClient, private router: Router) {
    this.resetInactivityTimer();
    ['click', 'keypress', 'mousemove', 'scroll'].forEach(ev =>
      document.addEventListener(ev, () => this.resetInactivityTimer())
    );
  }

  login(usuario: string, password: string): Observable<any> {
    return this.http.post(`${this.base}/auth/login`, { usuario, password }).pipe(
      tap((res: any) => {
        this._token = res.token;
        this._usuario = res.usuario;
        this.resetInactivityTimer();
      })
    );
  }

  logout(reason?: 'inactivity' | 'horario') {
    this._token = null;
    this._usuario = null;
    clearTimeout(this.inactivityTimer);
    if (reason === 'inactivity') {
      this.router.navigate(['/login'], { queryParams: { reason: 'inactivity' } });
    } else if (reason === 'horario') {
      this.router.navigate(['/login'], { queryParams: { reason: 'horario' } });
    } else {
      this.router.navigate(['/login']);
    }
  }

  get token(): string | null { return this._token; }
  get usuario(): string | null { return this._usuario; }
  get isLoggedIn(): boolean { return !!this._token; }

  private resetInactivityTimer() {
    clearTimeout(this.inactivityTimer);
    if (this._token) {
      this.inactivityTimer = setTimeout(() => {
        this.logout('inactivity');
      }, this.INACTIVITY_TIMEOUT);
    }
  }
}
