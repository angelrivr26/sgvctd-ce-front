import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './core/services/http/auth/auth.service';

@Component({ selector: 'app-root', standalone: false, templateUrl: './app.component.html' })
export class AppComponent {
  readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  readonly error = signal('');
  logout() {
    this.auth.logout().subscribe({
      next: () => {
        void this.router.navigate(['/ingresar']);
      },
      error: () => this.error.set('No se pudo cerrar la sesión. Intente nuevamente.'),
    });
  }
}
