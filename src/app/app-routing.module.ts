import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { sessionGuard } from './core/guards/session.guard';

const routes: Routes = [
  {
    path: 'ingresar',
    loadChildren: () => import('./modules/auth/auth.module').then((module) => module.AuthModule),
  },
  {
    path: 'comprobantes',
    canActivate: [sessionGuard],
    loadChildren: () =>
      import('./modules/comprobantes/comprobantes.module').then(
        (module) => module.ComprobantesModule,
      ),
  },
  { path: '', pathMatch: 'full', redirectTo: 'comprobantes' },
  { path: '**', redirectTo: 'comprobantes' },
];
@NgModule({ imports: [RouterModule.forRoot(routes)], exports: [RouterModule] })
export class AppRoutingModule {}
