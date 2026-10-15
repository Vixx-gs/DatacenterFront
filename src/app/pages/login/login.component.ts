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
    // Tras cerrar por inactividad u horario no se vuelve a entrar solo.
    if (reason) return;

    this.comprobandoPortal = true;
    this.auth.loginSso().subscribe({
      next: () => this.router.navigate(['/inicio']),
      error: (err) => {
        this.comprobandoPortal = false;
        if (err.status === 403 && /8:00/.test(err.error?.detail || '')) {
          this.sessionMsg = 'Acceso solo permitido de 8:00 a 18:00h.';
        }
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
