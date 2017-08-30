import { Observable } from 'rxjs';
import { Veiculo } from './../../models/veiculo';
import { Condutor } from './../../models/condutor';
import { AudioProvider } from './../../providers/audio/audio';
import { Perna } from './../../models/perna';
import { Conducao } from './../../models/conducao';
import { Conduzido } from './../../models/conduzido';
import * as SlidingMarker from 'marker-animate-unobtrusive';
import { Trajeto } from './../../models/trajeto';
import { Roteiro } from './../../models/roteiro';
import { TrajetoProvider } from './../../providers/trajeto/trajeto';
import { MensagemProvider } from './../../providers/mensagem/mensagem';
import { FatguysUberProvider } from './../../providers/fatguys-uber/fatguys-uber';
import { LocalizacaoProvider } from './../../providers/localizacao/localizacao';
import { Platform, LoadingController, AlertController, Loading } from 'ionic-angular';
import { Component, Input, OnDestroy, OnChanges, SimpleChanges, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'mapa-conduzido',
  templateUrl: 'mapa-conduzido.html'
})
export class MapaConduzidoComponent implements OnDestroy, OnChanges {
  
  

  @Input() conduzido:Conduzido;
  private condutor:Condutor={} as Condutor;
  private conducao:Conducao={} as Conducao;
  private localizacaoConduzido: google.maps.LatLng;
  private localizacaoCondutor: google.maps.LatLng;
  private marcaCondutor: SlidingMarker;  
  private marcaOrigem: SlidingMarker;  
  private marcaDestino: SlidingMarker;  
  private marcaConduzido: SlidingMarker;
  private marcas: google.maps.Marker[]=[] as google.maps.Marker[];
  private localizacaoCondutorSubscription;
  private localizacaoConduzidoSubscription;
  private loading:Loading;
  
  
  private mapa: google.maps.Map;
  @Output() onTempoEstimado= new EventEmitter<number>();

  constructor(public platform: Platform,
    public localizacaoService: LocalizacaoProvider,
    public fatguys: FatguysUberProvider,
    public msg: MensagemProvider,
    public trajetoService: TrajetoProvider,
    public loadingCtrl: LoadingController,
    private alertCtrl: AlertController,
    public audio:AudioProvider) {
      
      
  }

  ngOnChanges(changes: SimpleChanges): void {  
    if(this.conduzido==null)    {
      return;
    }
    if(this.loading==null){      
      this.loading = this.loadingCtrl.create({
            content: 'Buscando condutor...'
          });
    }
    this.loading.present().then(
      _=>{// this.obterCondutor();
        this.condutor=this.fatguys.condutor;
        if(this.conduzido.localizacao==null){
          this.conduzido.localizacao={latitude:0, longitude:0};
        }
        this.obterConducaoDoRoteiroAtual();
        // this.fatguys.conduzido.localizacao=this.conduzido.localizacao;
        this.loading.setContent("Obtendo localização...");
        let sub =this.localizacaoService.iniciarGeolocalizacao().subscribe(
          l=>{
            sub.unsubscribe();
            // this.atualizarLocalizacaoConduzido(resp.coords.latitude, resp.coords.longitude);
            this.loading.setContent("Configurando localização...");
            this.setLocalizacaoConduzido(l);
            this.loading.setContent("Renderizando mapa...");
            this.renderizarMapa(this.conduzido);
            this.loading.setContent("Marcando locais...");
            this.marcarLocaisConducao();
            this.marcarLocalizacaoConduzido();
            this.iniciarMonitoramentoCondutor();
            this.iniciarMonitoramentoConduzido();
            this.loading.dismiss();
          },
          error=>{
            if(!this.loading.didLeave){
              this.loading.dismiss();
            }
            this.msg.mostrarErro("Erro obtendo localização: "+ error);
          }
        )
      }
    );
    
  }
  obterConducaoDoRoteiroAtual(){
    this.condutor=this.fatguys.condutor;
    let cond=this.condutor.roteiroEmexecucao.conducoes.find(
    (cc, i)=>{
          return cc.conduzido==this.conduzido.id;
        }
      );
    this.conducao=cond;
  }

  distancia(p1:google.maps.LatLng, p2:google.maps.LatLng):number{
    return Math.sqrt(Math.pow(p2.lat()-p1.lat(),2)-Math.pow(p2.lng()-p1.lng(),2));
  }

  distanciaKm(p1:google.maps.LatLng, p2:google.maps.LatLng) {
        var lat1, lon1, lat2, lon2
        lat1=p1.lat()
        lat2=p2.lat()
        lon1=p1.lng()
        lon2=p2.lng()
        var rlat1 = Math.PI * lat1/180
        var rlat2 = Math.PI * lat2/180
        var rlon1 = Math.PI * lon1/180
        var rlon2 = Math.PI * lon2/180
        var theta = lon1-lon2
        var rtheta = Math.PI * theta/180
        var dist = Math.sin(rlat1) * Math.sin(rlat2) + Math.cos(rlat1) * Math.cos(rlat2) * Math.cos(rtheta);
        if(dist>1){
          dist=1;
        }
        if(dist<-1){
          dist=-1;
        }
        dist = Math.acos(dist)
        dist = dist * 180/Math.PI
        dist = dist * 60 * 1.1515
        dist = dist * 1.609344
        return dist
  }

