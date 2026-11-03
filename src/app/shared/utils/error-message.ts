import { HttpErrorResponse } from '@angular/common/http';

export function errorMessage(error: unknown): string {
  if (error instanceof HttpErrorResponse) {
    if (error.status === 0)
      return 'No se pudo conectar con el servicio. Verifique que el backend esté iniciado.';
    if (error.status === 401) return 'La sesión no está disponible. Vuelva a ingresar.';
    return error.error?.error?.mensaje || 'No se pudo completar la operación. Intente nuevamente.';
  }
  return 'No se pudo completar la operación.';
}
