import { Component } from '@angular/core';
@Component({ selector: 'app-ingresos', templateUrl: './ingresos.component.html' })
export class IngresosComponent {
  ingresos: any[] = [];
  filtered: any[] = [];
  coops: any[] = [];
  filtroCoop = 'TODOS';
  setFiltro(c: string) {}
  coopClass(e: string) { return ''; }

  exportarCSV() {
    const headers = ['Mes', 'Proveedor', 'NIF', 'Código', 'Nº Factura', 'Ref. Factura', 'Fecha', 'Cooperativa', 'Familia'];
    const esc = (v: any) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const filas = this.filtered.map(i => [
      i.mes || i.nombre_mes, i.proveedor, i.nif, i.codigo, i.numFactura || i.num_factura,
      i.refFactura || i.ref_factura, i.fecha, i.cooperativa, i.familia
    ].map(esc).join(','));
    const csv = '﻿' + [headers.map(esc).join(','), ...filas].join('\r\n');
    const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' })), download: `ingresos_${new Date().toISOString().split('T')[0]}.csv` });
    a.click();
  }
}
