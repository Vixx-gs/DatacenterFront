import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './core/auth.guard';

import { LoginComponent } from './pages/login/login.component';
import { InicioComponent } from './pages/inicio/inicio.component';
import { VehiculosComponent } from './pages/vehiculos/vehiculos.component';
import { ConductoresComponent } from './pages/conductores/conductores.component';
import { TalleresComponent } from './pages/talleres/talleres.component';
import { SegurosComponent } from './pages/seguros/seguros.component';
import { FinancierasComponent } from './pages/financieras/financieras.component';
import { ContratosComponent } from './pages/contratos/contratos.component';
import { TelefonosComponent } from './pages/telefonos/telefonos.component';
import { TacografoComponent } from './pages/tacografo/tacografo.component';
import { EntregasComponent } from './pages/entregas/entregas.component';
import { ItvComponent } from './pages/itv/itv.component';
import { GpsComponent } from './pages/gps/gps.component';
import { FichaVehiculoComponent } from './pages/ficha-vehiculo/ficha-vehiculo.component';
import { FichaConductorComponent } from './pages/ficha-conductor/ficha-conductor.component';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: '', redirectTo: 'inicio', pathMatch: 'full' },
  { path: 'inicio', component: InicioComponent, canActivate: [AuthGuard] },
  { path: 'vehiculos', component: VehiculosComponent, canActivate: [AuthGuard] },
  { path: 'vehiculos/:matricula', component: FichaVehiculoComponent, canActivate: [AuthGuard] },
  { path: 'conductores', component: ConductoresComponent, canActivate: [AuthGuard] },
  { path: 'conductores/:id', component: FichaConductorComponent, canActivate: [AuthGuard] },
  { path: 'seguros', component: SegurosComponent, canActivate: [AuthGuard] },
  { path: 'financieras', component: FinancierasComponent, canActivate: [AuthGuard] },
  { path: 'talleres', component: TalleresComponent, canActivate: [AuthGuard] },
  { path: 'contratos', component: ContratosComponent, canActivate: [AuthGuard] },
  { path: 'telefonos', component: TelefonosComponent, canActivate: [AuthGuard] },
  { path: 'tacografo', component: TacografoComponent, canActivate: [AuthGuard] },
  { path: 'entregas', component: EntregasComponent, canActivate: [AuthGuard] },
  { path: 'itv', component: ItvComponent, canActivate: [AuthGuard] },
  { path: 'gps', component: GpsComponent, canActivate: [AuthGuard] },
  { path: '**', redirectTo: 'login' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }