import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CadastroRoteirosPage } from './cadastro-roteiros';

@NgModule({
  declarations: [
    CadastroRoteirosPage,
  ],
  imports: [
    IonicPageModule.forChild(CadastroRoteirosPage),
  ],
})
export class CadastroRoteirosPageModule {}
