import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { DataService } from '../../core/data.service';
import { forkJoin } from 'rxjs';
import { catchError, of } from 'rxjs';

// Mapa de IDs de aseguradora → nombre legible
// Actualizar aquí cuando lleguen nuevos IDs desde la API
const ASEGURADORAS: Record<string, string> = {
  '599b5220': 'ZURICH',
  '60a6e753': 'MAPFRE',
  '8bb32e35': 'ALLIANZ',
};

@Component({
  selector: 'app-ficha-vehiculo',
  templateUrl: './ficha-vehiculo.component.html',
  styleUrls: ['./ficha-vehiculo.component.scss'],
})
export class FichaVehiculoComponent implements OnInit {
  vehiculo: any;
  seguros: any[] = [];
  financiera: any;
  contrato: any;
  historialConductores: any[] = [];
  conductorDetalle: any = null;
  garantias: any = null;
  loading = true;
  activeSeguroTab = 'circulacion';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private api: ApiService,
    private data: DataService
  ) { }

  ngOnInit() {
    const matricula = this.route.snapshot.paramMap.get('matricula') || '';
    forkJoin({
      vehiculo: this.api.getVehiculo(matricula),
      seguros: this.api.getSeguros({ matricula }).pipe(catchError(() => of([]))),
      financieras: this.api.getFinancieras({ vehiculo_id: matricula }).pipe(catchError(() => of([]))),
      contratos: this.api.getContratos({ vehiculo_id: matricula }).pipe(catchError(() => of([]))),
      historial: this.api.getHistorialConductores(matricula).pipe(catchError(() => of([]))),
      garantias: this.api.getGarantiasVehiculo(matricula).pipe(catchError(() => of(null))),
    }).subscribe({
      next: (res) => {
        this.vehiculo = res.vehiculo;
        this.seguros = res.seguros;
        this.financiera = res.financieras[0];
        this.contrato = res.contratos.find((c: any) => !c.fecha_fin) || res.contratos[0];
        this.garantias = res.garantias && Object.keys(res.garantias).length > 0 ? res.garantias : null;
        this.historialConductores = (res.historial || []).sort((a: any, b: any) => {
          if (!a.fecha_fin) return -1;
          if (!b.fecha_fin) return 1;
          return new Date(b.fecha_fin).getTime() - new Date(a.fecha_fin).getTime();
        });
        this.loading = false;
        // Cargar datos completos del conductor actual
        if (this.vehiculo?.conductor_actual) {
          this.api.getConductorDetalleVehiculo(matricula).subscribe({
            next: (d) => { this.conductorDetalle = d; },
            error: () => { }
          });
        }
      },
      error: () => { this.loading = false; }
    });
  }

  resolveAseguradora(value: string): string {
    if (!value) return '—';
    // Si parece un nombre real (más de 8 chars o contiene letras mayúsculas tipo nombre), devolverlo directo
    // Si parece un hash (hex short), buscar en el mapa
    const mapped = ASEGURADORAS[value.toLowerCase()];
    return mapped || value;
  }

  formatFecha(f: string): string {
    if (!f) return '—';
    return f.split(' ')[0].split('T')[0];
  }

  volver() { this.router.navigate(['/vehiculos']); }
  badgeClass(v: string) { return this.data.badgeClass(v); }
  coopClass(e: string) { return this.data.coopClass(e); }

  private normTipo(t: string): string {
    return (t || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toUpperCase();
  }
  get seguroCirculacion() { return this.seguros.find(s => this.normTipo(s.tipo).includes('CIRCULACION')); }
  get seguroAsistencia()  { return this.seguros.find(s => this.normTipo(s.tipo).includes('ASISTENCIA')); }
  get seguroDanios()      { return this.seguros.find(s => this.normTipo(s.tipo).includes('DANO') || this.normTipo(s.tipo).includes('DANIO')); }

  get ultimoConductor(): any {
    if (!this.historialConductores || this.historialConductores.length === 0) return null;
    for (const h of this.historialConductores) {
      if (h.fecha_fin && this.nombreEsValido(h.nombre)) {
        return h;
      }
    }
    return null;
  }

  nombreUltimoConductor(): string {
    const n = this.ultimoConductor?.nombre;
    return this.nombreEsValido(n) ? n.trim() : '—';
  }

  private nombreEsValido(n: any): boolean {
    if (!n || typeof n !== 'string') return false;
    const t = n.trim();
    if (!t) return false;
    if (/^[\s\-–—‐‑‒]+$/.test(t)) return false;
    return true;
  }
}