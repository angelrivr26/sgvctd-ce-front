import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/http/auth/auth.service';
import { errorMessage } from '../../../../shared/utils/error-message';

@Component({ selector: 'app-login', standalone: false, templateUrl: './login.component.html' })
export class LoginComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  usuario = '';
  clave = '';
  readonly loading = signal(false);
  readonly error = signal('');
  submit() {
    if (this.loading() || !this.usuario.trim() || !this.clave) return;
    this.loading.set(true);
    this.error.set('');
    this.auth.login(this.usuario.trim(), this.clave).subscribe({
      next: () => {
        this.clave = '';
        this.loading.set(false);
        void this.router.navigate(['/comprobantes']);
      },
      error: (error: unknown) => {
        this.clave = '';
        this.loading.set(false);
        this.error.set(errorMessage(error));
      },
    });
  }
}
