import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../core/api.service';
import { DataService } from '../../core/data.service';

const ASEGURADORAS: Record<string, string> = {
  '599b5220': 'ZURICH',
  '60a6e753': 'MAPFRE',
  '8bb32e35': 'ALLIANZ',
};

@Component({ selector: 'app-seguros', templateUrl: './seguros.component.html' })
export class SegurosComponent implements OnInit {
  allSeguros: any[] = [];
  filtered: any[] = [];
  filtroTipo = 'TODOS';
  filtroCoop = 'TODOS';
  tipos = ['TODOS', 'CIRCULACION', 'ASISTENCIA', 'DAÑOS'];
  coops = ['TODOS', 'TRANSCOOP', 'ECOTRANSPORTE', 'CENTRALCOOP'];
  search = '';
  loading = true;

  constructor(private api: ApiService, private data: DataService) { }

  ngOnInit() {
    this.api.getSeguros().subscribe({
      next: (data) => { this.allSeguros = data; this.applyFilters(); this.loading = false; },
      error: () => { this.allSeguros = []; this.filtered = []; this.loading = false; }
    });
  }

  applyFilters() {
    this.filtered = this.allSeguros.filter(s => {
      const matchTipo = this.filtroTipo === 'TODOS' || s.tipo?.toUpperCase() === this.filtroTipo;
      const tom = (s.tomador || '').toUpperCase();
      const matchCoop = this.filtroCoop === 'TODOS' || tom === this.filtroCoop;
      const q = this.search.toLowerCase();
      const matchSearch = !q || s.poliza?.toLowerCase().includes(q) || s.matricula?.toLowerCase().includes(q) || s.tomador?.toLowerCase().includes(q) || this.resolveAseguradora(s.aseguradora).toLowerCase().includes(q);
      return matchTipo && matchCoop && matchSearch;
    });
  }

  resolveAseguradora(value: string): string {
    if (!value) return '—';
    const mapped = ASEGURADORAS[value.toLowerCase()];
    return mapped || value;
  }

  setFiltroTipo(t: string) { this.filtroTipo = t; this.applyFilters(); }
  setFiltroCoop(c: string) { this.filtroCoop = c; this.applyFilters(); }
  onSearch(q: string) { this.search = q; this.applyFilters(); }
  coopClass(e: string) { return this.data.coopClass(e); }

  exportarCSV() {
    const headers = ['Nº Póliza', 'Matrícula', 'Tomador', 'Tipo', 'Aseguradora', 'Corredor', 'Vencimiento', 'Ámbito', 'Estado'];
    const esc = (v: any) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const filas = this.filtered.map(s => [
      s.poliza, s.matricula, s.tomador, s.tipo, this.resolveAseguradora(s.aseguradora), s.corredor, s.vencimiento, s.ambito, s.estado
    ].map(esc).join(','));
    const csv = '﻿' + [headers.map(esc).join(','), ...filas].join('\r\n');
    const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' })), download: `seguros_${new Date().toISOString().split('T')[0]}.csv` });
    a.click();
  }
}