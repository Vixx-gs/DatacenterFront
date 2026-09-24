import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { DataService } from '../../core/data.service';
import { RefreshService } from '../../core/refresh.service';
import { Subscription } from 'rxjs';
import { catchError, of } from 'rxjs';

@Component({
    selector: 'app-gps',
    templateUrl: './gps.component.html',
})
export class GpsComponent implements OnInit, OnDestroy {
    vehiculos: any[] = [];
    filtered: any[] = [];
    loading = true;
    searchVal = '';
    filterCoop = 'TODOS';
    filterGps = 'TODOS';
    gpsOpciones: string[] = [];
    private sub: Subscription | null = null;

    constructor(private api: ApiService, private router: Router, private refresh: RefreshService, public data: DataService) { }

    ngOnInit() {
        this.load();
        this.sub = this.refresh.refresh$.subscribe(() => this.load());
    }

    ngOnDestroy() { this.sub?.unsubscribe(); }

    load() {
        this.loading = true;
        this.api.getGps().pipe(catchError(() => of([]))).subscribe({
            next: (res) => {
                this.vehiculos = res;
                const gpsSet = new Set<string>(res.map((v: any) => v.gps).filter((g: string) => g));
                this.gpsOpciones = Array.from(gpsSet).sort();
                this.applyFilters();
                this.loading = false;
            },
            error: () => { this.loading = false; }
        });
    }

    applyFilters() {
        const q = this.searchVal.toLowerCase();
        this.filtered = this.vehiculos.filter(v => {
            const matchCoop = this.filterCoop === 'TODOS' || (v.destinado_a || '').toUpperCase() === this.filterCoop;
            const matchGps = this.filterGps === 'TODOS' || (this.filterGps === 'SIN_GPS' ? !(v.gps || '').trim() : (v.gps || '') === this.filterGps);
            const matchSearch = !q || v.matricula?.toLowerCase().includes(q) || v.marca?.toLowerCase().includes(q) || (v.conductor_actual || '').toLowerCase().includes(q) || (v.gps || '').toLowerCase().includes(q);
            return matchCoop && matchGps && matchSearch;
        });
    }

    setFilter(f: string) { this.filterCoop = f; this.applyFilters(); }
    setFilterGps(g: string) { this.filterGps = g; this.applyFilters(); }
    onSearch(val: string) { this.searchVal = val; this.applyFilters(); }
    irAVehiculo(m: string) { this.router.navigate(['/vehiculos', m]); }
    coopClass(e: string) { return this.data.coopClass(e); }

    exportarCSV() {
        const esc = (v: any) => `"${String(v ?? '').replace(/"/g, '""')}"`;
        const hdr = ['Matrícula', 'Marca', 'Modelo', 'Destinado a', 'Conductor', 'GPS'];
        const filas = this.filtered.map(v => [v.matricula, v.marca, v.modelo, v.destinado_a, v.conductor_actual, v.gps].map(esc).join(','));
        const csv = '﻿' + [hdr.map(esc).join(','), ...filas].join('\r\n');
        const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' })), download: `gps_${new Date().toISOString().split('T')[0]}.csv` });
        a.click();
    }
}
