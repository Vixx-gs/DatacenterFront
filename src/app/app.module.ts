import { NgModule, isDevMode } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';

import { AppComponent } from './app.component';
import { SidebarComponent } from './shared/sidebar/sidebar.component';
import { TopbarComponent } from './shared/topbar/topbar.component';
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
import { CambiosComponent } from './pages/cambios/cambios.component';
import { IngresosComponent } from './pages/ingresos/ingresos.component';
import { RegistroEmpresasComponent } from './pages/registro-empresas/registro-empresas.component';

import { AuthInterceptor } from './core/auth.interceptor';
import { ServiceWorkerModule } from '@angular/service-worker';
import { PwaInstallComponent } from './shared/pwa-install/pwa-install.component';

@NgModule({
  declarations: [
    AppComponent,
    SidebarComponent,
    TopbarComponent,
    LoginComponent,
    InicioComponent,
    VehiculosComponent,
    ConductoresComponent,
    TalleresComponent,
    SegurosComponent,
    FinancierasComponent,
    ContratosComponent,
    TelefonosComponent,
    TacografoComponent,
    EntregasComponent,
    ItvComponent,
    GpsComponent,
    FichaVehiculoComponent,
    FichaConductorComponent,
    CambiosComponent,
    IngresosComponent,
    RegistroEmpresasComponent,
    PwaInstallComponent,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    AppRoutingModule,
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: !isDevMode(),
      // Register the ServiceWorker as soon as the application is stable
      // or after 30 seconds (whichever comes first).
      registrationStrategy: 'registerWhenStable:30000'
    }),
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }
  ],
  bootstrap: [AppComponent],
})
export class AppModule { }