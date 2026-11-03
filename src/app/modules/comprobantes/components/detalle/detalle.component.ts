import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { Subject, catchError, filter, merge, of, switchMap, timer } from 'rxjs';
import { ComprobanteService } from '../../../../core/services/http/comprobante/comprobante.service';
import { ComprobanteDetalle } from '../../../../core/models/comprobante.model';
import { errorMessage } from '../../../../shared/utils/error-message';

@Component({ selector: 'app-detalle', standalone: false, templateUrl: './detalle.component.html' })
export class DetalleComponent implements OnInit {
  private readonly api = inject(ComprobanteService);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  private readonly reload = new Subject<void>();
  private readonly id = this.route.snapshot.paramMap.get('id') || '';
  readonly item = signal<ComprobanteDetalle | null>(null);
  readonly error = signal('');
  readonly notice = signal('');
  readonly busy = signal(false);
  ngOnInit() {
    merge(
      of(undefined),
      this.reload,
      timer(4000, 4000).pipe(filter(() => document.visibilityState === 'visible')),
    )
      .pipe(
        switchMap(() =>
          this.api.detail(this.id).pipe(
            catchError((error: unknown) => {
              this.error.set(errorMessage(error));
              return of(null);
            }),
          ),
        ),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((item) => {
        if (item) {
          this.item.set(item);
          this.error.set('');
        }
      });
  }
  resend() {
    this.act('correo');
  }
  retry() {
    this.act('emision');
  }
  retryDeliveries() {
    this.act('entregas');
  }
  private act(type: 'correo' | 'emision' | 'entregas') {
    if (this.busy()) return;
    this.busy.set(true);
    this.error.set('');
    const request =
      type === 'correo'
        ? this.api.resend(this.id)
        : type === 'entregas'
          ? this.api.retryDeliveries(this.id)
          : this.api.retry(this.id);
    request.subscribe({
      next: () => {
        this.busy.set(false);
        this.notice.set(
          type === 'correo'
            ? 'Reenvío registrado en el buzón local de pruebas. Se utilizará el mismo comprobante.'
            : type === 'entregas'
              ? 'Entregas pendientes de recuperación. Se conservará la misma emisión.'
              : this.item()?.estadoDocumentos === 'ERROR'
                ? 'Recuperación registrada. Se prepararán los documentos de la misma emisión.'
                : 'Reintento registrado. Primero se consultará si la emisión ya existe.',
        );
        this.reload.next();
      },
      error: (error: unknown) => {
        this.busy.set(false);
        this.error.set(errorMessage(error));
      },
    });
  }
  get emailPending(): boolean {
    return (
      this.item()?.entregas.some(
        (delivery) =>
          delivery.tipo === 'CORREO' && ['PENDIENTE', 'PROCESANDO'].includes(delivery.estado),
      ) || false
    );
  }
  get failedDeliveries(): boolean {
    return (
      this.item()?.entregas.some((delivery) => delivery.estado === 'REQUIERE_ATENCION') || false
    );
  }
  historyLabel(action: string): string {
    const labels: Record<string, string> = {
      COMPRA_RECIBIDA: 'Compra recibida',
      EMISION_SIMULADA_COMPLETADA: 'Documentos de prueba generados',
      EMISION_SIMULADA_CONFIRMADA: 'Emisión simulada confirmada',
      DOCUMENTOS_DISPONIBLES: 'Documentos de prueba disponibles',
      REINTENTO_PROGRAMADO: 'Reintento programado',
      REQUIERE_ATENCION: 'Requiere atención',
      REINTENTO_MANUAL: 'Reintento solicitado',
      REENVIO_CORREO_SOLICITADO: 'Reenvío de correo solicitado',
      CORREO_CAPTURADO_PRUEBA: 'Correo capturado en pruebas',
      BOLETOS_CAPTURADO_PRUEBA: 'Notificación a Boletos capturada',
      BOLETOS_ENVIADO: 'Resultado comunicado a Boletos',
      REINTENTO_ENTREGAS_SOLICITADO: 'Recuperación de entregas solicitada',
    };
    return labels[action] || action;
  }
}
