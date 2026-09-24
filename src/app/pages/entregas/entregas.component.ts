import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { RefreshService } from '../../core/refresh.service';
import { Subscription } from 'rxjs';

const MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

@Component({
    selector: 'app-entregas',
    templateUrl: './entregas.component.html',
})
export class EntregasComponent implements OnInit, OnDestroy {
    meses = MESES;
    aniosDisp: number[] = [];
    mesActual = new Date().getMonth() + 1;
    anioActual = new Date().getFullYear();
    mesSelec = this.mesActual;
    anioSelec = this.anioActual;

    entradas: any[] = [];
    salidas: any[] = [];
    loading = true;
    private sub: Subscription | null = null;

    constructor(private api: ApiService, private router: Router, private refresh: RefreshService) {
        const hoy = new Date().getFullYear();
        for (let y = hoy; y >= 2020; y--) this.aniosDisp.push(y);
    }

    ngOnInit() {
        this.load();
        this.sub = this.refresh.refresh$.subscribe(() => this.load());
    }

    ngOnDestroy() { this.sub?.unsubscribe(); }

    load() {
        this.loading = true;
        this.api.getEntradas(this.mesSelec, this.anioSelec).subscribe({
            next: (d) => { this.entradas = d; this.loading = false; },
            error: () => { this.entradas = []; this.loading = false; }
        });
        this.api.getSalidas(this.mesSelec, this.anioSelec).subscribe({
            next: (d) => { this.salidas = d; },
            error: () => { this.salidas = []; }
        });
    }

    irAVehiculo(m: string) { this.router.navigate(['/vehiculos', m]); }
    irAConductor(id: string) { this.router.navigate(['/conductores', id]); }

    exportarCSV() {
        const esc = (v: any) => `"${String(v ?? '').replace(/"/g, '""')}"`;
        const hdr = ['Matrícula', 'Conductor', 'Fecha', 'Acción'];
        const filasEnt = this.entradas.map(e => [e.vehiculo_id, e.conductor, e.fecha, e.accion].map(esc).join(','));
        const filasSal = this.salidas.map(s => [s.vehiculo_id, s.conductor, s.fecha, s.accion].map(esc).join(','));
        const csv = '﻿ENTRADAS\r\n' + [hdr.map(esc).join(','), ...filasEnt].join('\r\n')
            + '\r\n\r\nSALIDAS\r\n' + [hdr.map(esc).join(','), ...filasSal].join('\r\n');
        const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' })), download: `entregas_${this.tituloMes.replace(/ /g, '_')}.csv` });
        a.click();
    }

    get tituloMes(): string {
        return `${MESES[this.mesSelec - 1]} ${this.anioSelec}`;
    }
}