import { ComponentsModule } from './../../components/components.module';
import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CadastroConduzidosPage } from './cadastro-conduzidos';

@NgModule({
  declarations: [
    CadastroConduzidosPage,
  ],
  imports: [
    ComponentsModule,
    IonicPageModule.forChild(CadastroConduzidosPage),
  ],
})
export class CadastroConduzidosPageModule {}
