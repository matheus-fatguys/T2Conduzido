import { MapaPopOverComponent } from './../mapa-pop-over/mapa-pop-over';
import { MensagemProvider } from './../../providers/mensagem/mensagem';
import { Local } from './../../models/local';
import { Component, Input, OnChanges, SimpleChanges, EventEmitter, Output } from '@angular/core';
import { ModalController } from "ionic-angular";


@Component({
  selector: 'caixa-busca-endereco',
  templateUrl: 'caixa-busca-endereco.html'
})
export class CaixaBuscaEnderecoComponent implements OnChanges{

  private geocoder;
  @Input() local:Local={} as Local;
  @Input() rotulo:string="Endereço";
  @Output() onEnderecoSelecionado = new EventEmitter<Local>();
  locais:Local[];

  constructor(public msg: MensagemProvider,
    public modalCtrl: ModalController) {
    this.geocoder = new google.maps.Geocoder(); 
    this.locais=[] as Local[];
  }

  ngOnChanges(changes: SimpleChanges): void {
    // console.log(changes);
  }
  
  buscarLocal(){
    // this.buscar(this.local);
    let modal = this.modalCtrl.create('MapaSelecaoLocalPage', {local:this.local});
    modal.onDidDismiss(data => {
      console.log(data.local);
      this.local=data.local;
      this.onEnderecoSelecionado.emit(this.local);
    });
    modal.present();
  }

  buscar(local: Local){
    this.locais = [] as Local[];

    console.log(local);
    
    this.geocoder.geocode( {address: local.endereco}, (destinations, status) => {
      
      if (status === google.maps.GeocoderStatus.OK) {
        let d = destinations;//.slice(0,8); 
        for(var i=0;i<d.length;i++){
          this.locais[i]={} as Local;
          this.locais[i].endereco=d[i].formatted_address;
          this.locais[i].latitude=d[i].geometry.location.lat();
          this.locais[i].longitude=d[i].geometry.location.lng();
        }
      }
      else if (status === google.maps.GeocoderStatus.ZERO_RESULTS) {
        this.msg.mostrarErro("Destino desconhecido");
      }
    });
  }

  onCancel($event){
    this.locais = [] as Local[];
  }
  limpar(){
    this.local=null;
    while(this.locais.length>0){
      this.locais.pop();
    }
  }

  onLocalSelecionado(local: Local){  
    this.local=local;
    this.onEnderecoSelecionado.emit(this.local);
    this.locais = [];
  }

}
