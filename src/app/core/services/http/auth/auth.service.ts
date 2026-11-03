import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map, of, tap } from 'rxjs';
import { environment } from '../../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  readonly usuario = signal<string | null>(null);
  login(usuario: string, clave: string) {
    return this.http
      .post<{ usuario: string }>(
        `${environment.API_URL}/auth/sesion`,
        { usuario, clave },
        { withCredentials: true },
      )
      .pipe(tap((session) => this.usuario.set(session.usuario)));
  }
  checkSession() {
    return this.http
      .get<{ usuario: string }>(`${environment.API_URL}/auth/sesion`, { withCredentials: true })
      .pipe(
        tap((session) => this.usuario.set(session.usuario)),
        map(() => true),
        catchError(() => {
          this.usuario.set(null);
          return of(false);
        }),
      );
  }
  logout() {
    return this.http
      .delete(`${environment.API_URL}/auth/sesion`, { withCredentials: true })
      .pipe(tap(() => this.usuario.set(null)));
  }
}
