import { Condutor } from './../../models/condutor';
import { FatguysUberProvider } from './../fatguys-uber/fatguys-uber';
import { Platform } from 'ionic-angular';
import { BackgroundGeolocation } from '@ionic-native/background-geolocation';
import { Geolocation, Geoposition } from '@ionic-native/geolocation';
import { MensagemProvider } from './../mensagem/mensagem';
import { Injectable, NgZone } from '@angular/core';
import { Observable, Subscription } from 'rxjs';

@Injectable()
export class LocalizacaoProvider {

  private frequenciaRastreamento=10000;

  private rastreamentoBginiciado=false;
  private rastreando=false;

  // private localizacao: google.maps.LatLng;
  private localizacaoObserver;
  private obs;
  private timeUltimaPosicao:Date;
  // private condutor:Condutor;
  public localizacaoCondutorSubscription:Subscription;

  constructor(public msg: MensagemProvider,
              public platform: Platform,
              public geolocation: Geolocation,
              public zone: NgZone,
              public backgroundGeolocation: BackgroundGeolocation,
              public fatguys: FatguysUberProvider,
            ) {
              // console.log("cordova: "+this.platform.is("cordova"));
              // console.log("android: "+this.platform.is("android"));
              // console.log("ios: "+this.platform.is("ios"));
              // console.log("web: "+this.platform.is("web"));
              // console.log("mobile: "+this.platform.is("mobile"));
              // console.log("core: "+this.platform.is("core"));
              // console.log("mobileweb: "+this.platform.is("mobileweb"));
              
  }
  
  iniciarGeolocalizacao():Observable<google.maps.LatLng>{
    let obs:Observable<google.maps.LatLng>;
    obs=Observable.create(
      observable=>{
          this.platform.ready().then(
          a=>{            
            if(this.platform.is("cordova")){
              this.registrarListenersDeBackForeGround();
            }
            console.log("!!!!!!!!vai pedir a posição")
            this.geolocation.getCurrentPosition({timeout:10000, enableHighAccuracy: true})
            .then(resp=>{          
                  var localizacao = new google.maps.LatLng(resp.coords.latitude, resp.coords.longitude);
                  this.atualizarLocalizacaoCondutor(resp.coords.latitude, resp.coords.longitude);                   
                  
                  let ref =this.fatguys.atualizarLocalizacaoCondutor(this.fatguys.condutor)
                  .then(
                    r=>{                      
                      //observable.next(this.condutor.localizacaoSimulada);
                      this.iniciarRastreamento();
                      observable.next(localizacao);              
                    },
                  ).catch(
                    error=>{
                      observable.error(error);
                    });    
                }).catch(error=>{
                    observable.error(error);
                });
          }).catch(error=>{            
              observable.error(error);                
          });
      }
    );    
    return obs;
  }

  atualizarLocalizacaoCondutor(lat, lng){
    if(this.fatguys.condutor!=null){
      if(this.fatguys.condutor.localizacao.latitude==lat
      &&this.fatguys.condutor.localizacao.longitude==lng){
        console.log("MESMA Localização, ENTÕ NÃO PRECISA SALVAR");
        return;
      }
      if(this.fatguys.condutor.localizacao==null){
        this.fatguys.condutor.localizacao={latitude:lat, longitude:lng};
      }
      else{
        this.fatguys.condutor.localizacao.latitude=lat;
        this.fatguys.condutor.localizacao.longitude=lng;                  
      }
      this.fatguys.atualizarLocalizacaoCondutor(this.fatguys.condutor).then(
        p=>{
          // this.msg.mostrarMsg("Localização do condutor salva", 3000);
          // this.msg.mostrarMsg('LocalizaçãoProvider: Localização do condutor salva:  ' + this.fatguys.condutor.localizacao.latitude + ',' + this.fatguys.condutor.localizacao.longitude, 4000);  
          console.log('LocalizaçãoProvider: Localização do condutor salva:  ' + this.fatguys.condutor.localizacao.latitude + ',' + this.fatguys.condutor.localizacao.longitude, 4000);  
          console.log("Localização do condutor salva");
        }
      )
      .catch(
        error=>{
          this.msg.mostrarErro("Erro atualizando localização de condutor: "+error, 3000);
          console.error(error);
        }
      );
    }
  }

