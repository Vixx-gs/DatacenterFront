import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { DataService } from '../../core/data.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-ficha-conductor',
  templateUrl: './ficha-conductor.component.html',
  styleUrls: ['./ficha-conductor.component.scss'],
})
export class FichaConductorComponent implements OnInit {
  conductor: any;
  historialVehiculos: any[] = [];
  contratos: any[] = [];
  loading = true;

  // Vehículos activos: sin fecha_fin
  get vehiculosActivos(): any[] {
    const activos = this.historialVehiculos.filter(h => !h.fecha_fin);
    if (activos.length > 0) {
      return activos.map(h => ({
        ...h,
        contrato: this.contratos.find(c => c.vehiculo_id === h.vehiculo_id) || null
      }));
    }
    // Fallback: usar campo vehiculo del conductor si no hay historial activo
    if (this.conductor?.vehiculo && this.conductor.vehiculo !== '—') {
      const ultimo = this.historialVehiculos
        .filter(h => h.fecha_fin)
        .sort((a, b) => (b.fecha_fin || '').localeCompare(a.fecha_fin || ''))[0];
      const contrato = this.contratos.find(c => c.vehiculo_id === this.conductor.vehiculo) || null;
      return [{ vehiculo_id: this.conductor.vehiculo, fecha_inicio: ultimo?.fecha_inicio || null, fecha_fin: null, contrato }];
    }
    return [];
  }

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private api: ApiService,
    private data: DataService
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id') || '';
    forkJoin({
      conductor: this.api.getConductor(id),
      historial: this.api.getHistorialVehiculos(id),
      contratos: this.api.getContratos(),
    }).subscribe({
      next: (res) => {
        this.conductor          = res.conductor;
        this.historialVehiculos = (res.historial || []).sort((a: any, b: any) => {
          if (!a.fecha_fin) return -1;
          if (!b.fecha_fin) return 1;
          return new Date(b.fecha_fin).getTime() - new Date(a.fecha_fin).getTime();
        });
        this.contratos          = res.contratos.filter((c: any) => c.cliente_id === id);
        this.loading            = false;
      },
      error: () => { this.conductor = null; this.loading = false; }
    });
  }

  formatFecha(fecha: string): string {
    if (!fecha) return '—';
    return fecha.split(' ')[0].split('T')[0];
  }

  volver() { this.router.navigate(['/conductores']); }
  badgeClass(v: string) { return this.data.badgeClass(v); }
  coopClass(e: string)  { return this.data.coopClass(e); }
}
