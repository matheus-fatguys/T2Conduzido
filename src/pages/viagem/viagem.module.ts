import { ComponentsModule } from './../../components/components.module';
import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ViagemPage } from './viagem';

@NgModule({
  declarations: [
    ViagemPage,
  ],
  imports: [
    IonicPageModule.forChild(ViagemPage),
    ComponentsModule
  ],
})
export class ViagemPageModule {}
