import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../core/auth.service';
import { ApiService } from '../../core/api.service';

interface Telefono {
  id?: string;          // presente solo en teléfonos guardados en la BD
  telefono: string;
  extension: string;
  persona: string;
  empresa: string;
  email: string;
  pertenece: string;
  area: string;
}

interface EmpresaNumero {
  empresa: string;
  numero: string;
  extension: string;
  usuario: string;
}

@Component({ selector: 'app-telefonos', templateUrl: './telefonos.component.html', styleUrls: ['./telefonos.component.scss'] })
export class TelefonosComponent implements OnInit {

  searchPersona = '';
  searchExtension = '';

  showModal = false;
  editingIndex: number | null = null;
  formData: Telefono = this.emptyForm();

  showConfirm = false;
  confirmIndex: number | null = null;

  saving = false;

  constructor(private auth: AuthService, private api: ApiService) {}

  get isAdmin(): boolean { return this.auth.usuario === 'admin'; }

  ngOnInit() {
    // Cargar teléfonos guardados en la BD y añadirlos a la lista
    this.api.getTelefonos().subscribe({
      next: (data) => {
        const existingExtensions = new Set(this.telefonos.map(t => t.extension).filter(Boolean));
        const nuevos = data
          .filter(t => t.id && !existingExtensions.has(t.extension))
          .map(t => ({
            id:         t.id,
            telefono:   t.telefono   || '',
            extension:  t.extension  || '',
            persona:    t.persona    || '',
            empresa:    t.empresa    || '',
            email:      t.email      || '',
            pertenece:  t.pertenece  || '',
            area:       t.area       || '',
          }));
        this.telefonos = [...this.telefonos, ...nuevos];
      },
      error: () => { /* Si falla, seguimos con los hardcodeados */ }
    });
  }

  private emptyForm(): Telefono {
    return { telefono: '', extension: '', persona: '', empresa: '', email: '', pertenece: '', area: '' };
  }

  openAdd() {
    this.formData = this.emptyForm();
    this.editingIndex = null;
    this.showModal = true;
  }

  openEdit(t: Telefono) {
    this.formData = { ...t };
    this.editingIndex = this.telefonos.indexOf(t);
    this.showModal = true;
  }

  saveForm() {
    if (this.editingIndex !== null) {
      const existing = this.telefonos[this.editingIndex];
      if (existing.id) {
        // Teléfono de la BD → actualizar via API
        this.saving = true;
        this.api.updateTelefono(existing.id, this.formData).subscribe({
          next: () => {
            this.telefonos[this.editingIndex!] = { ...this.formData, id: existing.id };
            this.saving = false;
          },
          error: () => {
            this.telefonos[this.editingIndex!] = { ...this.formData, id: existing.id };
            this.saving = false;
          }
        });
      } else {
        // Teléfono hardcodeado → editar solo en memoria (esta sesión)
        this.telefonos[this.editingIndex] = { ...this.formData };
      }
    } else {
      // Nuevo teléfono → guardar en la BD para que sea permanente y visible para todos
      this.saving = true;
      this.api.createTelefono(this.formData).subscribe({
        next: (saved) => {
          this.telefonos.push({ ...this.formData, id: saved.id });
          this.saving = false;
        },
        error: () => { this.saving = false; }
      });
    }
    this.showModal = false;
  }

  askDelete(t: Telefono) {
    this.confirmIndex = this.telefonos.indexOf(t);
    this.showConfirm = true;
  }

  doDelete() {
    if (this.confirmIndex !== null) {
      const t = this.telefonos[this.confirmIndex];
      if (t.id) {
        // Teléfono de la BD → borrar via API
        this.api.deleteTelefono(t.id).subscribe();
      }
      this.telefonos.splice(this.confirmIndex, 1);
    }
    this.showConfirm = false;
    this.confirmIndex = null;
  }

  cancelModal() { this.showModal = false; }
  cancelConfirm() { this.showConfirm = false; this.confirmIndex = null; }

