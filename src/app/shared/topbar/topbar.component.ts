import { Component, OnInit } from '@angular/core';
import { DataService } from '../../core/data.service';
import { ApiService } from '../../core/api.service';
import { UiService } from '../../core/ui.service';

@Component({
  selector: 'app-topbar',
  templateUrl: './topbar.component.html',
  styleUrls: ['./topbar.component.scss'],
})
export class TopbarComponent implements OnInit {
  coops = [
    { name: 'TRANSCOOP',     count: 0, color: '#0d3b3e' },
    { name: 'ECOTRANSPORTE', count: 0, color: '#18a04c' },
    { name: 'CENTRALCOOP',   count: 0, color: '#d4580a' },
  ];
  today = new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  constructor(private data: DataService, private api: ApiService, private ui: UiService) {}

  toggleNav() { this.ui.toggleMobileNav(); }

  ngOnInit() {
    this.api.getDashboardStats().subscribe({
      next: (s) => {
        this.coops = [
          { name: 'TRANSCOOP',     count: s.transcoop,    color: '#0d3b3e' },
          { name: 'ECOTRANSPORTE', count: s.ecotransporte, color: '#18a04c' },
          { name: 'CENTRALCOOP',   count: s.centralcoop,   color: '#d4580a' },
        ];
      },
      error: () => {}
    });
  }
}
