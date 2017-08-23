import { ComponentsModule } from './../../components/components.module';
import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TestePage } from './teste';

@NgModule({
  declarations: [
    TestePage,
  ],
  imports: [
    ComponentsModule,
    IonicPageModule.forChild(TestePage),
  ],
})
export class TestePageModule {}
