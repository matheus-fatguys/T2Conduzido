import { AudioProvider } from './../../providers/audio/audio';
import { MapaCondutorComponent } from './../../components/mapa-condutor/mapa-condutor';
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
  private roteiro={} as Roteiro;  
  @ViewChild(MapaCondutorComponent)  
  private mapaCtrl: MapaCondutorComponent;
  private esperandoConfirmacao=false;
  
  
  constructor(public navCtrl: NavController, 
    public navParams: NavParams,
    public fatguys: FatguysUberProvider,
    public localizacaoService: LocalizacaoProvider,
    public alertCtrl: AlertController,
    public audio: AudioProvider,
    private msg: MensagemProvider
    ) {    
     let roteiro=this.navParams.get('roteiro');
      if(roteiro){
        this.roteiro=roteiro;      
      }      
  }  

  onViagemIniciada($event){
    this.audio.play('iniciar-roteiro');
    this.viagemIniciada=true;
  }
  
  onOrigemProxima(conducoes:Array<Conducao>){
    if(this.esperandoConfirmacao){
      return;
    }

    let c=conducoes.findIndex(c=>{
      return c.emAndamento;
    })

    if(c<0){
      return;
    }

    this.esperandoConfirmacao=true;
    this.origemProxima=true;
    this.confirmarConduzidoABordo(conducoes);
  }

  onDestinoProximo(conducoes:Array<Conducao>){
    if(this.esperandoConfirmacao){
      return;
    }

    let c=conducoes.findIndex(c=>{
      return c.embarcado;
    })

    if(c<0){
      return;
    }

    this.esperandoConfirmacao=true;
    this.destinoProximo=true;
    this.confirmarDeixouConduzidoNoDestino(conducoes);
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

  navegar(navegador:string){
    try {
      let trajeto:Trajeto =this.fatguys.condutor.roteiroEmexecucao.trajeto;
      let t="";
      if(navegador=='googleMaps'){
        t ='https://www.google.com/maps/dir/?api=1&origin='+this.fatguys.condutor.localizacao.latitude
        // var t ='https://www.google.com/maps/dir/?api=1&origin='+this.fatguys.condutor.localizacao.latitude
        +','+this.fatguys.condutor.localizacao.longitude
        +'&destination='+trajeto.pernas[trajeto.pernas.length-1].local.endereco
        +'&travelmode=driving';
        if(trajeto.pernas.length>1){
          t+='&waypoints=';
          for(var i = 0;i<trajeto.pernas.length-1;i++){
              t+=trajeto.pernas[i].local.endereco+'%7C';
          }
        }
      }
      else if(navegador=='waze'){
        t ='https://waze.com/ul?ll='+trajeto.pernas[0].local.latitude
        // var t ='https://www.google.com/maps/dir/?api=1&origin='+this.fatguys.condutor.localizacao.latitude
        +'&'+trajeto.pernas[0].local.longitude
        +'&navigate=yes';
        // if(trajeto.pernas.length>1){
        //   t+='&waypoints=';
        //   for(var i = 0;i<trajeto.pernas.length-1;i++){
        //       t+=trajeto.pernas[i].local.endereco+'%7C';
        //   }
        // }
      }
      else if(navegador=='mapsiOS'){

      }
      window.open(t, '_system');      
    } catch (error) {
      this.msg.mostrarErro("Erro inicializando o maps: "+error);
    }
  }

  mostrarOpcoesDeNavegacao(){
    let confirm = this.alertCtrl.create({
      title: 'Abrir Navegador',
      message: 'Escolha o Navegador:',
      inputs:[{
              type:'radio',
              value:'googleMaps',
              label: 'Google Maps',
              checked: true
            },
            {
              type:'radio',
              value:'waze',
              label: 'Waze',
              checked: false
            },
            {
              type:'radio',
              value:'mapsiOS',
              label: 'Maps(somente iOs)',
              checked: false
            },
    ],
      buttons: [
        {
          text: 'Cancelar',
          handler: () => {
            
          }
        },
        {
          text: 'OK',
          handler: (navegador) => {
            this.navegar(navegador);
          }
        }
      ]
    });
    confirm.present();
  }

  centralizarMapaNoCondutor(){
    this.mapaCtrl.centralizarMapaNoCondutor();
  }  

  centralizarMapaNoTrajeto(){
    this.mapaCtrl.centralizarMapaNoTrajeto();
  }

  pararViagem(){
    try {
      this.viagemIniciada=false;
      this.localizacaoService.pararRastreamento();
      if(this.roteiro.trajeto!=null&&this.roteiro.trajeto.pernas!=null){
        this.roteiro.trajeto.pernas.forEach(
          p=>{
            p.caminho=null;
          }
        )
      }
      this.fatguys.interromperRoteiro(this.roteiro).then(
        r=>{
          this.esperandoConfirmacao=false;
          this.audio.play('interromper-roteiro');
          this.navCtrl.setRoot('CadastroRoteirosPage');
        }
      )
      
    } catch (error) {
      this.msg.mostrarErro("erro parando roteiro: "+error);
    }
  }

  confirmarPararViagem(){
    let confirm = this.alertCtrl.create({
      title: 'Parar Viagem',
      message: 'Confrma que vai parar?',
      buttons: [
        {
          text: 'Cancelar',
          handler: () => {
            
          }
        },
        {
          text: 'OK',
          handler: () => {
            this.pararViagem();
          }
        }
      ]
    });
    confirm.present();
  }

  conduzidoEmbarcou(conducoes:Conducao[]){
    conducoes.forEach(
      c=>{
        c.cancelada=false;
        c.emAndamento=false;
        c.embarcado=true;
        c.realizada=false;
        c.inicio=new Date();
        var cr=this.roteiro.conducoes.find(crr=>{
          return crr.id==c.id;
        })
        cr.cancelada=false;
        cr.emAndamento=false;
        cr.embarcado=true;
        cr.realizada=false;
        cr.inicio=new Date();
      }
    );

    this.fatguys.salvarConducoesDoRoteiro(this.roteiro)
    .then(_=>{
      this.esperandoConfirmacao=false;
    });
  }
  conduzidoDesembarcou(conducoes:Conducao[]){
    this.esperandoConfirmacao=false;
    conducoes.forEach(
      c=>{
        c.cancelada=false;
        c.emAndamento=false;
        c.embarcado=false;
        c.realizada=true;
        c.fim=new Date();
        console.log(c);
      }
    )
    this.fatguys.salvarConducoesDoRoteiro(this.roteiro).then(
      r=>{
        var i=this.roteiro.conducoes.findIndex(
          c=>{
            this.esperandoConfirmacao=false;
            return !c.realizada&&!c.cancelada;
          }
        )
        if(i<0){
          this.roteiroFinalizado();
        }
      }
    );
  }

  roteiroFinalizado(){
    this.localizacaoService.pararRastreamento();
    this.audio.play('concluir-roteiro');
    this.fatguys.finalizarRoteiro(this.roteiro).then(
      r=>{
        let confirm = this.alertCtrl.create({
          title: 'Roteiro Finalizado',
          message: "Você finalizou o roteiro",
          buttons: [          
            {
              text: 'OK',
              handler: (opcoes) => {
                this.navCtrl.setRoot('CadastroRoteirosPage');
              }
            }
          ]
        });
        confirm.present();
      }
    )
  }

  confirmarDeixouConduzidoNoDestino(conducoes:Conducao[]){
    let confirm = this.alertCtrl.create({
      title: 'Desembarque',
      message: "Marque os conduzidos que desembarcaram agora",
      buttons: [
        {
          text: 'Cancelar',
          handler: () => {
            
          }
        },
        {
          text: 'OK',
          handler: (opcoes) => {
            var cs=[];
            opcoes.forEach(o => {
                var co=conducoes.find(
                  c=>{
                    return c.id==o;
                  }
                )
              if(co!=null){
                cs.push(co);
              }
            });
            this.conduzidoDesembarcou(cs);
          }
        }
      ]
    });

    conducoes.forEach(
      c=>{
        confirm.addInput({
          type: 'checkbox',
          label: c.conduzidoVO.nome,
          value: c.id,
          checked: true
        });
      }
    )

    confirm.present();
  }

  confirmarConduzidoABordo(conducoes:Conducao[]){

    let confirm = this.alertCtrl.create({
      title: 'Conduzido a Bordo',
      message: "Marque os conduzidos embarcaram agora",
      buttons: [
        {
          text: 'Cancelar',
          handler: () => {
            
          }
        },
        {
          text: 'OK',
          handler: (opcoes) => {
            var cs=[];
            opcoes.forEach(o => {
              var co=conducoes.find(
                c=>{
                  return c.id==o;
                }
              )
              if(co!=null){
                cs.push(co);
              }
            });
            this.conduzidoEmbarcou(cs);
          }
        }
      ]
    });

    conducoes.forEach(
      c=>{
        confirm.addInput({
          type: 'checkbox',
          label: c.conduzidoVO.nome,
          value: c.id,
          checked: true
        });
      }
    )

    confirm.present();
  }

  informarEmbarcados(){
    let confirm = this.alertCtrl.create({
      title: 'Informar Embarcados',
      message: "",
      buttons: [
        {
          text: 'Cancelar',
          handler: () => {
            
          }
        },
        {
          text: 'OK',
          handler: (opcoes) => {
            var cs=[];
            opcoes.forEach(o => {
              var co=this.roteiro.conducoes.find(
                c=>{
                  return c.id==o;
                }
              )
              if(co!=null){
                cs.push(co);
              }
            });
            this.conduzidoEmbarcou(cs);
          }
        }
      ]
    });

    this.roteiro.conducoes.forEach(
      c=>{
        confirm.addInput({
          type: 'checkbox',
          label: c.conduzidoVO.nome,
          value: c.id,
          checked: c.embarcado
        });
      }
    )

    confirm.present();
  }
  informarDesembarcados(){
    let confirm = this.alertCtrl.create({
      title: 'Informar Desembarcados',
      message: "",
      buttons: [
        {
          text: 'Cancelar',
          handler: () => {
            
          }
        },
        {
          text: 'OK',
          handler: (opcoes) => {
            var cs=[];
            opcoes.forEach(o => {
              var co=this.roteiro.conducoes.find(
                c=>{
                  return c.id==o;
                }
              )
              if(co!=null){
                cs.push(co);
              }
            });
            this.conduzidoDesembarcou(cs);
          }
        }
      ]
    });

    this.roteiro.conducoes.forEach(
      c=>{
        confirm.addInput({
          type: 'checkbox',
          label: c.conduzidoVO.nome,
          value: c.id,
          checked: c.realizada
        });
      }
    )

    confirm.present();
  }

}

