import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../core/api.service';
import { DataService } from '../../core/data.service';

@Component({ selector: 'app-talleres', templateUrl: './talleres.component.html' })
export class TalleresComponent implements OnInit {
  talleres: any[] = [];
  loading = true;

  constructor(private api: ApiService, private data: DataService) {}

  ngOnInit() {
    this.api.getTalleresEntradas({ activos: true }).subscribe({
      next: (data) => { this.talleres = data; this.loading = false; },
      error: () => { this.talleres = this.data.talleres; this.loading = false; }
    });
  }

  badgeClass(v: string) { return this.data.badgeClass(v); }

  exportarCSV() {
    const headers = ['Matrícula', 'Taller', 'F. Entrada', 'F. Prevista Fin', 'Tipo Avería', 'Notas'];
    const esc = (v: any) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const filas = this.talleres.map(t => [
      t.matricula, t.taller || t.taller_nombre, t.entrada || t.fecha_entrada, t.prevista || t.fecha_prevista, t.tipo_averia || t.tipoAveria, t.notas
    ].map(esc).join(','));
    const csv = '﻿' + [headers.map(esc).join(','), ...filas].join('\r\n');
    const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' })), download: `talleres_${new Date().toISOString().split('T')[0]}.csv` });
    a.click();
  }
}
