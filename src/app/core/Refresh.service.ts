import { Injectable, OnDestroy } from '@angular/core';
import { Subject, interval, Subscription } from 'rxjs';

const REFRESH_MS = 5 * 60 * 1000; // 5 minutos

@Injectable({ providedIn: 'root' })
export class RefreshService implements OnDestroy {
    private _refresh$ = new Subject<void>();
    private timer: Subscription;

    readonly refresh$ = this._refresh$.asObservable();

    constructor() {
        this.timer = interval(REFRESH_MS).subscribe(() => {
            this._refresh$.next();
        });
    }

    ngOnDestroy() {
        this.timer?.unsubscribe();
        this._refresh$.complete();
    }
}