  // pontoMaisProximoNoCaminho(localizacao?:google.maps.LatLng){    
  //   var indice=-1;
  //   var diastanciaMaisproximo:number=Math.pow(10,6);
  //   this.polylinePath.getPath().getArray().forEach(
  //     (p, i)=>{
  //       var d=this.distancia(p, localizacao);
  //       if(d<diastanciaMaisproximo){
  //         diastanciaMaisproximo=d;
  //         indice=i;
  //       }
  //     }
  //   )
  //   return indice;
  // }

  estimarChegada(){
    let pd = this.fatguys.condutor.roteiroEmexecucao.trajeto.pernas
    .findIndex(p=>p.local.latitude==this.conducao.origem.latitude&& p.local.longitude==this.conducao.origem.longitude);

    let perna = this.fatguys.condutor.roteiroEmexecucao.trajeto.pernas
    .filter((p,i)=>i<=pd)
    .reduce((antes, atual)=>(
      this.distancia(new google.maps.LatLng(antes.local.latitude, antes.local.longitude), 
                    new google.maps.LatLng(this.fatguys.condutor.localizacao.latitude, this.fatguys.condutor.localizacao.longitude))<
      this.distancia(new google.maps.LatLng(atual.local.latitude, atual.local.longitude), 
                    new google.maps.LatLng(this.fatguys.condutor.localizacao.latitude, this.fatguys.condutor.localizacao.longitude))?
      antes:atual
    ));
    let pi = this.fatguys.condutor.roteiroEmexecucao.trajeto.pernas.findIndex(p=>p.local.latitude==perna.local.latitude&& p.local.longitude==perna.local.longitude);
    let tempoEstimado=0;
    for(let i=pi;i<pd+1;i++){
      tempoEstimado+=this.fatguys.condutor.roteiroEmexecucao.trajeto.pernas[i].tempo.numero;
    }
    this.onTempoEstimado.emit(tempoEstimado);
  }
  
  iniciarMonitoramentoCondutor(){
    // let locCondtuorObs=Observable.of(this.fatguys.obterLocalizacaoCondutor(this.condutor))
    let locCondtuorObs=this.fatguys.obterLocalizacaoCondutor(this.condutor)
    //.distinctUntilChanged().debounceTime(3000) ;//this.fatguys.obterLocalizacaoCondutor(this.condutor)
    this.localizacaoCondutorSubscription=locCondtuorObs.subscribe(
      l=>{        
        try {
          console.log(l);
          this.setLocalizacaoCondutor(new google.maps.LatLng(l.latitude, l.longitude));    
          this.estimarChegada();          
          this.centralizarMapa();                   
        } catch (error) {
          console.error(error);  
        }
      },
      error=>{
        console.error(error);
      },
      ()=>{
        console.log("monitoração completou");
      }
    );
  }
  iniciarMonitoramentoConduzido(){
    this.localizacaoConduzidoSubscription=this.fatguys.obterLocalizacaoConduzido(this.conduzido)
    .subscribe(
      l=>{
        this.setLocalizacaoConduzido(new google.maps.LatLng(l.latitude, l.longitude));       
        this.centralizarMapa();         
      }
    );                       
    this.localizacaoService.iniciarRastreamento();
  }

  setLocalizacaoConduzido(localizacao: google.maps.LatLng){
    this.localizacaoConduzido=localizacao;
    this.atualizarConduzidoNoMapa(this.localizacaoConduzido);
  }
  
  setLocalizacaoCondutor(localizacao: google.maps.LatLng){
    this.localizacaoCondutor=localizacao;
    this.atualizarCondutorNoMapa(this.localizacaoCondutor);
  }

  atualizarCondutorNoMapa(localizacao: google.maps.LatLng){
    if(this.marcaCondutor==null){
      this.marcarLocalizacaoCondutor();
    }
    this.marcaCondutor.setPosition(localizacao);
    this.marcaCondutor.setEasing('linear');    
  }

  atualizarConduzidoNoMapa(localizacao: google.maps.LatLng){
    if(this.marcaConduzido==null){
      return;
    }
    this.marcaConduzido.setPosition(localizacao);
    this.marcaConduzido.setEasing('linear');    
  }

  unsubscribeObservables(){
    if(this.localizacaoCondutorSubscription!=null){
      this.localizacaoCondutorSubscription.unsubscribe();
    }
    if(this.localizacaoConduzidoSubscription!=null){
      this.localizacaoConduzidoSubscription.unsubscribe();
    }
  }

