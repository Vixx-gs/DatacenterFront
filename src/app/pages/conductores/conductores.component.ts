import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { DataService } from '../../core/data.service';

@Component({
  selector: 'app-conductores',
  templateUrl: './conductores.component.html',
  styleUrls: ['./conductores.component.scss']
})
export class ConductoresComponent implements OnInit {
  conductores: any[] = [];
  exSocios: any[] = [];
  filtered: any[] = [];
  filteredEx: any[] = [];
  loading = true;
  loadingEx = true;
  filterEmpresa = 'TODOS';
  filterEmpresaEx = 'TODOS';
  searchVal = '';
  searchValEx = '';
  mostrarExSocios = false;
  desdeVal = '';
  hastaVal = '';
  sortDir: 'asc' | 'desc' | null = null;

  constructor(private api: ApiService, private data: DataService, private router: Router) { }

  ngOnInit() {
    this.api.getConductores().subscribe({
      next: (d) => { this.conductores = d; this.applyFiltros(); this.loading = false; },
      error: () => { this.loading = false; }
    });
    this.api.getExSocios().subscribe({
      next: (d) => { this.exSocios = d; this.filteredEx = [...d]; this.loadingEx = false; },
      error: () => { this.loadingEx = false; }
    });
  }

  parseFecha(f: string): Date | null {
    if (!f) return null;
    const s = f.trim().split(' ')[0];
    if (s.includes('-')) return new Date(s);
    const parts = s.split('/');
    if (parts.length === 3) return new Date(+parts[2], +parts[1] - 1, +parts[0]);
    return null;
  }

  estabaActivo(c: any, desde: Date, hasta: Date): boolean {
    const fi = this.parseFecha(c.fecha_prevista || c.fecha_inicio);
    const fb = this.parseFecha(c.fecha_baja);
    if (!fi) return false;
    if (fi > hasta) return false;
    if (fb && fb < desde) return false;
    return true;
  }

  toggleSort() {
    if (!this.sortDir || this.sortDir === 'desc') this.sortDir = 'asc';
    else this.sortDir = 'desc';
    this.applyFiltros();
  }

  sortByFecha(arr: any[]): any[] {
    if (!this.sortDir) return arr;
    return [...arr].sort((a, b) => {
      const fa = this.parseFecha(a.fecha_prevista || a.fecha_inicio);
      const fb = this.parseFecha(b.fecha_prevista || b.fecha_inicio);
      if (!fa && !fb) return 0;
      if (!fa) return 1;
      if (!fb) return -1;
      return this.sortDir === 'asc' ? fa.getTime() - fb.getTime() : fb.getTime() - fa.getTime();
    });
  }

  applyFiltros() {
    const d = this.desdeVal ? new Date(this.desdeVal) : null;
    const h = this.hastaVal ? new Date(this.hastaVal) : null;
    const hayFecha = d || h;
    const desde = d || new Date(0);
    const hasta = h || new Date(9999, 11, 31);
    const q = this.searchVal.toLowerCase();

    let resultado: any[];
    if (hayFecha) {
      const todos = [...this.conductores, ...this.exSocios];
      resultado = todos.filter(c => {
        const matchEmpresa = this.filterEmpresa === 'TODOS' || (c.empresa || '').toUpperCase() === this.filterEmpresa;
        const matchSearch = !q || (c.nombre || '').toLowerCase().includes(q) || (c.nif || '').toLowerCase().includes(q);
        return matchEmpresa && matchSearch && this.estabaActivo(c, desde, hasta);
      });
    } else {
      resultado = this.conductores.filter(c => {
        const matchEmpresa = this.filterEmpresa === 'TODOS' || (c.empresa || '').toUpperCase() === this.filterEmpresa;
        const matchSearch = !q || (c.nombre || '').toLowerCase().includes(q) || (c.nif || '').toLowerCase().includes(q);
        return matchEmpresa && matchSearch;
      });
    }
    this.filtered = this.sortByFecha(resultado);
  }

  applyFiltrosEx() {
    const q = this.searchValEx.toLowerCase();
    this.filteredEx = this.exSocios.filter(c => {
      const matchEmpresa = this.filterEmpresaEx === 'TODOS' || (c.empresa || '').toUpperCase() === this.filterEmpresaEx;
      const matchSearch = !q || (c.nombre || '').toLowerCase().includes(q) || (c.nif || '').toLowerCase().includes(q);
      return matchEmpresa && matchSearch;
    });
  }

  setFilterEmpresa(e: string) { this.filterEmpresa = e; this.applyFiltros(); }
  setFilterEmpresaEx(e: string) { this.filterEmpresaEx = e; this.applyFiltrosEx(); }
  toggleExSocios() { this.mostrarExSocios = !this.mostrarExSocios; }

  formatFecha(f: string): string {
    if (!f) return '-';
    return f.split(' ')[0].split('T')[0];
  }

  getVehiculos(c: any): string[] {
    if (!c.vehiculo) return [];
    return c.vehiculo.split(',').map((v: string) => v.trim()).filter(Boolean);
  }

  get hayFiltroFecha(): boolean { return !!(this.desdeVal || this.hastaVal); }

  irAFicha(c: any) { this.router.navigate(['/conductores', c.id]); }
  onSearch(q: string) { this.searchVal = q; this.applyFiltros(); }
  onSearchEx(q: string) { this.searchValEx = q; this.applyFiltrosEx(); }
  coopClass(e: string) { return this.data.coopClass(e); }

  exportarCSV() {
    const lista = this.mostrarExSocios ? this.filteredEx : this.filtered;
    const nombre = this.mostrarExSocios ? 'ex-socios' : 'socios';
    const headers = ['Nombre', 'Apellidos', 'NIF', 'Móvil', 'Email', 'Empresa', 'Gestor', 'F. Alta', 'F. Baja'];
    const esc = (v: any) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const filas = lista.map(c => [
      c.nombre, c.apellidos, c.nif, c.movil, c.email, c.empresa, c.gestor, c.fecha_prevista || c.fecha_inicio, c.fecha_baja
    ].map(esc).join(','));
    const csv = '﻿' + [headers.map(esc).join(','), ...filas].join('\r\n');
    const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' })), download: `${nombre}_${new Date().toISOString().split('T')[0]}.csv` });
    a.click();
  }
}