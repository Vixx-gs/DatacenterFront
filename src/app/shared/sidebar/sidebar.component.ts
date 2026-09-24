import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Subscription } from 'rxjs';
import { DataService, NavItem } from '../../core/data.service';
import { AuthService } from '../../core/auth.service';
import { UiService } from '../../core/ui.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent implements OnInit, OnDestroy {
  open = true;
  mobileOpen = false;
  navItems: (NavItem & { safeSvg: SafeHtml })[];
  private sub!: Subscription;

  constructor(
    public router: Router,
    private data: DataService,
    private sanitizer: DomSanitizer,
    private auth: AuthService,
    private ui: UiService
  ) {
    this.navItems = data.navItems.map(item => ({
      ...item,
      safeSvg: this.sanitizer.bypassSecurityTrustHtml(item.svg)
    }));
  }

  ngOnInit() {
    this.sub = this.ui.mobileNavOpen$.subscribe(v => this.mobileOpen = v);
  }

  ngOnDestroy() { this.sub.unsubscribe(); }

  toggle() { this.open = !this.open; }

  closeMobile() { this.ui.closeMobileNav(); }

  onNavClick() {
    if (this.ui.isMobile) this.ui.closeMobileNav();
  }

  get isAdmin(): boolean { return this.auth.usuario === 'admin'; }

  logout() { this.auth.logout(); }

  isActive(route: string): boolean {
    return this.router.isActive(route, {
      paths: 'exact', queryParams: 'ignored',
      fragment: 'ignored', matrixParams: 'ignored'
    });
  }
}