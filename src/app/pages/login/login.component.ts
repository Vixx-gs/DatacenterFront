import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  usuario  = '';
  password = '';
  error    = '';
  loading  = false;
  showPassword = false;
  sessionMsg = '';
  // Mientras se comprueba la sesión del Portal del Empleado no se enseña el formulario.
  comprobandoPortal = false;
  // En *.gesticotrans.app solo se entra por el Portal del Empleado (sin formulario).
  get soloPortal() { return this.auth.soloPortal; }
  aviso = '';

  constructor(
    private auth: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    if (this.auth.isLoggedIn) {
      this.router.navigate(['/inicio']);
      return;
    }
    const reason = this.route.snapshot.queryParamMap.get('reason');
    if (reason === 'inactivity') {
      this.sessionMsg = 'Tu sesión ha expirado por inactividad. Por favor, inicia sesión de nuevo.';
    } else if (reason === 'horario') {
      this.sessionMsg = 'Acceso solo permitido de 8:00 a 18:00h. Tu sesión ha sido cerrada.';
    }
    // Tras cerrar por inactividad u horario se enseña el aviso (y el botón al portal).
    // Fuera de *.gesticotrans.app (.com, local) se usa el formulario de siempre.
    if (reason || !this.soloPortal) return;

    const pase = this.auth.tomarPase();
    if (!pase) {
      // Sin pase (URL escrita, marcador…): solo se entra desde el portal.
      this.comprobandoPortal = true;
      this.auth.irAlPortal();
      return;
    }
    this.comprobandoPortal = true;
    this.auth.loginSso(pase).subscribe({
      next: () => this.router.navigate(['/inicio']),
      error: (err) => {
        const detalle = err.error?.detail || '';
        if (err.status === 401) {
          this.auth.irAlPortal();
          return;
        }
        if (err.status === 403 && /8:00/.test(detalle)) {
          this.sessionMsg = 'Acceso solo permitido de 8:00 a 18:00h.';
        } else if (err.status === 403) {
          this.aviso = detalle || 'No tienes acceso a Datacenter.';
        } else {
          this.aviso = 'No se ha podido conectar con el Portal del Empleado. Inténtalo de nuevo en unos minutos.';
        }
        this.comprobandoPortal = false;
      }
    });
  }

  login() {
    if (!this.usuario || !this.password) {
      this.error = 'Introduce usuario y contraseña.';
      return;
    }
    this.loading = true;
    this.error   = '';

    this.auth.login(this.usuario, this.password).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/inicio']);
      },
      error: (err) => {
        this.loading = false;
        if (err.status === 403) {
          this.error = 'Acceso solo permitido de 8:00 a 18:00h.';
        } else if (err.status === 401) {
          this.error = 'Usuario o contraseña incorrectos.';
        } else {
          this.error = 'Error de conexión. Inténtalo de nuevo.';
        }
      }
    });
  }

  onKeyDown(e: KeyboardEvent) {
    if (e.key === 'Enter') this.login();
  }
}
