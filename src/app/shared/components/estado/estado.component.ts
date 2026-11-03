import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-estado',
  standalone: false,
  template:
    '<span class="badge" [attr.data-state]="estado"><span class="badge-dot"></span>{{ etiqueta }}</span>',
})
export class EstadoComponent {
  @Input() estado: string | null = null;
  get etiqueta(): string {
    const labels: Record<string, string> = {
      PENDIENTE: 'Pendiente',
      PROCESANDO: 'Procesando',
      PROCESADO: 'Procesado',
      REQUIERE_ATENCION: 'Requiere atención',
      CAPTURADO_PRUEBA: 'Capturado en pruebas',
      ENVIADO: 'Enviado',
      SIMULADO: 'Simulado',
      RESULTADO_INCIERTO: 'Por confirmar',
      RECHAZADO_SIMULADO: 'Rechazo simulado',
      NO_HABILITADOS: 'Esperando resultado de emisión',
      PENDIENTES: 'Documentos pendientes',
      GENERANDO: 'Generando documentos',
      DISPONIBLES: 'Documentos disponibles',
      ERROR: 'Documentos por recuperar',
    };
    return this.estado ? labels[this.estado] || this.estado : 'Sin envío';
  }
}
