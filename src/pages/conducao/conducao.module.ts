import { ComponentsModule } from './../../components/components.module';
import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ConducaoPage } from './conducao';

@NgModule({
  declarations: [
    ConducaoPage
  ],
  imports: [
    ComponentsModule,
    IonicPageModule.forChild(ConducaoPage),
  ],
})
export class ConducaoPageModule {}
