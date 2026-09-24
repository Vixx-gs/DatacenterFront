import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { DataService } from '../../core/data.service';
import { RefreshService } from '../../core/refresh.service';
import { Subscription, forkJoin } from 'rxjs';
import { catchError, of } from 'rxjs';

@Component({
    selector: 'app-tacografo',
    templateUrl: './tacografo.component.html',
})
export class TacografoComponent implements OnInit, OnDestroy {
    caducadas: any[] = [];
    filteredCaducadas: any[] = [];
    proximas: any[] = [];
    filteredProximas: any[] = [];
    loading = true;
    error = false;
    searchVal = '';
    filterCoop = 'TODOS';
    sortDirCaducadas: 'asc' | 'desc' | null = null;
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
        this.error = false;
        forkJoin({
            caducadas: this.api.getTacografoCaducadas().pipe(catchError(() => of([]))),
            proximas: this.api.getTacografoProximas(30).pipe(catchError(() => of([]))),
        }).subscribe({
            next: (res) => {
                this.caducadas = res.caducadas;
                this.proximas = res.proximas;
                this.applyFilters();
                this.loading = false;
            },
            error: () => { this.loading = false; this.error = true; }
        });
    }

    applyFilters() {
        const q = this.searchVal.toLowerCase();
        const matchVehiculo = (v: any) => {
            const matchCoop = this.filterCoop === 'TODOS' || (v.destinado_a || '').toUpperCase() === this.filterCoop;
            const matchSearch = !q || v.matricula?.toLowerCase().includes(q) || v.marca?.toLowerCase().includes(q) || (v.conductor_actual || '').toLowerCase().includes(q);
            return matchCoop && matchSearch;
        };
        this.filteredCaducadas = this.sortByField(this.caducadas.filter(matchVehiculo), 'dias_caducada', this.sortDirCaducadas);
        this.filteredProximas = this.sortByField(this.proximas.filter(matchVehiculo), 'dias_restantes', this.sortDirProximas);
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

    toggleSortCaducadas() {
        if (!this.sortDirCaducadas || this.sortDirCaducadas === 'desc') this.sortDirCaducadas = 'asc';
        else this.sortDirCaducadas = 'desc';
        this.applyFilters();
    }

    toggleSortProximas() {
        if (!this.sortDirProximas || this.sortDirProximas === 'desc') this.sortDirProximas = 'asc';
        else this.sortDirProximas = 'desc';
        this.applyFilters();
    }

    setFilter(f: string) { this.filterCoop = f; this.applyFilters(); }
    onSearch(val: string) { this.searchVal = val; this.applyFilters(); }
    irAVehiculo(m: string) { this.router.navigate(['/vehiculos', m]); }
    coopClass(e: string) { return this.data.coopClass(e); }

    exportarCSV() {
        const esc = (v: any) => `"${String(v ?? '').replace(/"/g, '""')}"`;
        const hdrCad = ['Matrícula', 'Marca', 'Modelo', 'Destinado a', 'Conductor', 'Fecha Tacógrafo', 'Días caducada'];
        const filasCad = this.filteredCaducadas.map(v => [v.matricula, v.marca, v.modelo, v.destinado_a, v.conductor_actual, v.fecha_tacografo, v.dias_caducada].map(esc).join(','));
        const hdrProx = ['Matrícula', 'Marca', 'Modelo', 'Destinado a', 'Conductor', 'Fecha Tacógrafo', 'Días restantes'];
        const filasProx = this.filteredProximas.map(v => [v.matricula, v.marca, v.modelo, v.destinado_a, v.conductor_actual, v.fecha_tacografo, v.dias_restantes].map(esc).join(','));
        const csv = '﻿' + [hdrCad.map(esc).join(','), ...filasCad, '', hdrProx.map(esc).join(','), ...filasProx].join('\r\n');
        const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' })), download: `tacografo_${new Date().toISOString().split('T')[0]}.csv` });
        a.click();
    }
}
