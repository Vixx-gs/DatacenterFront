import { Injectable } from '@angular/core';

export interface Cooperativa { name: string; count: number; color: string; cssClass: string; }
export interface StatCard { label: string; value: string | number; sub: string; trend: string; warn: boolean; }
export interface NavItem { id: string; label: string; svg: string; route: string; }

const SVG = {
  home: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`,
  truck: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>`,
  users: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>`,
  shield: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
  credit: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>`,
  wrench: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"/></svg>`,
  clipboard: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2"/><rect x="8" y="2" width="8" height="4" rx="1"/></svg>`,
  phone: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.8 19.79 19.79 0 01.21 1.18 2 2 0 012.18 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 7.91a16 16 0 006.06 6.06l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>`,
  clock: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
};

@Injectable({ providedIn: 'root' })
export class DataService {

  readonly navItems: NavItem[] = [
    { id: 'inicio', label: 'INICIO', svg: SVG.home, route: '/inicio' },
    { id: 'vehiculos', label: 'VEHICULOS', svg: SVG.truck, route: '/vehiculos' },
    { id: 'conductores', label: 'SOCIOS', svg: SVG.users, route: '/conductores' },
    { id: 'seguros', label: 'SEGUROS', svg: SVG.shield, route: '/seguros' },
    { id: 'financieras', label: 'FINANCIERAS', svg: SVG.credit, route: '/financieras' },
    { id: 'talleres', label: 'TALLERES', svg: SVG.wrench, route: '/talleres' },
    { id: 'contratos', label: 'CONTRATOS', svg: SVG.clipboard, route: '/contratos' },
    { id: 'telefonos', label: 'TELEFONOS', svg: SVG.phone, route: '/telefonos' },
    { id: 'tacografo', label: 'TACOGRAFO', svg: SVG.clock, route: '/tacografo' },
    { id: 'itv', label: 'ITV', svg: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/><path d="M9 16l2 2 4-4"/></svg>`, route: '/itv' },
    { id: 'gps', label: 'GPS', svg: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M12 2a10 10 0 0 1 10 10"/><path d="M12 2a10 10 0 0 0-10 10"/><path d="M12 22a10 10 0 0 0 10-10"/><path d="M12 22a10 10 0 0 1-10-10"/><line x1="2" y1="12" x2="22" y2="12"/><line x1="12" y1="2" x2="12" y2="22"/></svg>`, route: '/gps' },
    { id: 'entregas', label: 'ENTREGAS', svg: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 014-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 01-4 4H3"/></svg>`, route: '/entregas' },
  ];

  readonly cooperativas: Cooperativa[] = [
    { name: 'TRANSCOOP', count: 0, color: '#0d3b3e', cssClass: 'coop-transcoop' },
    { name: 'ECOTRANSPORTE', count: 0, color: '#18a04c', cssClass: 'coop-ecotransporte' },
    { name: 'CENTRALCOOP', count: 0, color: '#d4580a', cssClass: 'coop-centralcoop' },
  ];

  readonly stats: any[] = [];
  readonly vehiculos: any[] = [];
  readonly conductores: any[] = [];
  readonly talleres: any[] = [];
  readonly seguros: any[] = [];
  readonly financieras: any[] = [];
  readonly contratos: any[] = [];

  badgeClass(value: string): string {
    const map: Record<string, string> = {
      'ACTIVO': 'badge-activo', 'BAJA': 'badge-baja', 'FINALIZADO': 'badge-baja',
      'No disponible': 'badge-nodisponible', 'Disponible': 'badge-disponible',
      'BOTIQUIN': 'badge-botiquin', 'Vender': 'badge-baja', 'Recuperar': 'badge-default',
      'Siniestro': 'badge-siniestro', 'Averia': 'badge-averia',
      'RENTING': 'badge-disponible', 'LEASING': 'badge-botiquin', 'ALQUILER OC': 'badge-activo',
      'AOC': 'badge-activo', 'Alquiler': 'badge-disponible',
    };
    return map[value] || 'badge-default';
  }

  coopClass(empresa: string): string {
    if (!empresa) return '';
    const e = empresa.toUpperCase();
    if (e.includes('TRANSCOOP')) return 'coop-transcoop';
    if (e.includes('ECOTRANSPORTE') || e.includes('ECOTRANS')) return 'coop-ecotransporte';
    if (e.includes('CENTRALCOOP') || e.includes('CENTRAL')) return 'coop-centralcoop';
    if (e.includes('ALQUITRUCK')) return 'coop-alquitruck';
    if (e.includes('SITTRANS')) return 'coop-sittrans';
    return '';
  }

  totalVehiculos(): number { return this.cooperativas.reduce((s, c) => s + c.count, 0); }
}