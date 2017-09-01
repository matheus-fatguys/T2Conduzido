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
  private conducao: Conducao;
  private prefixo: string="";
  private tempoParaChegada: string="SEM ESTIMATIVA";
  
  
  constructor(public navCtrl: NavController, 
    public navParams: NavParams,
    public fatguys: FatguysUberProvider,
    public localizacaoService: LocalizacaoProvider,
    public alertCtrl: AlertController,
    public audio: AudioProvider,
    private msg: MensagemProvider
    ) {    
     this.conduzido=this.fatguys.conduzido;
     if(this.conduzido==null){
       return;
     }
     if(this.fatguys.condutor==null
        ||this.fatguys.condutor.roteiroEmexecucao==null
        ||this.fatguys.condutor.roteiroEmexecucao.conducoes==null){
          return;
        }
        this.conducao=this.fatguys.condutor.roteiroEmexecucao.conducoes.find(
          conducao=>{return conducao.conduzido==this.conduzido.id});
    
  }  

  onTempoEstimado(segundos){
    this.tempoParaChegada=this.prefixo+Math.round(segundos/60)+" min";
  }

  onConducaoRealizada(conducao:Conducao){
    this.conducao=conducao;
    this.prefixo="";
    this.tempoParaChegada="No Destino";
  }
  onConducaoEmAndamento(conducao:Conducao){
    this.prefixo="Chegada em ";
    this.tempoParaChegada="Estimando...";
    this.conducao=conducao;
  }
  onConducaoEmbarcado(conducao:Conducao){
    this.prefixo="Desembarque em ";
    this.tempoParaChegada="Embarcado";
    this.conducao=conducao;
  }
  onConducaoCancelada(conducao:Conducao){
    this.prefixo="";
    this.tempoParaChegada="SEM ESTIMATIVA";
    this.conducao=conducao;
  }

  centralizarMapa(){    
    this.mapaCtrl.centralizarMapa();
  }
  centralizarMapaNoCondutor(){    
    this.mapaCtrl.centralizarMapaNoCondutor();
  }
  centralizarMapaNoConduzido(){    
    this.mapaCtrl.centralizarMapaNoConduzido();
  }

  confirmarCancelamento(){
    let confirm = this.alertCtrl.create({
      title: 'Avisar Falta',
      message: "Avisar ao condutor que faltará?",
      buttons: [
        {
          text: 'Cancelar',
          handler: () => {
            
          }
        },
        {
          text: 'OK',
          handler: (opcoes) => {
            this.avisarCancelamento(this.conducao);
          }
        }
      ]
    });
    confirm.present();
  }

  avisarCancelamento(conducao:Conducao){
    conducao.cancelada=true;
    conducao.emAndamento=false;
    conducao.embarcado=false;
    conducao.realizada=false;
    this.fatguys.salvarConducao(conducao);
    this.fatguys.cancelarConducaoRoteiro(conducao);
    this.fatguys.cancelarConducaoRoteiroAndamento(conducao);
  }
  confirmarNormalizacao(){
    let confirm = this.alertCtrl.create({
      title: 'Avisar Comparecimento',
      message: "Avisar ao condutor que comparecerá?",
      buttons: [
        {
          text: 'Cancelar',
          handler: () => {
            
          }
        },
        {
          text: 'OK',
          handler: (opcoes) => {
            this.avisarNormalizacao(this.conducao);
          }
        }
      ]
    });
    confirm.present();
  }

  avisarNormalizacao(conducao:Conducao){
    conducao.cancelada=false;
    this.fatguys.salvarConducao(conducao);
    this.fatguys.normalizarConducaoRoteiro(conducao);
    this.fatguys.normalizarConducaoRoteiroAndamento(conducao);
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

