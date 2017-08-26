import { DirectivesModule } from './../../directives/directives.module';
// import { TextMaskModule } from 'angular2-text-mask';
import { ComponentsModule } from './../../components/components.module';
import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { RegistrarPage } from './registrar';

@NgModule({
  declarations: [
    RegistrarPage,
  ],
  imports: [
    IonicPageModule.forChild(RegistrarPage),
    ComponentsModule,
    DirectivesModule,
  ],
})
export class RegistrarPageModule {}
