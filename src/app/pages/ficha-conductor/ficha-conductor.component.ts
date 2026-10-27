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

  vehiculosActivos: any[] = [];

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
      actuales:  this.api.getVehiculosActuales(id),
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
        // Vehículos actuales: los de las fichas de Cartera+, con su contrato de alquiler vigente
        // (o el más reciente) emparejado por matrícula
        this.vehiculosActivos   = (res.actuales || []).map((v: any) => {
          const mat = this.norm(v.vehiculo_id);
          const delVehiculo = res.contratos.filter((c: any) => this.norm(c.vehiculo_id) === mat);
          return { ...v, contrato: delVehiculo.find((c: any) => !c.fecha_fin) || delVehiculo[0] || null };
        });
        this.loading            = false;
      },
      error: () => { this.conductor = null; this.loading = false; }
    });
  }

  private norm(m: string): string {
    return (m || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
  }

  formatFecha(fecha: string): string {
    if (!fecha) return '—';
    return fecha.split(' ')[0].split('T')[0];
  }

  volver() { this.router.navigate(['/conductores']); }
  badgeClass(v: string) { return this.data.badgeClass(v); }
  coopClass(e: string)  { return this.data.coopClass(e); }
}
