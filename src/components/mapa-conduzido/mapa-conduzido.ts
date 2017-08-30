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
  @Output() onViagemIniciada= new EventEmitter<google.maps.Map>();
  @Output() onOrigemProxima= new EventEmitter<Conducao>();
  @Output() onDestinoProximo= new EventEmitter<Conducao>();

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
        this.fatguys.conduzido.localizacao=this.conduzido.localizacao;
        this.loading.setContent("Obtendo localização...");
        let sub =this.localizacaoService.iniciarGeolocalizacao().subscribe(
          l=>{
            this.loading.setContent("Configurando localização...");
            this.setLocalizacaoConduzido(l);
            this.loading.setContent("Renderizando mapa...");
            this.renderizarMapa(this.conduzido);
            this.loading.setContent("Marcando locais...");
            this.marcarLocaisConducao();
            this.loading.setContent("Marcando conduzido...");
            this.marcarLocalizacaoConduzido();
            this.loading.setContent("Marcando condutor...");
            this.setLocalizacaoCondutor(new google.maps.LatLng(this.condutor.localizacao.latitude, this.condutor.localizacao.longitude));
            this.marcarLocalizacaoCondutor();
            this.loading.setContent("Centralizando mapa...");
            this.centralizarMapa();
            this.loading.setContent("Monitorando codutor...");
            this.iniciarMonitoramentoCondutor();
            this.loading.setContent("Monitorando coduzido...");
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
  // obterCondutor(){
  //   let ref =this.fatguys.obterCondutorPeloConduzido();
  //   if(ref!=null){
  //     let sub = ref.subscribe(r=>{
  //       sub.unsubscribe();
  //       this.condutor=r[0];
  //       if(!this.condutor.veiculo){
  //         this.condutor.veiculo={} as Veiculo;
  //       }
  //       let cond:Conducao;
  //       cond=r[0].roteiroEmexecucao.conducoes.find(
  //         cc=>{
  //           return cc.conduzido=this.conduzido.id;
  //         }
  //       );
  //       this.conducao=cond;
        
  //     });  
  //   }
  
  //   if(!this.condutor.veiculo){
  //     this.condutor.veiculo={} as Veiculo;
  //   }
  //   else{
  //     this.condutor.veiculo={} as Veiculo;
  //     this.condutor.veiculo.modelo="DFGDFG";      
  //   }
  // }

  iniciarMonitoramentoCondutor(){
    this.localizacaoCondutorSubscription=this.fatguys.obterLocalizacaoCondutor(this.condutor)
    .subscribe(
      l=>{
        this.setLocalizacaoCondutor(l);
      }
    );
  }
  iniciarMonitoramentoConduzido(){
    this.localizacaoConduzidoSubscription=this.fatguys.obterLocalizacaoConduzido(this.conduzido)
    .subscribe(
      l=>{
        this.setLocalizacaoConduzido(l);
      }
    );
  }

  setLocalizacaoConduzido(localizacao: google.maps.LatLng){
    this.localizacaoConduzido=localizacao;
    this.atualizarConduzidoNoMapa(this.localizacaoConduzido);
  }
  
  setLocalizacaoCondutor(localizacao: google.maps.LatLng){
    this.localizacaoCondutor = localizacao;
    this.atualizarCondutorNoMapa(this.localizacaoCondutor);
  }

  atualizarCondutorNoMapa(localizacao: google.maps.LatLng){
    if(this.marcaCondutor==null){
      return;
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
        bounds.extend(m.getPosition());
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
