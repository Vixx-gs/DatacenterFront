import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../core/api.service';
import { DataService } from '../../core/data.service';

@Component({ selector: 'app-financieras', templateUrl: './financieras.component.html' })
export class FinancierasComponent implements OnInit {
  financieras: any[] = [];
  filtered:    any[] = [];
  filtroTipo   = 'TODOS';
  filtroCoop   = 'TODOS';
  filtroEstado = 'TODOS';
  tipos = ['TODOS', 'RENTING', 'LEASING', 'ALQUILER OC'];
  coops = ['TODOS', 'TRANSCOOP', 'ECOTRANSPORTE', 'CENTRALCOOP', 'ALQUITRUCK'];
  coopColors: Record<string, string> = {
    'TRANSCOOP':     '#0d3b3e',
    'ECOTRANSPORTE': '#18a04c',
    'CENTRALCOOP':   '#d4580a',
    'ALQUITRUCK':    '#7c3aed',
  };
  search = '';
  loading = true;

  constructor(private api: ApiService, private data: DataService) {}

  ngOnInit() {
    this.api.getFinancieras().subscribe({
      next: (data) => { this.financieras = data; this.applyFilters(); this.loading = false; },
      error: () => { this.financieras = []; this.filtered = []; this.loading = false; }
    });
  }

  applyFilters() {
    const hoy = new Date(); hoy.setHours(0, 0, 0, 0);
    const parseFecha = (s: string): Date | null => {
      if (!s) return null;
      // DD/MM/YYYY
      const m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
      if (m) return new Date(+m[3], +m[2] - 1, +m[1]);
      // YYYY-MM-DD
      const d = new Date(s);
      return isNaN(d.getTime()) ? null : d;
    };
    this.filtered = this.financieras.filter(f => {
      const matchTipo = this.filtroTipo === 'TODOS' || f.tipo?.toUpperCase() === this.filtroTipo;
      const emp = (f.empresa_id || '').toUpperCase();
      const matchCoop = this.filtroCoop === 'TODOS' || emp.includes(this.filtroCoop);
      const q = this.search.toLowerCase();
      const matchSearch = !q || f.num_contrato?.toLowerCase().includes(q) || f.vehiculo_id?.toLowerCase().includes(q) || f.financiera?.toLowerCase().includes(q) || f.empresa_id?.toLowerCase().includes(q);
      let matchEstado = true;
      if (this.filtroEstado !== 'TODOS') {
        const ff = parseFecha(f.fecha_fin);
        const activo = ff ? ff >= hoy : true;
        matchEstado = this.filtroEstado === 'ACTIVOS' ? activo : !activo;
      }
      return matchTipo && matchCoop && matchSearch && matchEstado;
    });
  }

  getCoopColor(coop: string): string { return this.coopColors[coop] || ''; }
  setFiltroTipo(t: string)   { this.filtroTipo = t;   this.applyFilters(); }
  setFiltroCoop(c: string)   { this.filtroCoop = c;   this.applyFilters(); }
  setFiltroEstado(e: string) { this.filtroEstado = e; this.applyFilters(); }
  onSearch(q: string)      { this.search = q;     this.applyFilters(); }
  badgeClass(v: string) { return this.data.badgeClass(v); }
  coopClass(e: string)  { return this.data.coopClass(e); }

  exportarCSV() {
    const headers = ['Nº Contrato', 'Vehículo', 'Empresa', 'Tipo', 'F. Inicio', 'F. Fin', 'Cuota Mensual', 'Nº Cuotas', 'Día Pago', 'Importe Fin.', 'Valor Residual', 'Financiera', 'Gastos Ini.', 'Fianzas', 'Entrada'];
    const esc = (v: any) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const filas = this.filtered.map(f => [
      f.num_contrato, f.vehiculo_id, f.empresa_id, f.tipo, f.fecha_inicio, f.fecha_fin,
      f.cuota_mensual, f.num_cuotas, f.dia_pago, f.importe_financiado, f.valor_residual,
      f.financiera, f.gastos_iniciales, f.fianzas, f.entrada
    ].map(esc).join(','));
    const csv = '﻿' + [headers.map(esc).join(','), ...filas].join('\r\n');
    const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' })), download: `financieras_${new Date().toISOString().split('T')[0]}.csv` });
    a.click();
  }
}
