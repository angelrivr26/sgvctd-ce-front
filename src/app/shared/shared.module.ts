import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EstadoComponent } from './components/estado/estado.component';

@NgModule({
  declarations: [EstadoComponent],
  imports: [CommonModule],
  exports: [EstadoComponent, CommonModule],
})
export class SharedModule {}
