import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../core/api.service';
import { DataService } from '../../core/data.service';

@Component({ selector: 'app-contratos', templateUrl: './contratos.component.html' })
export class ContratosComponent implements OnInit {
  contratos: any[] = [];
  filtered: any[] = [];
  filtroTipo = 'TODOS';
  filtroEstado = 'ACTIVO';
  filtroCoop = 'TODOS';
  filtroGarantia = 'TODOS';
  tipos = ['TODOS', 'AOC', 'Alquiler', 'Botiquín'];
  estados = ['TODOS', 'ACTIVO', 'INACTIVO'];
  coops = ['TODOS', 'TRANSCOOP', 'ECOTRANSPORTE', 'CENTRALCOOP'];
  search = '';
  loading = true;
  garantiasMap: Record<string, any> = {};

  constructor(private api: ApiService, private data: DataService) { }

  ngOnInit() {
    this.api.getTodasGarantias().subscribe({
      next: (g) => { this.garantiasMap = g || {}; },
      error: () => { this.garantiasMap = {}; }
    });
    this.api.getContratos().subscribe({
      next: (data) => { this.contratos = data; this.applyFilters(); this.loading = false; },
      error: () => { this.contratos = []; this.filtered = []; this.loading = false; }
    });
  }

  tieneGarantia(matricula: string): boolean {
    const mat = (matricula || '').toUpperCase();
    const g = this.garantiasMap[mat];
    if (!g) return false;
    const tipo = (g.tipo_garantia || '').toLowerCase().trim();
    return tipo !== '' && tipo !== 'no tiene' && tipo !== '—';
  }

  isActivo(c: any): boolean {
    if (!c.fecha_fin) return true;
    const partes = c.fecha_fin.split('/');
    if (partes.length === 3) {
      const fin = new Date(+partes[2], +partes[1] - 1, +partes[0]);
      return fin >= new Date();
    }
    return true;
  }

  applyFilters() {
    this.filtered = this.contratos.filter(c => {
      const tipo = (c.tipo_contrato || c.tipo || '');
      // Filtro tipo — comparación flexible para Botiquín con/sin acento
      const matchTipo = this.filtroTipo === 'TODOS' ||
        tipo === this.filtroTipo ||
        (this.filtroTipo === 'Botiquín' && tipo.toLowerCase().includes('botiqu'));
      const activo = this.isActivo(c);
      const matchEstado = this.filtroEstado === 'TODOS' || (this.filtroEstado === 'ACTIVO' ? activo : !activo);
      const emp = (c.empresa_id || '').toUpperCase();
      const matchCoop = this.filtroCoop === 'TODOS' || emp === this.filtroCoop;
      const q = this.search.toLowerCase();
      const matchSearch = !q ||
        c.num_contrato?.toLowerCase().includes(q) ||
        c.vehiculo_id?.toLowerCase().includes(q) ||
        c.nombre_conductor?.toLowerCase().includes(q) ||
        c.empresa_id?.toLowerCase().includes(q);
      const conGar = this.tieneGarantia(c.vehiculo_id);
      const matchGarantia = this.filtroGarantia === 'TODOS' ||
        (this.filtroGarantia === 'CON' && conGar) ||
        (this.filtroGarantia === 'SIN' && !conGar);
      return matchTipo && matchEstado && matchCoop && matchSearch && matchGarantia;
    });
  }

  setFiltroTipo(t: string) { this.filtroTipo = t; this.applyFilters(); }
  setFiltroEstado(e: string) { this.filtroEstado = e; this.applyFilters(); }
  setFiltroCoop(c: string) { this.filtroCoop = c; this.applyFilters(); }
  setFiltroGarantia(g: string) { this.filtroGarantia = g; this.applyFilters(); }
  onSearch(q: string) { this.search = q; this.applyFilters(); }
  badgeClass(v: string) { return this.data.badgeClass(v); }
  coopClass(e: string) { return this.data.coopClass(e); }

  exportarCSV() {
    const headers = ['Nº Contrato', 'Tipo', 'Vehículo', 'Empresa', 'Conductor', 'F. Inicio', 'F. Fin', 'Nº Cuotas', 'Cuota Base', 'Condiciones', 'Fianza', 'Entrada', 'Valor Residual'];
    const escape = (val: any) => `"${String(val ?? '').replace(/"/g, '""')}"`;
    const filas = this.filtered.map(c => [
      c.num_contrato,
      c.tipo_contrato || c.tipo,
      c.vehiculo_id,
      c.empresa_id,
      c.nombre_conductor || c.cliente_id,
      c.fecha_inicio,
      c.fecha_fin,
      c.num_cuotas,
      c.cuota_base,
      c.condiciones,
      c.fianza,
      c.entrada,
      c.valor_residual,
    ].map(escape).join(','));

    const csv = '﻿' + [headers.map(escape).join(','), ...filas].join('\r\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `contratos_${this.filtroTipo}_${this.filtroEstado}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }
}