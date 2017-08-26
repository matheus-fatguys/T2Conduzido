import { ComponentsModule } from './../../components/components.module';
import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ConducoesNaoAssociadasModalPage } from './conducoes-nao-associadas-modal';

@NgModule({
  declarations: [
    ConducoesNaoAssociadasModalPage,
  ],
  imports: [
    ComponentsModule,
    IonicPageModule.forChild(ConducoesNaoAssociadasModalPage),
  ],
})
export class ConducoesNaoAssociadasModalPageModule {}
