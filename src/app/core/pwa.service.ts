import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class PwaService {
  private _prompt = new BehaviorSubject<any>(null);
  prompt$ = this._prompt.asObservable();

  constructor() {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this._prompt.next(e);
    });
  }

  async install(): Promise<boolean> {
    const prompt = this._prompt.value;
    if (!prompt) return false;
    prompt.prompt();
    const { outcome } = await prompt.userChoice;
    this._prompt.next(null);
    return outcome === 'accepted';
  }

  clearPrompt() { this._prompt.next(null); }
}
