import { Component } from '@angular/core';
@Component({ selector: 'app-cambios', templateUrl: './cambios.component.html' })
export class CambiosComponent {
  cambios: any[] = [];

  exportarCSV() {
    const headers = ['F. Inicio', 'Matrícula Entra', 'Conductor Entra', 'F. Fin', 'Matrícula Sale', 'Conductor Sale'];
    const esc = (v: any) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const filas = this.cambios.map(c => [
      c.fechaInicio, c.matriculaEntra, c.conductorEntra, c.fechaFin, c.matriculaSale, c.conductorSale
    ].map(esc).join(','));
    const csv = '﻿' + [headers.map(esc).join(','), ...filas].join('\r\n');
    const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' })), download: `cambios_${new Date().toISOString().split('T')[0]}.csv` });
    a.click();
  }
}
