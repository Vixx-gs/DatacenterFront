import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { DataService } from '../../core/data.service';
import { RefreshService } from '../../core/refresh.service';
import { Subscription, forkJoin } from 'rxjs';
import { catchError, of } from 'rxjs';

@Component({
    selector: 'app-itv',
    templateUrl: './itv.component.html',
})
export class ItvComponent implements OnInit, OnDestroy {
    vehiculos: any[] = [];
    filtered: any[] = [];
    proximas: any[] = [];
    filteredProximas: any[] = [];
    loading = true;
    searchVal = '';
    filterCoop = 'TODOS';
    sortDir: 'asc' | 'desc' | null = null;
    sortDirProximas: 'asc' | 'desc' | null = null;
    private sub: Subscription | null = null;

    constructor(private api: ApiService, private router: Router, private refresh: RefreshService, public data: DataService) { }

    ngOnInit() {
        this.load();
        this.sub = this.refresh.refresh$.subscribe(() => this.load());
    }

    ngOnDestroy() { this.sub?.unsubscribe(); }

    load() {
        this.loading = true;
        forkJoin({
            caducadas: this.api.getItvCaducadas().pipe(catchError(() => of([]))),
            proximas: this.api.getItvProximas(30).pipe(catchError(() => of([]))),
        }).subscribe({
            next: (res) => {
                this.vehiculos = res.caducadas;
                this.proximas = res.proximas;
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
            const matchSearch = !q || v.matricula?.toLowerCase().includes(q) || v.marca?.toLowerCase().includes(q) || (v.conductor_actual || '').toLowerCase().includes(q);
            return matchCoop && matchSearch;
        });
        this.filtered = this.sortByField(this.filtered, 'dias_caducada', this.sortDir);

        this.filteredProximas = this.proximas.filter(v => {
            const matchCoop = this.filterCoop === 'TODOS' || (v.destinado_a || '').toUpperCase() === this.filterCoop;
            const matchSearch = !q || v.matricula?.toLowerCase().includes(q) || v.marca?.toLowerCase().includes(q) || (v.conductor_actual || '').toLowerCase().includes(q);
            return matchCoop && matchSearch;
        });
        this.filteredProximas = this.sortByField(this.filteredProximas, 'dias_restantes', this.sortDirProximas);
    }

    toggleSort() {
        if (!this.sortDir || this.sortDir === 'desc') this.sortDir = 'asc';
        else this.sortDir = 'desc';
        this.applyFilters();
    }

    toggleSortProximas() {
        if (!this.sortDirProximas || this.sortDirProximas === 'desc') this.sortDirProximas = 'asc';
        else this.sortDirProximas = 'desc';
        this.applyFilters();
    }

    sortByField(arr: any[], field: string, dir: 'asc' | 'desc' | null): any[] {
        if (!dir) return arr;
        return [...arr].sort((a, b) => {
            if (a[field] == null && b[field] == null) return 0;
            if (a[field] == null) return 1;
            if (b[field] == null) return -1;
            return dir === 'asc' ? a[field] - b[field] : b[field] - a[field];
        });
    }

    setFilter(f: string) { this.filterCoop = f; this.applyFilters(); }
    onSearch(val: string) { this.searchVal = val; this.applyFilters(); }
    irAVehiculo(m: string) { this.router.navigate(['/vehiculos', m]); }
    coopClass(e: string) { return this.data.coopClass(e); }

    exportarCSV() {
        const esc = (v: any) => `"${String(v ?? '').replace(/"/g, '""')}"`;
        const hdrCad = ['Matrícula', 'Marca', 'Modelo', 'Destinado a', 'Conductor', 'Fecha ITV', 'Días caducada'];
        const filasCad = this.filtered.map(v => [v.matricula, v.marca, v.modelo, v.destinado_a, v.conductor_actual, v.fecha_itv, v.dias_caducada].map(esc).join(','));
        const hdrProx = ['Matrícula', 'Marca', 'Modelo', 'Destinado a', 'Conductor', 'Fecha ITV', 'Días restantes'];
        const filasProx = this.filteredProximas.map(v => [v.matricula, v.marca, v.modelo, v.destinado_a, v.conductor_actual, v.fecha_itv, v.dias_restantes].map(esc).join(','));
        const csv = '﻿' + [hdrCad.map(esc).join(','), ...filasCad, '', hdrProx.map(esc).join(','), ...filasProx].join('\r\n');
        const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' })), download: `itv_${new Date().toISOString().split('T')[0]}.csv` });
        a.click();
    }
}
