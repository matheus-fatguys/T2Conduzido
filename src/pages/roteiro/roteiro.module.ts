import { ComponentsModule } from './../../components/components.module';
import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { RoteiroPage } from './roteiro';

@NgModule({
  declarations: [
    RoteiroPage,
  ],
  imports: [
    IonicPageModule.forChild(RoteiroPage),
    ComponentsModule
  ],
})
export class RoteiroPageModule {}
