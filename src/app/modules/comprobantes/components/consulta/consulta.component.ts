import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { Subject, catchError, filter, merge, of, switchMap, timer } from 'rxjs';
import { ComprobanteService } from '../../../../core/services/http/comprobante/comprobante.service';
import {
  CompraPrueba,
  Consulta,
  ListaComprobantes,
} from '../../../../core/models/comprobante.model';
import { errorMessage } from '../../../../shared/utils/error-message';

@Component({
  selector: 'app-consulta',
  standalone: false,
  templateUrl: './consulta.component.html',
})
export class ConsultaComponent implements OnInit {
  private readonly api = inject(ComprobanteService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly reload = new Subject<void>();
  readonly result = signal<ListaComprobantes | null>(null);
  readonly loading = signal(false);
  readonly error = signal('');
  readonly notice = signal('');
  readonly showDemo = signal(false);
  readonly creating = signal(false);
  readonly updatedAt = signal<Date | null>(null);
  filters: Consulta = {
    pagina: 1,
    limite: 15,
    fecha: '',
    estado: '',
    modalidad: '',
    tipo: '',
    buscar: '',
  };
  demo: CompraPrueba = {
    modalidad: 'NORMAL',
    tipoComprobante: 'BOLETA',
    cantidad: 1,
    escenarioPrueba: 'EXITO',
  };
  ngOnInit() {
    merge(
      of(undefined),
      this.reload,
      timer(5000, 5000).pipe(filter(() => document.visibilityState === 'visible')),
    )
      .pipe(
        switchMap(() => {
          this.loading.set(true);
          return this.api.list(this.filters).pipe(
            catchError((error: unknown) => {
              this.error.set(errorMessage(error));
              this.loading.set(false);
              return of(null);
            }),
          );
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((result) => {
        this.loading.set(false);
        if (result) {
          this.result.set(result);
          this.error.set('');
          this.updatedAt.set(new Date());
        }
      });
  }
  refresh(resetPage = false) {
    if (resetPage) this.filters.pagina = 1;
    this.reload.next();
  }
  clear() {
    this.filters = {
      pagina: 1,
      limite: 15,
      fecha: '',
      estado: '',
      modalidad: '',
      tipo: '',
      buscar: '',
    };
    this.refresh();
  }
  page(delta: number) {
    this.filters.pagina += delta;
    this.refresh();
  }
  get lastPage(): number {
    return Math.max(1, Math.ceil((this.result()?.resumen.total || 0) / this.filters.limite));
  }
  createDemo() {
    if (this.creating()) return;
    this.creating.set(true);
    this.error.set('');
    this.api.demo(this.demo).subscribe({
      next: (response) => {
        this.creating.set(false);
        this.showDemo.set(false);
        this.notice.set(
          `Compra ${response.comprobante.compraId} recibida. Se procesará automáticamente.`,
        );
        this.clear();
      },
      error: (error: unknown) => {
        this.creating.set(false);
        this.error.set(errorMessage(error));
      },
    });
  }
  detail(id: string) {
    void this.router.navigate(['/comprobantes', id]);
  }
}
