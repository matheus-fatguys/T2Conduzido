import { ComponentsModule } from './../../components/components.module';
import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CadastroConducoesPage } from './cadastro-conducoes';

@NgModule({
  declarations: [
    CadastroConducoesPage,
  ],
  imports: [
    ComponentsModule,
    IonicPageModule.forChild(CadastroConducoesPage),
  ],
})
export class CadastroConducoesPageModule {}
