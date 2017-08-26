import { ComponentsModule } from './../../components/components.module';
import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CondutoresPage } from './condutores';

@NgModule({
  declarations: [
    ComponentsModule
  ],
  imports: [
    ComponentsModule,
    IonicPageModule.forChild(CondutoresPage),
  ],
})
export class CondutoresPageModule {}
