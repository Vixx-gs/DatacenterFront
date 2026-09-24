import { Component } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { PwaService } from './core/pwa.service';

@Component({
  selector: 'app-root',
  template: `
    <ng-container *ngIf="!isLoginPage">
      <div class="app-layout">
        <app-sidebar></app-sidebar>
        <div class="app-main">
          <app-topbar></app-topbar>
          <main class="app-content">
            <router-outlet></router-outlet>
          </main>
        </div>
      </div>
    </ng-container>
    <ng-container *ngIf="isLoginPage">
      <router-outlet></router-outlet>
    </ng-container>
    <app-pwa-install></app-pwa-install>
  `,
  styles: [`
    :host { display: block; height: 100vh; overflow: hidden; }
    .app-layout { display: flex; height: 100vh; overflow: hidden; }
    .app-main { flex: 1; min-width: 0; display: flex; flex-direction: column; height: 100vh; overflow: hidden; }
    .app-content { flex: 1; overflow-y: auto; overflow-x: hidden; min-height: 0; padding: 24px 28px; }
    @media (max-width: 768px) {
      .app-content { padding: 16px 14px; }
    }
  `]
})
export class AppComponent {
  isLoginPage = false;

  constructor(private router: Router, private pwa: PwaService) {
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd)
    ).subscribe((e: any) => {
      this.isLoginPage = e.url.startsWith('/login');
    });
  }
}
