import { AudioProvider } from './../../providers/audio/audio';
import { MapaConduzidoComponent } from './../../components/mapa-conduzido/mapa-conduzido';
import { Conducao } from './../../models/conducao';
import * as SlidingMarker from 'marker-animate-unobtrusive';
import { Conduzido } from './../../models/conduzido';
import { LocalizacaoProvider } from './../../providers/localizacao/localizacao';
import { TrajetoProvider } from './../../providers/trajeto/trajeto';
import { Perna } from './../../models/perna';
import { Trajeto } from './../../models/trajeto';
import { Observable, Subscription } from 'rxjs';
import { Local } from './../../models/local';
import { FatguysUberProvider } from './../../providers/fatguys-uber/fatguys-uber';
import { MensagemProvider } from './../../providers/mensagem/mensagem';
import { Roteiro } from './../../models/roteiro';
import { Component, OnDestroy, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, Platform, LoadingController } from 'ionic-angular';
import { Geolocation } from '@ionic-native/geolocation';



@IonicPage()
@Component({
  selector: 'page-viagem',
  templateUrl: 'viagem.html',
})
export class ViagemPage implements OnDestroy  {
  
  private tituloInicio: string = "Viagem";
  private tituloEmViagem:string="Em Viagem...";
  private viagemIniciada:boolean;
  private origemProxima:boolean;
  private destinoProximo:boolean;
  private conduzido={} as Conduzido;  
  @ViewChild(MapaConduzidoComponent)  
  private mapaCtrl: MapaConduzidoComponent;
  private esperandoConfirmacao=false;
  
  
  constructor(public navCtrl: NavController, 
    public navParams: NavParams,
    public fatguys: FatguysUberProvider,
    public localizacaoService: LocalizacaoProvider,
    public alertCtrl: AlertController,
    public audio: AudioProvider,
    private msg: MensagemProvider
    ) {    
     this.conduzido=this.fatguys.conduzido;
  }  

  onViagemIniciada($event){
    this.audio.play('iniciar-roteiro');
    this.viagemIniciada=true;
  }
  
  

  ngOnDestroy(): void {
    // this.unsubscribeObservables();
  }

  ionViewWillLeave(){
    // this.unsubscribeObservables();
  }
  
  ionViewDidLoad() {
    console.log('ionViewDidLoad ViagemPage');
  }
  
   

}

