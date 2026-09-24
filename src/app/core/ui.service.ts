import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class UiService {
  private _mobileNavOpen = new BehaviorSubject(false);
  mobileNavOpen$ = this._mobileNavOpen.asObservable();

  get isMobile() { return window.innerWidth <= 768; }

  openMobileNav()  { this._mobileNavOpen.next(true); }
  closeMobileNav() { this._mobileNavOpen.next(false); }
  toggleMobileNav() { this._mobileNavOpen.next(!this._mobileNavOpen.value); }
}
