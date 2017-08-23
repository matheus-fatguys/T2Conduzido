import { DirectivesModule } from './../directives/directives.module';
import { MascaraDirective } from './../directives/mascara/mascara';
import { IonicModule } from 'ionic-angular';
import { NgModule } from '@angular/core';
import { SimpleComponent } from './simple/simple';
import { MapComponent } from './map/map';
import { PontoComponent } from './ponto/ponto';
import { AvailableCarsComponent } from './available-cars/available-cars';
import { PickupCarComponent } from './pickup-car/pickup-car';
import { DestinationAddressComponent } from './destination-address/destination-address';
import { DetalheConduzidoComponent } from './detalhe-conduzido/detalhe-conduzido';
import { MenuLateralComponent } from './menu-lateral/menu-lateral';
import { DetalheCondutorComponent } from './detalhe-condutor/detalhe-condutor';
import { DetalheRoteiroComponent } from './detalhe-roteiro/detalhe-roteiro';
import { DetalheVeiculoComponent } from './detalhe-veiculo/detalhe-veiculo';
import { DetalheConducaoComponent } from './detalhe-conducao/detalhe-conducao';
import { CaixaBuscaEnderecoComponent } from './caixa-busca-endereco/caixa-busca-endereco';
import { MapaCondutorComponent } from './mapa-condutor/mapa-condutor';
import { MapaPopOverComponent } from './mapa-pop-over/mapa-pop-over';
@NgModule({
	declarations: [SimpleComponent,
    MapComponent,
    PontoComponent,
    AvailableCarsComponent,
    PickupCarComponent,
    DestinationAddressComponent,
    DetalheConduzidoComponent,
    MenuLateralComponent,
    DetalheCondutorComponent,
    DetalheRoteiroComponent,
    DetalheVeiculoComponent,
    DetalheConducaoComponent,
    CaixaBuscaEnderecoComponent,
    MapaCondutorComponent,
    MapaPopOverComponent],
	imports: [IonicModule, DirectivesModule],
	exports: [SimpleComponent,
    MapComponent,
    PontoComponent,
    AvailableCarsComponent,
    PickupCarComponent,
    DestinationAddressComponent,
    DetalheConduzidoComponent,
    MenuLateralComponent,
    DetalheCondutorComponent,
    DetalheRoteiroComponent,
    DetalheVeiculoComponent,
    DetalheConducaoComponent,
    CaixaBuscaEnderecoComponent,
    MapaCondutorComponent,
    MapaPopOverComponent]
})
export class ComponentsModule {}
