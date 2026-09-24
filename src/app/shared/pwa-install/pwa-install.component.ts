import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { PwaService } from '../../core/pwa.service';

@Component({
  selector: 'app-pwa-install',
  templateUrl: './pwa-install.component.html',
  styleUrls: ['./pwa-install.component.scss']
})
export class PwaInstallComponent implements OnInit, OnDestroy {
  showBanner = false;
  isIos = false;
  private sub!: Subscription;

  constructor(private pwa: PwaService) {}

  ngOnInit() {
    if (window.matchMedia('(display-mode: standalone)').matches) return;
    if ((window.navigator as any).standalone === true) return;
    if (localStorage.getItem('pwa-banner-dismissed')) return;

    const ua = navigator.userAgent.toLowerCase();
    this.isIos = /iphone|ipad|ipod/.test(ua) && !(window as any).MSStream;

    if (this.isIos) {
      // iOS: mostrar instrucciones tras 2s
      setTimeout(() => { this.showBanner = true; }, 2000);
    } else {
      // Android/Chrome: esperar evento beforeinstallprompt
      this.sub = this.pwa.prompt$.subscribe(prompt => {
        if (prompt) this.showBanner = true;
      });
    }
  }

  ngOnDestroy() { this.sub?.unsubscribe(); }

  async install() {
    await this.pwa.install();
    this.dismiss();
  }

  dismiss() {
    this.showBanner = false;
    localStorage.setItem('pwa-banner-dismissed', '1');
  }
}
