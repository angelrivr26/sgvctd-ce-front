import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';
import {
  Comprobante,
  ComprobanteDetalle,
  CompraPrueba,
  Consulta,
  ListaComprobantes,
} from '../../../models/comprobante.model';

@Injectable({ providedIn: 'root' })
export class ComprobanteService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.API_URL}/comprobantes`;
  list(filters: Consulta) {
    let params = new HttpParams();
    for (const [key, value] of Object.entries(filters))
      if (value !== '') params = params.set(key, String(value));
    return this.http.get<ListaComprobantes>(this.url, { params, withCredentials: true });
  }
  detail(id: string) {
    return this.http.get<ComprobanteDetalle>(`${this.url}/${id}`, { withCredentials: true });
  }
  retry(id: string) {
    return this.http.post<Comprobante>(
      `${this.url}/${id}/reintentar`,
      {},
      { withCredentials: true },
    );
  }
  resend(id: string) {
    return this.http.post(`${this.url}/${id}/reenviar-correo`, {}, { withCredentials: true });
  }
  retryDeliveries(id: string) {
    return this.http.post(`${this.url}/${id}/reintentar-entregas`, {}, { withCredentials: true });
  }
  demo(input: CompraPrueba) {
    return this.http.post<{ comprobante: Comprobante; duplicado: boolean }>(
      `${environment.API_URL}/pruebas/compras`,
      input,
      { withCredentials: true },
    );
  }
}
