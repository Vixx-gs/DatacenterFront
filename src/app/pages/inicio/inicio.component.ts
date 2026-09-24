import { Component, OnInit, OnDestroy, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { RefreshService } from '../../core/refresh.service';
import { Subscription } from 'rxjs';

const MESES_NOMBRES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

@Component({
  selector: 'app-inicio',
  templateUrl: './inicio.component.html',
  styleUrls: ['./inicio.component.scss'],
})
export class InicioComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('graficoCanvas') graficoCanvas!: ElementRef<HTMLCanvasElement>;
  private refreshSub: Subscription | null = null;

  coops: any[] = [
    { name: 'TRANSCOOP', count: 0, color: '#0d3b3e' },
    { name: 'ECOTRANSPORTE', count: 0, color: '#18a04c' },
    { name: 'CENTRALCOOP', count: 0, color: '#d4580a' },
  ];
  total = 0;
  miniStats: any[] = [];
  meses = MESES_NOMBRES;
  aniosDisponibles: number[] = [];

  // Altas
  sociosAltas: any[] = [];
  mostrarAltas = false;
  rangoAltas = 'mes_selector';
  mesAltas = new Date().getMonth() + 1;
  anioAltas = new Date().getFullYear();

  // Bajas
  sociosBajas: any[] = [];
  mostrarBajas = false;
  rangoBajas = 'mes_selector';
  mesBajas = new Date().getMonth() + 1;
  anioBajas = new Date().getFullYear();

  // Gráfico por días/meses/años
  graficoModo = 'dia';   // dia | mes | anio
  graficoMes = new Date().getMonth() + 1;
  graficoAnio = new Date().getFullYear();
  graficoCooperativa = 'TODAS';
  graficoData: any[] = [];
  coopOpciones = ['TODAS', 'TRANSCOOP', 'ECOTRANSPORTE', 'CENTRALCOOP'];
  private ctx: CanvasRenderingContext2D | null = null;
  private animFrame = 0;

  constructor(private api: ApiService, private router: Router, private refresh: RefreshService) {
    const hoy = new Date().getFullYear();
    for (let y = hoy; y >= 2020; y--) this.aniosDisponibles.push(y);
  }

  ngOnInit() {
    this.loadStats();
    this.loadAltas();
    this.loadBajas();
    this.loadGrafico();
    this.refreshSub = this.refresh.refresh$.subscribe(() => {
      this.loadStats();
      this.loadAltas();
      this.loadBajas();
      this.loadGrafico();
    });
  }

  ngOnDestroy() {
    this.refreshSub?.unsubscribe();
  }

  ngAfterViewInit() {
    if (this.graficoCanvas?.nativeElement) {
      this.ctx = this.graficoCanvas.nativeElement.getContext('2d');
      if (this.graficoData.length > 0) this.renderGrafico();
    }
  }

  loadStats() {
    this.api.getDashboardStats().subscribe({
      next: (s) => {
        this.coops = [
          { name: 'TRANSCOOP', count: s.transcoop, color: '#0d3b3e' },
          { name: 'ECOTRANSPORTE', count: s.ecotransporte, color: '#18a04c' },
          { name: 'CENTRALCOOP', count: s.centralcoop, color: '#d4580a' },
        ];
        this.total = s.transcoop + s.ecotransporte + s.centralcoop;
        this.miniStats = [
          { label: 'Total vehiculos', value: s.total_vehiculos, sub: 'en flota', color: '#2563eb' },
          { label: 'Socios', value: s.total_conductores, sub: 'registrados', color: '#7c3aed' },
          { label: 'En taller', value: s.vehiculos_en_taller, sub: 'vehiculos', color: s.vehiculos_en_taller > 0 ? '#dc2626' : '#6b7280' },
        ];
        // Actualizar último punto del gráfico con el total real
        if (this.graficoData.length > 0 && this.graficoCooperativa === 'TODAS') {
          this.graficoData[this.graficoData.length - 1].valor = this.total;
          setTimeout(() => this.renderGrafico(), 0);
        }
      }, error: () => { }
    });
  }

  loadAltas() {
    const m = this.rangoAltas === 'mes_selector' ? this.mesAltas : undefined;
    const a = ['mes_selector', 'anio_selector'].includes(this.rangoAltas) ? this.anioAltas : undefined;
    this.api.getSociosAltas(this.rangoAltas, m, a).subscribe({
      next: (d) => { this.sociosAltas = d; }, error: () => { this.sociosAltas = []; }
    });
  }

  loadBajas() {
    const m = this.rangoBajas === 'mes_selector' ? this.mesBajas : undefined;
    const a = ['mes_selector', 'anio_selector'].includes(this.rangoBajas) ? this.anioBajas : undefined;
    this.api.getSociosBajas(this.rangoBajas, m, a).subscribe({
      next: (d) => { this.sociosBajas = d; }, error: () => { this.sociosBajas = []; }
    });
  }

  loadGrafico() {
    const mes = this.graficoModo !== 'anio' ? this.graficoMes : undefined;
    const anio = this.graficoModo !== 'anio' ? this.graficoAnio : undefined;
    this.api.getSociosEvolucion(this.graficoModo, this.graficoCooperativa, mes, anio).subscribe({
      next: (d) => {
        this.graficoData = d;
        if (d.length > 0 && this.total > 0 && this.graficoCooperativa === 'TODAS') {
          this.graficoData[this.graficoData.length - 1].valor = this.total;
        }
        setTimeout(() => this.renderGrafico(), 50);
      },
      error: () => { }
    });
  }

  setGraficoModo(m: string) { this.graficoModo = m; this.loadGrafico(); }

  getCoopColor(): string {
    const map: Record<string, string> = { 'TRANSCOOP': '#0d3b3e', 'ECOTRANSPORTE': '#18a04c', 'CENTRALCOOP': '#d4580a', 'TODAS': '#2563eb' };
    return map[this.graficoCooperativa] || '#2563eb';
  }

  get graficoTitulo(): string {
    if (this.graficoModo === 'anio') return 'Evolución anual';
    if (this.graficoModo === 'mes') return `Meses de ${this.graficoAnio}`;
    return `${MESES_NOMBRES[this.graficoMes - 1]} ${this.graficoAnio}`;
  }

  renderGrafico() {
    const canvas = this.graficoCanvas?.nativeElement;
    const ctx = this.ctx;
    if (!canvas || !ctx || !this.graficoData.length) return;

    const W = canvas.offsetWidth;
    const H = canvas.offsetHeight;
    canvas.width = W * window.devicePixelRatio;
    canvas.height = H * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    const data = this.graficoData;
    const maxVal = Math.max(...data.map((d: any) => d.valor), 1);
    const dataMin = Math.min(...data.map((d: any) => d.valor));
    const padding = Math.ceil((maxVal - dataMin) * 0.1) || 1;
    const minVal = Math.max(0, dataMin - padding);
    const range = maxVal - minVal || 1;
    const color = this.getCoopColor();
    const pad = { top: 30, right: 20, bottom: 36, left: 54 };
    const chartW = W - pad.left - pad.right;
    const chartH = H - pad.top - pad.bottom;

    const yPos = (v: number) => pad.top + chartH - ((v - minVal) / range) * chartH;
    const xPos = (i: number) => pad.left + (data.length > 1 ? (i / (data.length - 1)) * chartW : chartW / 2);

    let hoverIndex = -1;

    const drawChart = (prog: number) => {
      ctx.clearRect(0, 0, W, H);

      // Grid horizontal
      const steps = 4;
      for (let i = 0; i <= steps; i++) {
        const v = minVal + (range * i / steps);
        const y = yPos(v);
        ctx.strokeStyle = '#eef0f6'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(pad.left, y); ctx.lineTo(W - pad.right, y); ctx.stroke();
        ctx.fillStyle = '#9ca3af'; ctx.font = '10px DM Sans,sans-serif'; ctx.textAlign = 'right';
        ctx.fillText(String(Math.round(v)), pad.left - 6, y + 3);
      }

      const cutoff = Math.min(data.length - 1, Math.round(prog * (data.length - 1)));

      if (cutoff >= 1) {
        // Línea
        ctx.beginPath();
        for (let i = 0; i <= cutoff; i++) {
          const x = xPos(i), y = yPos(data[i].valor);
          if (i === 0) { ctx.moveTo(x, y); }
          else {
            ctx.lineTo(x, y);
          }
        }
        ctx.strokeStyle = color; ctx.lineWidth = 2.5; ctx.stroke();
      }

      // Puntos
      for (let i = 0; i <= cutoff; i++) {
        const x = xPos(i), y = yPos(data[i].valor);
        const isHover = i === hoverIndex;
        ctx.beginPath(); ctx.arc(x, y, isHover ? 6 : 3.5, 0, Math.PI * 2);
        ctx.fillStyle = isHover ? color : '#fff'; ctx.fill();
        ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.stroke();
      }

      // Tooltip hover
      if (hoverIndex >= 0 && hoverIndex < data.length) {
        const d = data[hoverIndex];
        const x = xPos(hoverIndex), y = yPos(d.valor);
        const lbl = `Día ${d.label}: ${d.valor} socios`;
        ctx.font = 'bold 11px DM Sans,sans-serif';
        const tw = ctx.measureText(lbl).width + 20;
        let tx = x - tw / 2, ty = y - 36;
        tx = Math.max(pad.left, Math.min(W - pad.right - tw, tx));
        if (ty < pad.top) ty = y + 12;
        ctx.fillStyle = '#0a0f2c';
        ctx.beginPath(); ctx.roundRect(tx, ty, tw, 24, 6); ctx.fill();
        ctx.fillStyle = '#fff'; ctx.textAlign = 'center';
        ctx.fillText(lbl, tx + tw / 2, ty + 16);
        // Línea punteada
        ctx.strokeStyle = color + '55'; ctx.lineWidth = 1; ctx.setLineDash([3, 3]);
        ctx.beginPath(); ctx.moveTo(x, pad.top); ctx.lineTo(x, pad.top + chartH); ctx.stroke();
        ctx.setLineDash([]);
      }

      // Labels eje X — mostrar solo cada N días para no saturar
      const step = data.length > 20 ? 5 : data.length > 10 ? 2 : 1;
      ctx.fillStyle = '#9ca3af'; ctx.font = '9px DM Sans,sans-serif'; ctx.textAlign = 'center';
      data.forEach((d: any, i: number) => {
        if (i % step === 0 || i === data.length - 1)
          ctx.fillText(d.label, xPos(i), pad.top + chartH + 16);
      });
    };

    cancelAnimationFrame(this.animFrame);
    let progress = 0;
    const animate = () => {
      drawChart(progress);
      if (progress < 1) { progress = Math.min(1, progress + 0.05); this.animFrame = requestAnimationFrame(animate); }
      else {
        canvas.onmousemove = (e: MouseEvent) => {
          const rect = canvas.getBoundingClientRect();
          const mx = e.clientX - rect.left, my = e.clientY - rect.top;
          let found = -1;
          for (let i = 0; i < data.length; i++) {
            const dx = mx - xPos(i), dy = my - yPos(data[i].valor);
            if (Math.sqrt(dx * dx + dy * dy) < 18) { found = i; break; }
          }
          if (found !== hoverIndex) { hoverIndex = found; canvas.style.cursor = found >= 0 ? 'pointer' : 'default'; drawChart(1); }
        };
        canvas.onmouseleave = () => { hoverIndex = -1; canvas.style.cursor = 'default'; drawChart(1); };
      }
    };
    animate();
  }

  setRangoAltas(r: string) { this.rangoAltas = r; this.loadAltas(); }
  setRangoBajas(r: string) { this.rangoBajas = r; this.loadBajas(); }
  onMesAltasChange() { this.rangoAltas = 'mes_selector'; this.loadAltas(); }
  onMesBajasChange() { this.rangoBajas = 'mes_selector'; this.loadBajas(); }
  onAnioAltasChange() { this.rangoAltas = 'anio_selector'; this.loadAltas(); }
  onAnioBajasChange() { this.rangoBajas = 'anio_selector'; this.loadBajas(); }
  toggleAltas() { this.mostrarAltas = !this.mostrarAltas; }
  toggleBajas() { this.mostrarBajas = !this.mostrarBajas; }
  irAFicha(id: string) { this.router.navigate(['/conductores', id]); }

  getVehiculos(v: string): string[] {
    if (!v || v === '—') return [];
    return v.split(',').map((x: string) => x.trim()).filter(Boolean);
  }

  progressWidth(c: number): string { return this.total ? `${Math.round((c / this.total) * 100)}%` : '0%'; }
  getPct(c: number): number { return this.total ? Math.round((c / this.total) * 100) : 0; }
  getCircumference(): number { return 2 * Math.PI * 70; }
  getDonutDash(count: number): string {
    const circ = this.getCircumference();
    return this.total ? `${(count / this.total) * circ} ${circ - (count / this.total) * circ}` : `0 ${circ}`;
  }
  getDonutRotation(index: number): string {
    let deg = -90;
    for (let i = 0; i < index; i++) deg += (this.coops[i].count / (this.total || 1)) * 360;
    return `rotate(${deg}, 100, 100)`;
  }
}