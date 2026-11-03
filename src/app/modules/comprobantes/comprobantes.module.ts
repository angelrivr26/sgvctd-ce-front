import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { ConsultaComponent } from './components/consulta/consulta.component';
import { DetalleComponent } from './components/detalle/detalle.component';

@NgModule({
  declarations: [ConsultaComponent, DetalleComponent],
  imports: [
    SharedModule,
    FormsModule,
    RouterModule.forChild([
      { path: '', component: ConsultaComponent },
      { path: ':id', component: DetalleComponent },
    ]),
  ],
})
export class ComprobantesModule {}