  iniciarRastreamentoBackGround() {
    if(this.rastreamentoBginiciado){
      console.log("tentativa de iniciar rastreamento de background já inciado");
    }
    this.rastreamentoBginiciado=true;
    // this.msg.mostrarMsg("Inciar rastreamento background", 3000);
    console.log("RASTREAMENTO BACKGROUND CHAMADO");
    // Background Tracking 
    let config = {
      desiredAccuracy: 0,
      stationaryRadius: 20,
      distanceFilter: 10, 
      debug: false,
      interval: this.frequenciaRastreamento 
    };
  
    this.backgroundGeolocation.configure(config).subscribe((location) => {  
      console.log("RASTREAMENTO BACKGROUND OBTEVE LOCALIZAÇÃO");
      console.log('BACKGROUND BackgroundGeolocation:  ' + location.latitude + ',' + location.longitude);  
      // this.msg.mostrarMsg('BackgroundGeolocation:  ' + location.latitude + ',' + location.longitude, 4000);  
      // Run update inside of Angular's zone
      this.zone.run(() => {
        console.log("LOCALIZAÇÃO BACKGROUND OBTIDA");
        // this.msg.mostrarMsg("Localização obtida em BACKGROUND", 3000);
        // this.fatguys.condutor.localizacao =new google.maps.LatLng( location.latitude, location.longitude);
        this.atualizarLocalizacaoCondutor(location.latitude, location.longitude);            
      });  
    }, (err) => {  
      console.log("RASTREAMENTO BACKGROUND ERRO");
      console.log(err);  
    });
  
    // Turn ON the background-geolocation system.
    console.log("inciando RASTREAMENTO BACKGROUND");
    this.backgroundGeolocation.start().then(
      r=>{
        this.rastreamentoBginiciado=true;
        console.log("=======> RASTREAMETO BACKGROUND INICIADO");
      }
    ).catch(
      error=>{
        console.error("erro INICIANDO localização de background: "+error);
      }
    );;
  
    
  }
 
  pararRastreamentoBackGround() {
    console.log('stopTracking'); 
    // this.msg.mostrarMsg("Parar rastreamento background");
    this.backgroundGeolocation.stop().then(
      r=>{
        this.rastreamentoBginiciado=false;
        console.log("=======> RASTREAMETO BACKGROUND PARAD0");
        console.log("=======> FINALIZANDO BACKGROUND");
        this.backgroundGeolocation.finish().then(
          r=>{
            this.rastreamentoBginiciado=false;
            console.log("=======> RASTREAMETO BACKGROUND FINALIZADO");
          }
        ).catch(
          error=>{
            console.error("erro FINALIZANDO localização de BACKGROUND: "+error);
          }
        );
      }
    ).catch(
      error=>{
        console.error("erro parando localização de background: "+error);
      }
    );    
    console.log("PARAR RASTREAMENTO BACKGROUND CHAMADO");
  }

