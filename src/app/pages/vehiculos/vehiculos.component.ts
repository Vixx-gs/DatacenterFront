import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { DataService } from '../../core/data.service';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

const COOPS_VALIDAS = new Set(['TRANSCOOP', 'ECOTRANSPORTE', 'CENTRALCOOP', 'ALQUITRUCK', 'SITTRANS', 'NEWTRANS', 'INDIA']);

@Component({ selector: 'app-vehiculos', templateUrl: './vehiculos.component.html', styleUrls: ['./vehiculos.component.scss'] })
export class VehiculosComponent implements OnInit {
  allVehiculos: any[] = [];
  filteredVehiculos: any[] = [];
  filterCoop = 'TODOS';
  loading = true;
  searchVal = '';
  bajasEstado: 'ocultar' | 'mostrar' | 'solo' = 'ocultar';

  constructor(private api: ApiService, private data: DataService, private router: Router) {}

  ngOnInit() {
    this.api.getVehiculos().subscribe({
      next: (data) => {
        this.allVehiculos = data.filter((v: any) => {
          const dest = (v.destinado_a || v.destinadoA || '').toUpperCase();
          const prop = (v.propiedad || '').toUpperCase();
          return COOPS_VALIDAS.has(dest) || prop === 'ALQUITRUCK';
        });
        this.applyFilters();
        this.loading = false;
        this.cargarUltimosConductores();
      },
      error: () => { this.allVehiculos = []; this.loading = false; }
    });
  }

  private cargarUltimosConductores() {
    const ultimos = this.allVehiculos.filter(v => v.tipo_conductor === 'ultimo' && v.matricula);
    if (ultimos.length === 0) return;
    const requests = ultimos.map(v =>
      this.api.getHistorialConductores(v.matricula).pipe(catchError(() => of([])))
    );
    forkJoin(requests).subscribe({
      next: (results: any[]) => {
        results.forEach((historial, i) => {
          const matricula = ultimos[i].matricula;
          const ordenado = (historial || []).sort((a: any, b: any) => {
            if (!a.fecha_fin) return -1;
            if (!b.fecha_fin) return 1;
            return new Date(b.fecha_fin).getTime() - new Date(a.fecha_fin).getTime();
          });
          const ultimo = this.encontrarUltimoValido(ordenado);
          if (ultimo) {
            const v = this.allVehiculos.find(x => x.matricula === matricula);
            if (v) {
              v.conductor_actual = ultimo.nombre;
              v.conductor_actual_id = ultimo.cliente_id;
            }
          }
        });
        this.applyFilters();
      }
    });
  }

  private encontrarUltimoValido(historial: any[]): any {
    if (!historial || historial.length === 0) return null;
    for (const h of historial) {
      if (h.fecha_fin && this.nombreValido(h.nombre)) {
        return h;
      }
    }
    return null;
  }

  private nombreValido(n: any): boolean {
    if (!n || typeof n !== 'string') return false;
    const t = n.trim();
    if (!t) return false;
    if (/^[\s\-–—‐‑‒]+$/.test(t)) return false;
    return true;
  }

  applyFilters() {
    this.filteredVehiculos = this.allVehiculos.filter(v => {
      const dest = (v.destinado_a || v.destinadoA || '').toUpperCase();
      const prop = (v.propiedad || '').toUpperCase();
      const matchCoop = this.filterCoop === 'TODOS' ||
        (this.filterCoop === 'ALQUITRUCK' ? prop === 'ALQUITRUCK' : dest === this.filterCoop);
      const q = this.searchVal.toLowerCase();
      const matchSearch = !q || v.matricula?.toLowerCase().includes(q) || v.marca?.toLowerCase().includes(q) || v.bastidor?.toLowerCase().includes(q) || v.modelo?.toLowerCase().includes(q);
      const esBaja = (v.estado || '').toUpperCase() === 'BAJA';
      const matchBaja = this.bajasEstado === 'solo' ? esBaja
        : this.bajasEstado === 'mostrar' ? true
        : !esBaja;
      return matchCoop && matchSearch && matchBaja;
    });
  }

  toggleBajas() {
    this.bajasEstado = this.bajasEstado === 'ocultar' ? 'mostrar'
      : this.bajasEstado === 'mostrar' ? 'solo'
      : 'ocultar';
    this.applyFilters();
  }
  irAFicha(m: string)   { this.router.navigate(['/vehiculos', m]); }
  setFilter(f: string)  { this.filterCoop = f; this.applyFilters(); }
  onSearch(val: string) { this.searchVal = val; this.applyFilters(); }
  badgeClass(v: string) { return this.data.badgeClass(v); }
  coopClass(e: string)  { return this.data.coopClass(e); }

  conductorValido(nombre: any): boolean {
    return this.nombreValido(nombre);
  }

  get totalBajas(): number {
    return this.allVehiculos.filter(v => (v.estado || '').toUpperCase() === 'BAJA').length;
  }

  exportarCSV() {
    const headers = ['Matrícula', 'Marca', 'Modelo', 'Bastidor', 'Fecha Mat.', 'Destinado a', 'Propiedad', 'Fecha ITV', 'Conductor'];
    const escape = (val: any) => `"${String(val ?? '').replace(/"/g, '""')}"`;
    const filas = this.filteredVehiculos.map(v => [
      v.matricula,
      v.marca,
      v.modelo,
      v.bastidor,
      v.fecha_mat || v.fechaMat,
      v.destinado_a || v.destinadoA,
      v.propiedad,
      v.itv,
      v.conductor_actual,
    ].map(escape).join(','));

    const csv = '﻿' + [headers.map(escape).join(','), ...filas].join('\r\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const sufijo = this.bajasEstado === 'solo' ? 'solo_bajas' : this.bajasEstado === 'mostrar' ? 'con_bajas' : 'activos';
    const a = document.createElement('a');
    a.href = url;
    a.download = `vehiculos_${sufijo}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }
}