import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { MapaSelecaoLocalPage } from './mapa-selecao-local';

@NgModule({
  declarations: [
    MapaSelecaoLocalPage,
  ],
  imports: [
    IonicPageModule.forChild(MapaSelecaoLocalPage),
  ],
})
export class MapaSelecaoLocalPageModule {}
