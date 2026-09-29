import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'fechaEs' })
export class FechaEsPipe implements PipeTransform {
  transform(valor: string | null | undefined): string {
    if (!valor) return '—';
    const s = valor.toString().split('T')[0].split(' ')[0].trim();
    // Ya está en DD/MM/YYYY
    if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(s)) return s;
    // YYYY-MM-DD → DD/MM/YYYY
    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
      const [a, m, d] = s.split('-');
      return `${d}/${m}/${a}`;
    }
    // D/M/YYYY → DD/MM/YYYY (normalizar sin ceros)
    if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(s)) return s;
    return s;
  }
}
