import { NgModule, LOCALE_ID, provideZonelessChangeDetection } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { sessionInterceptor } from './core/interceptors/session.interceptor';

registerLocaleData(localeEs, 'es-PE');
@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, AppRoutingModule],
  providers: [
    provideHttpClient(withInterceptors([sessionInterceptor])),
    provideZonelessChangeDetection(),
    { provide: LOCALE_ID, useValue: 'es-PE' },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
