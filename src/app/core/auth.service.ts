import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';

// En *.gesticotrans.app solo se entra pulsando la tarjeta de Datacenter en el
// portal, que añade un pase (?portal_launch=). Se guarda al cargar, antes de
// que el router redirija a /login, y se quita de la barra de direcciones.
const LAUNCH = new URLSearchParams(window.location.search).get('portal_launch');
if (LAUNCH) {
  sessionStorage.setItem('dc_launch', LAUNCH);
  const url = new URL(window.location.href);
  url.searchParams.delete('portal_launch');
  window.history.replaceState(null, '', url);
}

const SESION_KEY = 'dc_sesion';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private base = environment.apiUrl;
  private _token: string | null = null;  // Token en memoria, NO en localStorage
  private _usuario: string | null = null;
  private _rol: string | null = null;     // rol del portal (solo con SSO)
  private inactivityTimer: any;
  private readonly INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutos

  /** En *.gesticotrans.app solo se entra por el portal (sin formulario). */
  readonly soloPortal = window.location.hostname.endsWith('.gesticotrans.app');

  constructor(private http: HttpClient, private router: Router) {
    // En .app la sesión abierta desde el portal vive en esta pestaña (F5 la conserva;
    // una pestaña nueva o un marcador no).
    if (this.soloPortal) {
      try {
        const s = JSON.parse(sessionStorage.getItem(SESION_KEY) || 'null');
        if (s) { this._token = s.token; this._usuario = s.usuario; this._rol = s.rol; }
      } catch {}
    }
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

  /** Pase del portal recibido al abrir la app (se puede usar una sola vez). */
  tomarPase(): string | null {
    const pase = sessionStorage.getItem('dc_launch');
    sessionStorage.removeItem('dc_launch');
    return pase;
  }

  irAlPortal() {
    window.location.href = 'https://gesticotrans.app';
  }

  /** Entra con el pase del portal (y la cookie de sesión del portal). */
  loginSso(launch: string): Observable<any> {
    return this.http.post(`${this.base}/auth/sso`, { launch }).pipe(
      tap((res: any) => {
        this._token = res.token;
        this._usuario = res.usuario;
        this._rol = res.rol || null;
        sessionStorage.setItem(SESION_KEY, JSON.stringify({ token: res.token, usuario: res.usuario, rol: this._rol }));
        this.resetInactivityTimer();
      })
    );
  }

  /** Botón "Cerrar sesión": cierra la sesión de Datacenter y vuelve al portal. */
  salir() {
    this._token = null;
    this._usuario = null;
    sessionStorage.removeItem(SESION_KEY);
    clearTimeout(this.inactivityTimer);
    window.location.href = 'https://gesticotrans.app';
  }

  logout(reason?: 'inactivity' | 'horario') {
    this._token = null;
    this._usuario = null;
    sessionStorage.removeItem(SESION_KEY);
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
  /** admin | gestorT | gestor. Con el login antiguo se deduce de la cuenta compartida. */
  get rol(): string | null {
    if (this._rol) return this._rol;
    return this._usuario === 'admin' ? 'admin' : this._usuario ? 'gestor' : null;
  }
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
