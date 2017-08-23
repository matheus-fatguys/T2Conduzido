import { DirectivesModule } from './../../directives/directives.module';
import { ComponentsModule } from './../../components/components.module';
import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ConduzidoPage } from './conduzido';

@NgModule({
  declarations: [
    ConduzidoPage,
  ],
  imports: [
    IonicPageModule.forChild(ConduzidoPage),
    ComponentsModule,
    DirectivesModule
  ],
})
export class ConduzidoPageModule {}