  ngOnDestroy(): void {
    this.unsubscribeObservables();
  }

  marcarLocaisConducao(){
    this.marcarOrigem();
    this.marcarDestino();
  }

  marcarLocalizacaoCondutor(){
    let marcaCondutor= new SlidingMarker({
      map: this.mapa,
      animation: google.maps.Animation.BOUNCE,
      position: this.localizacaoCondutor,
      icon: 'assets/img/bus-icon.png'
    });
    var popup = new google.maps.InfoWindow({
      content: '<h7  style="color:red;">Condutor</h7>'
    });    

    this.marcaCondutor=marcaCondutor;
    this.marcas.push(this.marcaCondutor);

    popup.open(this.mapa, this.marcaCondutor);

    google.maps.event.addListener(this.marcaCondutor, 'click', () => {
      popup.open(this.mapa, this.marcaCondutor);
    });

    setTimeout( () => {
		if (this.marcaCondutor){
			this.marcaCondutor.setAnimation(null);
		}	  
    }, 750);
  }

  marcarOrigem(){
    let localizacao= new google.maps.LatLng(this.conducao.origem.latitude, this.conducao.origem.longitude);
    let marcaOrigem= new SlidingMarker({
      map: this.mapa,
      animation: google.maps.Animation.BOUNCE,
      position: localizacao,
      icon: 'assets/img/local-origem.png'
    });
    var popup = new google.maps.InfoWindow({
      content: '<h7  style="color:black;">Origem</h7>'
    });    

    this.marcaOrigem=marcaOrigem;
    this.marcas.push(this.marcaOrigem);

    popup.open(this.mapa, this.marcaOrigem);

    google.maps.event.addListener(this.marcaOrigem, 'click', () => {
      popup.open(this.mapa, this.marcaOrigem);
    });

    setTimeout( () => {
		if (this.marcaOrigem){
			this.marcaOrigem.setAnimation(null);
		}	  
    }, 750);
  }

  marcarDestino(){
    let localizacao= new google.maps.LatLng(this.conducao.destino.latitude, this.conducao.destino.longitude);
    let marcaDestino= new SlidingMarker({
      map: this.mapa,
      animation: google.maps.Animation.BOUNCE,
      position: localizacao,
      icon: 'assets/img/local-destino.png'
    });
    var popup = new google.maps.InfoWindow({
      content: '<h7  style="color:black;">Destino</h7>'
    });    

    this.marcaDestino=marcaDestino;
    this.marcas.push(this.marcaDestino);

    popup.open(this.mapa, this.marcaDestino);

    google.maps.event.addListener(this.marcaDestino, 'click', () => {
      popup.open(this.mapa, this.marcaDestino);
    });

    setTimeout( () => {
		if (this.marcaDestino){
			this.marcaDestino.setAnimation(null);
		}	  
    }, 750);
  }


  marcarLocalizacaoConduzido(){
    let marcaConduzido= new SlidingMarker({
      map: this.mapa,
      animation: google.maps.Animation.BOUNCE,
      position: this.localizacaoConduzido,
      icon: 'assets/img/person-icon-blue.png'
    });
    var popup = new google.maps.InfoWindow({
      content: '<h7  style="color:blue;">Você</h7>'
    });    

    this.marcaConduzido=marcaConduzido;
    this.marcas.push(this.marcaConduzido);

    popup.open(this.mapa, this.marcaConduzido);

    google.maps.event.addListener(this.marcaConduzido, 'click', () => {
      popup.open(this.mapa, this.marcaConduzido);
    });

    setTimeout( () => {
		if (this.marcaConduzido){
			this.marcaConduzido.setAnimation(null);
		}	  
    }, 750);
  }

  renderizarMapa(conduzido:Conduzido){
    let mapOptions = {
            center: this.localizacaoConduzido,
            zoom: 15,
            mapTypeId: google.maps.MapTypeId.ROADMAP,
            disableDefaultUI: true,
            draggable:true
          }          
    let divMapa = document.getElementById('mapa');
    let mapa = new google.maps.Map(divMapa, mapOptions);
    this.mapa=mapa;
  }

  centralizarMapa(marcas?:google.maps.Marker[]){
    if(marcas==null){
      marcas=this.marcas;
    }
    var bounds = new google.maps.LatLngBounds();
    marcas.forEach(
      m=>{
        if(m.getPosition()!=null){
          bounds.extend(m.getPosition());
        }
      }
    )
    this.mapa.fitBounds(bounds);
    let mapOptions = {
           draggable:true
          } 
    this.mapa.setOptions(mapOptions);
  }


}

interface ConduzidoMV{
  conduzido: Conduzido,
  marca:google.maps.Marker,
  cancelado:boolean
}
interface ConducaoMV{
  conducao: Conducao,
  marca:google.maps.Marker
}
