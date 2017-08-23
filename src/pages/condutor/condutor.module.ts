import { ComponentsModule } from './../../components/components.module';
import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CondutorPage } from './condutor';

@NgModule({
  declarations: [
    CondutorPage,
  ],
  imports: [
    IonicPageModule.forChild(CondutorPage),
    ComponentsModule
  ],
})
export class CondutorPageModule {}
