import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ApiService {

  private base = environment.apiUrl;
  private cache: Record<string, any> = {};

  constructor(private http: HttpClient) { }

  private getCached(key: string, request: Observable<any>): Observable<any> {
    if (this.cache[key]) return of(this.cache[key]);
    return request.pipe(tap(data => this.cache[key] = data));
  }

  clearCache() { this.cache = {}; }

  getDashboardStats(): Observable<any> {
    return this.http.get(`${this.base}/dashboard/stats`);
  }

  getSociosAltas(rango: string, mes?: number, anio?: number): Observable<any[]> {
    let url = `${this.base}/dashboard/socios-altas?rango=${rango}`;
    if (mes) url += `&mes=${mes}`;
    if (anio) url += `&anio=${anio}`;
    return this.http.get<any[]>(url);
  }

  getSociosBajas(rango: string, mes?: number, anio?: number): Observable<any[]> {
    let url = `${this.base}/dashboard/socios-bajas?rango=${rango}`;
    if (mes) url += `&mes=${mes}`;
    if (anio) url += `&anio=${anio}`;
    return this.http.get<any[]>(url);
  }

  getSociosEvolucion(modo: string, cooperativa: string, mes?: number, anio?: number): Observable<any[]> {
    let url = `${this.base}/dashboard/socios-evolucion?modo=${modo}&cooperativa=${cooperativa}`;
    if (mes) url += `&mes=${mes}`;
    if (anio) url += `&anio=${anio}`;
    return this.http.get<any[]>(url);
  }

  getEvolucionSocios(modo: string, cooperativa: string, anio?: number, desde?: string, hasta?: string): Observable<any[]> {
    let url = `${this.base}/dashboard/evolucion-socios?modo=${modo}&cooperativa=${cooperativa}`;
    if (anio) url += `&anio=${anio}`;
    if (desde) url += `&desde=${desde}`;
    if (hasta) url += `&hasta=${hasta}`;
    return this.http.get<any[]>(url);
  }

  getVehiculos(params?: { estado?: string; destinado_a?: string }): Observable<any[]> {
    let p = new HttpParams();
    if (params?.estado) p = p.set('estado', params.estado);
    if (params?.destinado_a) p = p.set('destinado_a', params.destinado_a);
    return this.http.get<any[]>(`${this.base}/vehiculos`, { params: p });
  }

  getVehiculo(matricula: string): Observable<any> {
    return this.http.get(`${this.base}/vehiculos/${matricula}`);
  }

  getConductorDetalleVehiculo(matricula: string): Observable<any> {
    return this.http.get(`${this.base}/vehiculos/${matricula}/conductor-detalle`);
  }

  getGarantiasVehiculo(matricula: string): Observable<any> {
    return this.http.get(`${this.base}/vehiculos/${matricula}/garantias`);
  }

  getTodasGarantias(): Observable<any> {
    return this.http.get(`${this.base}/vehiculos/garantias/todas`);
  }

  getConductores(params?: { empresa?: string; gestor?: string; estado?: string }): Observable<any[]> {
    let p = new HttpParams();
    if (params?.empresa) p = p.set('empresa', params.empresa);
    if (params?.gestor) p = p.set('gestor', params.gestor);
    if (params?.estado) p = p.set('estado', params.estado);
    return this.http.get<any[]>(`${this.base}/conductores`, { params: p });
  }

  getExSocios(params?: { empresa?: string }): Observable<any[]> {
    let p = new HttpParams();
    if (params?.empresa) p = p.set('empresa', params.empresa);
    return this.http.get<any[]>(`${this.base}/conductores/ex-socios`, { params: p });
  }

  getConductor(id: string): Observable<any> {
    return this.http.get(`${this.base}/conductores/${id}`);
  }

  getHistorialVehiculos(id: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.base}/conductores/${id}/historial-vehiculos`);
  }

  getHistorialConductores(matricula: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.base}/vehiculos/${matricula}/historial`);
  }

  getSeguros(params?: { matricula?: string; estado?: string; tomador?: string }): Observable<any[]> {
    let p = new HttpParams();
    if (params?.matricula) p = p.set('matricula', params.matricula);
    if (params?.estado) p = p.set('estado', params.estado);
    if (params?.tomador) p = p.set('tomador', params.tomador);
    return this.http.get<any[]>(`${this.base}/seguros`, { params: p });
  }

  getFinancieras(params?: { vehiculo_id?: string; empresa_id?: string; tipo?: string }): Observable<any[]> {
    let p = new HttpParams();
    if (params?.vehiculo_id) p = p.set('vehiculo_id', params.vehiculo_id);
    if (params?.empresa_id) p = p.set('empresa_id', params.empresa_id);
    if (params?.tipo) p = p.set('tipo', params.tipo);
    return this.http.get<any[]>(`${this.base}/financieras`, { params: p });
  }

  getContratos(params?: { vehiculo_id?: string; empresa_id?: string; estado?: string }): Observable<any[]> {
    let p = new HttpParams();
    if (params?.vehiculo_id) p = p.set('vehiculo_id', params.vehiculo_id);
    if (params?.empresa_id) p = p.set('empresa_id', params.empresa_id);
    if (params?.estado) p = p.set('estado', params.estado);
    return this.http.get<any[]>(`${this.base}/contratos`, { params: p });
  }

  getTalleresEntradas(params?: { matricula?: string; activos?: boolean }): Observable<any[]> {
    let p = new HttpParams();
    if (params?.matricula) p = p.set('matricula', params.matricula);
    if (params?.activos) p = p.set('activos', 'true');
    return this.http.get<any[]>(`${this.base}/talleres/entradas`, { params: p });
  }

  getTelefonos(empresa?: string): Observable<any[]> {
    let p = new HttpParams();
    if (empresa) p = p.set('empresa', empresa);
    return this.http.get<any[]>(`${this.base}/telefonos`, { params: p });
  }

  createTelefono(t: any): Observable<any> {
    return this.http.post<any>(`${this.base}/telefonos`, t);
  }

  updateTelefono(id: string, t: any): Observable<any> {
    return this.http.put<any>(`${this.base}/telefonos/${id}`, t);
  }

  deleteTelefono(id: string): Observable<any> {
    return this.http.delete(`${this.base}/telefonos/${id}`);
  }

  getRegistro(empresa?: string): Observable<any[]> {
    let p = new HttpParams();
    if (empresa) p = p.set('empresa', empresa);
    return this.getCached(`registro_${empresa || ''}`, this.http.get<any[]>(`${this.base}/registro`, { params: p }));
  }

  getIngresos(params?: { cooperativa?: string }): Observable<any[]> {
    let p = new HttpParams();
    if (params?.cooperativa) p = p.set('cooperativa', params.cooperativa);
    return this.http.get<any[]>(`${this.base}/ingresos`, { params: p });
  }

  getEntradas(mes?: number, anio?: number): Observable<any[]> {
    let url = `${this.base}/entregas/entradas`;
    const q: string[] = [];
    if (mes) q.push(`mes=${mes}`);
    if (anio) q.push(`anio=${anio}`);
    if (q.length) url += '?' + q.join('&');
    return this.http.get<any[]>(url);
  }

  getItvCaducadas(): Observable<any[]> {
    return this.http.get<any[]>(`${this.base}/itv/caducadas`);
  }

  getItvProximas(dias: number = 30): Observable<any[]> {
    return this.http.get<any[]>(`${this.base}/itv/proximas?dias=${dias}`);
  }

  getGps(): Observable<any[]> {
    return this.http.get<any[]>(`${this.base}/gps/`);
  }

  getTacografoCaducadas(): Observable<any[]> {
    return this.http.get<any[]>(`${this.base}/tacografo/caducadas`);
  }

  getTacografoProximas(dias: number = 30): Observable<any[]> {
    return this.http.get<any[]>(`${this.base}/tacografo/proximas?dias=${dias}`);
  }

  getSalidas(mes?: number, anio?: number): Observable<any[]> {
    let url = `${this.base}/entregas/salidas`;
    const q: string[] = [];
    if (mes) q.push(`mes=${mes}`);
    if (anio) q.push(`anio=${anio}`);
    if (q.length) url += '?' + q.join('&');
    return this.http.get<any[]>(url);
  }
}