  iniciarRastreamentoForeground(){// Foreground Tracking
    console.log("iniciarRastreamentoForeground: this.localizacaoObserver!=null?: "+(this.localizacaoObserver!=null));
    if(this.localizacaoObserver!=null){
      this.localizacaoObserver.unsubscribe();
      console.log("iniciarRastreamentoForeground: this.localizacaoObserver.unsubscribe()");
    }

    let options = {
      frequency: this.frequenciaRastreamento, 
      enableHighAccuracy: true
    };

    this.timeUltimaPosicao=null;
    if(this.obs==null){
      console.log("=======> CRIANDO WATCHER DE FOREGROUND: subscription anterior nula?: "+(this.localizacaoObserver==null));
      this.obs = this.geolocation
      .watchPosition(options).distinctUntilChanged()
      .filter((p: any) => p.code === undefined);
    }
    else{
      console.log("=======> WATCHER DE FOREGROUND JÁ EXISTIA: subscription anterior nula?: "+(this.localizacaoObserver==null));
    }
    
    this.localizacaoObserver=this.obs.subscribe((position: Geoposition) => {
      var agora:Date=new Date();
      if(this.timeUltimaPosicao==null){
        console.log("primeira vez do watch de FOREGROUND")
        this.timeUltimaPosicao=agora;
      }
      
      if(agora.getTime()-this.timeUltimaPosicao.getTime()<this.frequenciaRastreamento){
        console.log("watch de FOREGROUND rejeitando posição devido a ter menos de "+this.frequenciaRastreamento/1000+"seg")
        return;
      }
      console.log("watch de FOREGROUND aceitando nova posição devido a ter mais de "+this.frequenciaRastreamento/1000+"seg")
      this.timeUltimaPosicao=agora;
      console.log(position);
    
      // Run update inside of Angular's zone
      // this.zone.run(() => {
        console.log("RASTREAMENTO FOREGROUND LOCALIZAÇÃO OBTIDA");
        // this.msg.mostrarMsg("Localização obtida em watch de FOREGROUND", 3000);
        // this.localizacao =new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
        this.atualizarLocalizacaoCondutor(position.coords.latitude, position.coords.longitude);                   
      // });  
    });
  }

  iniciarRastreamento(){
    this.rastreando=true;
    this.iniciarRastreamentoForeground();
    // this.msg.mostrarMsg("Inciar rastreamento");
    // if(!this.platform.is('core')&&!this.platform.is('mobileweb')){
    //   this.iniciarRastreamentoBackGround();
    // }
    // else{
    //   console.log("não é platafora adequada para rastreamento de background");
    // }
  }
  pararRastreamento(){
    console.log("parar rastreamento chamado");
    this.rastreando=false;
    if(this.localizacaoObserver!=null){
      console.log("parar rastreamento: this.localizacaoObserver.unsubscribe()");
      this.localizacaoObserver.unsubscribe(); 
    }
    if(!this.rastreamentoBginiciado){
      console.log("tentativa de parar rastreamento de background não iniciado");
    }
    // this.msg.mostrarMsg("Parar rastreamento");
    if(this.rastreamentoBginiciado&&!this.platform.is('core')&&!this.platform.is('mobileweb')){
      console.log("parar rastreamento: this.pararRastreamentoBackGround()");
      this.pararRastreamentoBackGround();
    }
  }

  registrarListenersDeBackForeGround(){
    if(this.platform.is("cordova")){
      this.platform.pause.subscribe(
        _=>{
          if(this.rastreando){
            console.log("APLICAÇÃO EM BACKGROUND, ENTÃO PARAR RASTREAMENTO FOREGROUND");
            if(this.localizacaoObserver!=null){
              console.log("APLICAÇÃO EM BACKGROUND: this.localizacaoObserver.unsubscribe()");
              this.localizacaoObserver.unsubscribe(); 
            }
            console.log("APLICAÇÃO EM BACKGROUND, ENTÃO INICIAR RASTREAMENTO BACKGROUND");
            this.iniciarRastreamentoBackGround();
          }
        }
      )
      this.platform.resume.subscribe(
        _=>{
          if(this.rastreando){
            console.log("APLICAÇÃO EM FOREGROUND, ENTÃO PARAR RASTREAMENTO BACKGROUND");
            this.pararRastreamentoBackGround();
            console.log("APLICAÇÃO EM FOREGROUND, ENTÃO RETOMANDO RASTREAMENTO FOREGROUND");
            this.iniciarRastreamentoForeground();
          }
        }
      )
    }
  }
}