  telefonos: Telefono[] = [
    { telefono: '670959620', extension: '2001', persona: 'Alberto Gil Montalbán',       empresa: 'SITTRANS',                              email: 'gestion@transcoop.es',           pertenece: 'Sittrans',      area: 'Dirección'              },
    { telefono: '665450815', extension: '2002', persona: 'Oscar González',               empresa: 'SITTRANS',                              email: 'nominas@sittrans.es',             pertenece: 'Sittrans',      area: 'Administración'         },
    { telefono: '656510812', extension: '2003', persona: 'Sara Pisa',                    empresa: 'SITTRANS',                              email: 'tesoreria@sittrans.es',           pertenece: 'Sittrans',      area: 'Tesorería'              },
    { telefono: '656893633', extension: '2004', persona: 'Laura Lorda',                  empresa: 'SITTRANS',                              email: 'contabilidad@sittrans.es',        pertenece: 'Sittrans',      area: 'Contabilidad'           },
    { telefono: '691625162', extension: '2005', persona: 'Laura Lorda',                  empresa: 'SITTRANS',                              email: 'laura.contabilidad@transcoop.es', pertenece: 'Sittrans',      area: 'Tesorería'              },
    { telefono: '698902490', extension: '2301', persona: 'Maria José Alonso',            empresa: 'CENTRAL COOP',                          email: 'info@centralcoop.es',             pertenece: 'CentralCoop',   area: 'Gestores'               },
    { telefono: '691228122', extension: '3011', persona: 'María Pilar Buj',              empresa: 'GESTICOTRANS',                          email: 'seguros@gesticotrans.com',        pertenece: 'Gesticotrans',  area: 'Servicios'              },
    { telefono: '654834143', extension: '2008', persona: 'Jorge Lafuente',               empresa: 'SITTRANS',                              email: 'gestion@sittrans.es',             pertenece: 'Sittrans',      area: 'Gestores'               },
    { telefono: '603824732', extension: '2104', persona: 'Leticia Martínez Sanjuan',     empresa: 'TRANSCOOP',                             email: 'leticia.logistica@transcoop.es', pertenece: 'Transcoop',     area: 'Gestores'               },
    { telefono: '652527720', extension: '3014', persona: 'Sofía Jover Aparicio',         empresa: 'TRANSCOOP',                             email: 'info.comercial@gesticotrans.com', pertenece: 'Ecotransporte', area: 'Comercial y Marketing'  },
    { telefono: '653919391', extension: '3013', persona: 'Luis Durán',                   empresa: 'GESTICOTRANS',                          email: 'comercial@gesticotrans.com',      pertenece: 'Gesticotrans',  area: 'Tráfico'                },
    { telefono: '654181619', extension: '2110', persona: 'Teléfono de Guardia',          empresa: 'TRANSCOOP',                             email: 'gestiondeguros@gesticotrans.com', pertenece: 'Ecotransporte', area: 'Comercial y Marketing'  },
    { telefono: '671252256', extension: '3012', persona: 'Paula Lalaguna',               empresa: 'GESTICOTRANS',                          email: 'paula.logistica@transcoop.es',   pertenece: 'Transcoop',     area: 'Servicios'              },
    { telefono: '684464360', extension: '2105', persona: 'Mercedes Martínez Castro',     empresa: 'TRANSCOOP',                             email: 'merche.logistica@transcoop.es',  pertenece: 'Transcoop',     area: 'Gestores'               },
    { telefono: '684465342', extension: '2016', persona: 'Sara Liarte Herrero',          empresa: 'SITTRANS',                              email: 'dpto.juridico@sittrans.es',       pertenece: 'Sittrans',      area: 'Jurídico'               },
    { telefono: '684467082', extension: '2017', persona: 'Jorge Gracia',                 empresa: 'SITTRANS',                              email: 'jorge.contabilidad@sittrans.es',  pertenece: 'Sittrans',      area: 'Contabilidad'           },
    { telefono: '644848244', extension: '2403', persona: 'Daniel Ortegón',               empresa: 'ALQUITRUCK',                            email: 'entregas@gesticotrans.com',       pertenece: 'Alquitruck',    area: 'Vehículos'              },
    { telefono: '621003753', extension: '2404', persona: 'Rubén',                        empresa: 'ALQUITRUCK',                            email: 'vehiculos@gesticotrans.com',      pertenece: 'Alquitruck',    area: 'Vehículos'              },
    { telefono: '672735948', extension: '2201', persona: 'Xiomara Montero Beaz/ vinculado el 911610104', empresa: 'ECOTRANSPORTE', email: 'logistica@ecotransporte.es',      pertenece: 'Transcoop',     area: 'Gestores'               },
    { telefono: '644634845', extension: '2202', persona: 'Patricia Borja',               empresa: 'ECOTRANSPORTE',                         email: 'logistica2@ecotransporte.es',    pertenece: 'Ecotransporte', area: 'Gestores'               },
    { telefono: '653528973', extension: '2107', persona: 'Susana Domingo',               empresa: 'TRANSCOOP',                             email: 'logistica3@ecotransporte.es',    pertenece: 'Transcoop',     area: 'Gestores'               },
    { telefono: '621072430', extension: '2019', persona: 'Fernando Alda',                empresa: 'CENTRAL COOP',                          email: '',                               pertenece: 'Sittrans',      area: 'Gestores Externos'      },
    { telefono: '644070286', extension: '2020', persona: 'Raúl Garcés',                  empresa: 'CENTRAL COOP',                          email: 'gestion2@sittrans.es',           pertenece: 'Sittrans',      area: 'Gestores'               },
    { telefono: '674445568', extension: '2106', persona: 'Alba Asensio Cobos',           empresa: 'ECOTRANSPORTE',                         email: 'comunicacion@transcoop.es',      pertenece: 'Ecotransporte', area: 'Comercial y Marketing'  },
    { telefono: '674447526', extension: '2102', persona: 'Sara Escusol',                 empresa: 'TRANSCOOP',                             email: 'administracion@transcoop.es',    pertenece: 'Transcoop',     area: 'Administración'         },
    { telefono: '672735963', extension: '2111', persona: 'Iván Salido Robledo',          empresa: 'TRANSCOOP',                             email: 'trafico1@transcoop.es',          pertenece: 'Transcoop',     area: 'Sistemas'               },
    { telefono: '678186657', extension: '2018', persona: 'Viviana Rey',                  empresa: 'SITTRANS',                              email: 'coordinacion@sittrans.es',       pertenece: 'Sittrans',      area: 'Gestores Externos'      },
    { telefono: '672735971', extension: '2108', persona: 'Fernando Blázquez',            empresa: 'TRANSCOOP',                             email: 'logistica@sittrans.es',          pertenece: 'Sittrans',      area: 'Recepción'              },
    { telefono: '625799737', extension: '2200', persona: 'Sandra Diana Rubio',           empresa: 'ECOTRANSPORTE',                         email: 'info@ecotransporte.es',          pertenece: 'Ecotransporte', area: 'Gestores'               },
    { telefono: '635736602', extension: '2112', persona: 'Martín Cardona Pajón',         empresa: 'TRANSCOOP',                             email: 'martin.comercial@transcoop.es', pertenece: 'Transcoop',     area: 'Operaciones'            },
    { telefono: '645699519', extension: '2015', persona: 'Marta Sanz',                   empresa: 'TRANSCOOP',                             email: 'juridico@gesticotrans.com',      pertenece: 'Transcoop',     area: 'Gestores'               },
    { telefono: '654866012', extension: '2103', persona: 'Raquel Roche',                 empresa: 'TRANSCOOP',                             email: 'raquel.logistica@transcoop.es', pertenece: 'Transcoop',     area: 'Gestores'               },
    { telefono: '697885262', extension: '2402', persona: 'Daniel Bernal Hernández',      empresa: 'TRANSCOOP',                             email: 'autorizaciones@transcoop.es',   pertenece: 'Transcoop',     area: 'Vehículos'              },
    { telefono: '600025158', extension: '3010', persona: 'Juan Pablo Lalaguna',          empresa: 'TRANSCOOP',                             email: 'direccion@transcoop.es',         pertenece: '',              area: 'Dirección'              },
    { telefono: '603402352', extension: '2401', persona: 'José Clavero',                 empresa: 'ALQUITRUCK',                            email: 'autorizaciones@gesticotrans.com', pertenece: 'Alquitruck',   area: 'Operaciones'            },
    { telefono: '670637387', extension: '2101', persona: 'Alberto Gil Montalbán',        empresa: 'TRANSCOOP',                             email: '',                               pertenece: '',              area: 'Dirección'              },
    { telefono: '',          extension: '',     persona: 'Pablo Lalaguna Buj',           empresa: 'GESTICOTRANS',                          email: 'marketing@gesticotrans.com',     pertenece: 'Gesticotrans',  area: 'Comercial y Marketing'  },
    { telefono: '',          extension: '',     persona: '',                             empresa: 'GESTICOTRANS',                          email: 'gestion@gesticotrans.com',       pertenece: 'Gesticotrans',  area: 'Gestores'               },
    { telefono: '644241864', extension: '',     persona: 'Pamela',                       empresa: 'CENTRAL COOP',                          email: '',                               pertenece: 'CentralCoop',   area: 'Gestores'               },
  ];

