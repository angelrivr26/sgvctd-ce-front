import { platformBrowser } from '@angular/platform-browser';
import { AppModule } from './app/app.module';

platformBrowser()
  .bootstrapModule(AppModule)
  .catch(() => {
    document.body.textContent =
      'No se pudo iniciar la aplicación. Actualice la página o contacte al administrador.';
  });
