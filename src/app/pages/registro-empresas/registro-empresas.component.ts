import { Component } from '@angular/core';
@Component({ selector: 'app-registro-empresas', templateUrl: './registro-empresas.component.html' })
export class RegistroEmpresasComponent {
  registros: any[] = [];
  coopClass(e: string) { return ''; }

  exportarCSV() {
    const headers = ['Matrícula', 'Tipo', 'F. Matriculación', 'Autorización', 'F. Adscripción', 'Empresa', 'Propiedad', 'Conductor', 'F. Inicio', 'Tipo Contrato', 'Cuota Socio', 'Financiera', 'Tipo Finan.', 'Cuota Finan.'];
    const esc = (v: any) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const filas = this.registros.map(r => [
      r.matricula, r.tipo || r.tipo_vehiculo, r.fechaMat || r.fecha_mat, r.autorizacion,
      r.fechaAdscripcion || r.fecha_adscripcion, r.empresa, r.propiedad, r.conductor,
      r.fechaInicio || r.fecha_inicio, r.tipoContrato || r.tipo_contrato,
      r.cuotaSocio || r.cuota_socio, r.financiera, r.tipoFinan || r.tipo_finan, r.cuotaFinan || r.cuota_finan
    ].map(esc).join(','));
    const csv = '﻿' + [headers.map(esc).join(','), ...filas].join('\r\n');
    const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' })), download: `registro_empresas_${new Date().toISOString().split('T')[0]}.csv` });
    a.click();
  }
}