  readonly empresasNumeros: EmpresaNumero[] = [
    { empresa: 'ALQUITRUCK, SL',                                   numero: '603402352', extension: '2401', usuario: 'José Clavero'       },
    { empresa: 'ALQUITRUCK, SL',                                   numero: '621003753', extension: '2404', usuario: 'Rubén'              },
    { empresa: 'ALQUITRUCK, SL',                                   numero: '644441326', extension: '2405', usuario: 'RESERVA'            },
    { empresa: 'ALQUITRUCK, SL',                                   numero: '644848244', extension: '2403', usuario: 'Daniel Ortegón'     },
    { empresa: 'CENTRAL COOPERATIVA LEVANTINA, COOPV.',            numero: '687601527', extension: '2302', usuario: 'María José'         },
    { empresa: 'CENTRAL COOPERATIVA LEVANTINA, COOPV.',            numero: '698902490', extension: '2301', usuario: 'María José'         },
    { empresa: 'ECOTRANSPORTE COOPERATIVO S COOP MAD',             numero: '621072637', extension: '2203', usuario: 'RESERVA'            },
    { empresa: 'ECOTRANSPORTE COOPERATIVO S COOP MAD',             numero: '625799737', extension: '2200', usuario: 'Sandra'             },
    { empresa: 'ECOTRANSPORTE COOPERATIVO S COOP MAD',             numero: '644634845', extension: '2202', usuario: 'Patricia'           },
    { empresa: 'ECOTRANSPORTE COOPERATIVO S COOP MAD',             numero: '672735948', extension: '2201', usuario: 'Xiomara'            },
    { empresa: 'GESTICOTRAS 4.0 GESTION DE TRANSPORTE SL',        numero: '600025158', extension: '3010', usuario: 'Pablo'              },
    { empresa: 'GESTICOTRAS 4.0 GESTION DE TRANSPORTE SL',        numero: '652527720', extension: '3014', usuario: 'RESERVA'            },
    { empresa: 'GESTICOTRAS 4.0 GESTION DE TRANSPORTE SL',        numero: '653919391', extension: '3013', usuario: 'Luis'               },
    { empresa: 'GESTICOTRAS 4.0 GESTION DE TRANSPORTE SL',        numero: '671252256', extension: '3012', usuario: 'Paula'              },
    { empresa: 'GESTICOTRAS 4.0 GESTION DE TRANSPORTE SL',        numero: '684460765', extension: '3015', usuario: 'RESERVA'            },
    { empresa: 'GESTICOTRAS 4.0 GESTION DE TRANSPORTE SL',        numero: '691228122', extension: '3011', usuario: 'Pilar'              },
    { empresa: 'INDIA LOGISTIC',                                   numero: '601599595', extension: '2603', usuario: 'RESERVA'            },
    { empresa: 'INDIA LOGISTIC',                                   numero: '601562413', extension: '2602', usuario: 'RESERVA'            },
    { empresa: 'INDIA LOGISTIC',                                   numero: '622722808', extension: '2604', usuario: 'RESERVA'            },
    { empresa: 'INDIA LOGISTIC',                                   numero: '690369124', extension: '2601', usuario: 'RESERVA'            },
    { empresa: 'NUEVO TRANSPORTE Y SOLUCIONES LOGISTICAS 5.0, SL',numero: '672735965', extension: '2501', usuario: 'RESERVA'            },
    { empresa: 'NUEVO TRANSPORTE Y SOLUCIONES LOGISTICAS 5.0, SL',numero: '684469746', extension: '2502', usuario: 'RESERVA'            },
    { empresa: 'SERVICIOS INTEGRALES AL TRANSPORTE EL PILAR, S.L.',numero: '635736602', extension: '2015', usuario: 'Marta Sanz'        },
    { empresa: 'SERVICIOS INTEGRALES AL TRANSPORTE EL PILAR, S.L.',numero: '644070286', extension: '2020', usuario: 'Raúl'              },
    { empresa: 'SERVICIOS INTEGRALES AL TRANSPORTE EL PILAR, S.L.',numero: '645699519', extension: '2015', usuario: 'Marta Sanz'        },
    { empresa: 'SERVICIOS INTEGRALES AL TRANSPORTE EL PILAR, S.L.',numero: '654834143', extension: '2008', usuario: 'Jorge Lafuente'    },
    { empresa: 'SERVICIOS INTEGRALES AL TRANSPORTE EL PILAR, S.L.',numero: '656510812', extension: '2004', usuario: 'Marcos'            },
    { empresa: 'SERVICIOS INTEGRALES AL TRANSPORTE EL PILAR, S.L.',numero: '656893633', extension: '2004', usuario: 'Marcos'            },
    { empresa: 'SERVICIOS INTEGRALES AL TRANSPORTE EL PILAR, S.L.',numero: '670959620', extension: '2001', usuario: 'Alberto'           },
    { empresa: 'SERVICIOS INTEGRALES AL TRANSPORTE EL PILAR, S.L.',numero: '678186657', extension: '2018', usuario: 'Viviana'           },
    { empresa: 'SERVICIOS INTEGRALES AL TRANSPORTE EL PILAR, S.L.',numero: '684464360', extension: '2016', usuario: 'Sara Liarte'       },
    { empresa: 'SERVICIOS INTEGRALES AL TRANSPORTE EL PILAR, S.L.',numero: '684467082', extension: '2017', usuario: 'Jorge Gracia'      },
    { empresa: 'SERVICIOS INTEGRALES AL TRANSPORTE EL PILAR, S.L.',numero: '691625162', extension: '2005', usuario: 'Laura Lorda'       },
    { empresa: 'TTE.COOPARAGONES S.COOPERATIVA',                   numero: '621074139', extension: '2109', usuario: 'RESERVA'           },
    { empresa: 'TTE.COOPARAGONES S.COOPERATIVA',                   numero: '635736602', extension: '2107', usuario: 'Susana'            },
    { empresa: 'TTE.COOPARAGONES S.COOPERATIVA',                   numero: '654181619', extension: '2110', usuario: 'RESERVA'           },
    { empresa: 'TTE.COOPARAGONES S.COOPERATIVA',                   numero: '654866012', extension: '2103', usuario: 'Raquel'            },
    { empresa: 'TTE.COOPARAGONES S.COOPERATIVA',                   numero: '670637387', extension: '2101', usuario: 'Alberto'           },
    { empresa: 'TTE.COOPARAGONES S.COOPERATIVA',                   numero: '672735963', extension: '2111', usuario: 'Iván'              },
    { empresa: 'TTE.COOPARAGONES S.COOPERATIVA',                   numero: '672735971', extension: '2108', usuario: 'Fernando Blázquez' },
    { empresa: 'TTE.COOPARAGONES S.COOPERATIVA',                   numero: '674447526', extension: '2102', usuario: 'Sara Escusol'      },
    { empresa: 'TTE.COOPARAGONES S.COOPERATIVA',                   numero: '674445568', extension: '2106', usuario: 'Alba'              },
    { empresa: 'TTE.COOPARAGONES S.COOPERATIVA',                   numero: '684464360', extension: '2105', usuario: 'Merche'            },
  ];

  exportarCSV() {
    const headers = ['Teléfono', 'Extensión', 'Persona', 'Empresa', 'Email', 'Pertenece', 'Área'];
    const esc = (v: any) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const filas = this.telefonos.map(t => [
      t.telefono, t.extension, t.persona, t.empresa, t.email, t.pertenece, t.area
    ].map(esc).join(','));
    const csv = '﻿' + [headers.map(esc).join(','), ...filas].join('\r\n');
    const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' })), download: `telefonos_${new Date().toISOString().split('T')[0]}.csv` });
    a.click();
  }

  get filteredTelefonos(): Telefono[] {
    const p = this.searchPersona.toLowerCase();
    return !p ? this.telefonos : this.telefonos.filter(t =>
      t.persona.toLowerCase().includes(p) || t.empresa.toLowerCase().includes(p)
    );
  }

  get filteredPorExtension(): Telefono[] {
    const e = this.searchExtension.toLowerCase();
    if (!e) return [];
    return this.telefonos.filter(t => t.extension.toLowerCase().includes(e));
  }
}
