import { DadosUsuarioProvider } from './../../providers/dados-usuario/dados-usuario';
import { Local } from './../../models/local';
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
  private conducaoSubscription;
  private loading:Loading;  
  
  
  private mapa: google.maps.Map;
  private polylinePath:google.maps.Polyline=new google.maps.Polyline();
  @Output() onTempoEstimado= new EventEmitter<number>();
  @Output() onConducaoRealizada= new EventEmitter<Conducao>();
  @Output() onConducaoEmAndamento= new EventEmitter<Conducao>();
  @Output() onConducaoEmbarcado= new EventEmitter<Conducao>();
  @Output() onConducaoCancelada= new EventEmitter<Conducao>();

  constructor(public platform: Platform,
    public localizacaoService: LocalizacaoProvider,
    public fatguys: FatguysUberProvider,
    public msg: MensagemProvider,
    public trajetoService: TrajetoProvider,
    public loadingCtrl: LoadingController,
    private alertCtrl: AlertController,
    public audio:AudioProvider,
    private dadosUsuario: DadosUsuarioProvider) {
      
      
  }

  ngOnChanges(changes: SimpleChanges): void {  
    this.dadosUsuario.pararMonitoramentoRoteiroExecucao();
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
            this.renderizarMapa();
            this.marcarLocalizacaoConduzido();
            this.iniciarMonitoramentoConduzido();
            if(this.condutor.roteiroEmexecucao!=null&&this.conducao!=null&&!this.conducao.cancelada){
            this.redenderizarMapaConducao(this.conducao);
            }
            this.loading.dismiss();
          },
          error=>{
            try {
              this.loading.dismiss();
            } catch (error) {
              
            }
            this.msg.mostrarErro("Erro obtendo localização: "+ error);
            this.iniciarMonitoramentoConduzido();
          }
        )
      }
    );    
  }

  redenderizarMapaConducao(conducao:Conducao){
    if(conducao!=null){
      if(this.conducao==null){
        this.conducao=conducao;
      }
      if(this.mapa==null){
        this.renderizarMapa();
      }
      if(this.marcaOrigem==null){
        this.marcarOrigem();
      }
      if(this.marcaDestino==null){
        this.marcarDestino();
      }
      if(this.marcaCondutor==null){
        this.marcarLocalizacaoCondutor();
      }
      if(this.localizacaoCondutorSubscription==null){
        this.iniciarMonitoramentoCondutor();
      }
    }
  }

  obterConducaoDoRoteiroAtual(){
    console.log("obterConducaoDoRoteiroAtual()")
    console.log("this.condutor.roteiroEmexecucao!=null: "+(this.condutor.roteiroEmexecucao!=null))
    if(this.condutor.roteiroEmexecucao!=null){
      this.condutor=this.fatguys.condutor;
      let cond=this.condutor.roteiroEmexecucao.conducoes.find(
        (cc, i)=>{
          return cc.conduzido==this.conduzido.id;
        }
      );
      // this.conducao=cond;
      this.monitorarConducaoDoRoteiroEmExecucao(this.condutor);
    }
  }

  monitorarConducaoDoRoteiroEmExecucao(condutor:Condutor){
    console.log("monitorarConducaoDoRoteiroEmExecucao");
    this.conducaoSubscription = this.fatguys.obterConducoesDoRoteiroAndamento(condutor).subscribe(
      conducoes=>{
        let cond=conducoes.find(
        (cc, i)=>{
              return cc.conduzido==this.conduzido.id;
            }
          );
          console.log(conducoes);
        if(cond!=null&&this.conducao.id==null){
          this.conducao=cond;
          console.log("this.redenderizarMapaConducao(cond);")
          this.redenderizarMapaConducao(cond);
        }
        if(cond!=null&&cond.cancelada&&!this.conducao.cancelada){
          this.conducao=cond;
          this.conducaoCancelada(cond);
        }
        else if(cond!=null&&cond.emAndamento&&!this.conducao.emAndamento){
          this.conducao=cond;
          this.conducaoEmAndamento(cond);
        }
        else if(cond!=null&&cond.embarcado&&!this.conducao.embarcado){
          this.conducao=cond;
          this.conducaoEmbarcado(cond);
        }
        else if(cond!=null&&cond.realizada&&!this.conducao.realizada){
          this.conducao=cond;
          this.conducaoRealizada(cond);
        }
      }
    )
  }

  estimarTempo(de:Local, para:Local, pernas:Perna[]){
      let pd = pernas
    .findIndex(p=>p.local.latitude==para.latitude&& p.local.longitude==para.longitude);

    let paradas = pernas
    .filter((p,i)=>i<pd).map(perna=>{return {
                          location: new google.maps.LatLng(perna.local.latitude, perna.local.longitude),
                          stopover:true
                        }})    
    
    this.trajetoService.directionsService.route({
              origin: new google.maps.LatLng(de.latitude, de.longitude),
              destination: new google.maps.LatLng(para.latitude, para.longitude),
              travelMode: google.maps.TravelMode.DRIVING,
              drivingOptions:{
                                departureTime: new Date(),
                                trafficModel: google.maps.TrafficModel.BEST_GUESS
                            },
              waypoints: paradas,
              // optimizeWaypoints: true
            }, (response, status)=>{
              this.processarResposta(response, status);
            })
  }

  estimarChegada(){
    let localCondutor:Local={} as Local;
    localCondutor.latitude=this.localizacaoCondutor.lat();
    localCondutor.longitude=this.localizacaoCondutor.lng();
    if(this.fatguys.condutor.roteiroEmexecucao!=null&&this.fatguys.condutor.roteiroEmexecucao.trajeto!=null){
      this.estimarTempo(localCondutor, this.conducao.origem, this.fatguys.condutor.roteiroEmexecucao.trajeto.pernas);    
    }
  }

  estimarDesembarque(){
    let localCondutor:Local={} as Local;
    localCondutor.latitude=this.localizacaoCondutor.lat();
    localCondutor.longitude=this.localizacaoCondutor.lng();    
    if(this.fatguys.condutor.roteiroEmexecucao!=null&&this.fatguys.condutor.roteiroEmexecucao.trajeto!=null){
      let io = this.fatguys.condutor.roteiroEmexecucao.trajeto.pernas
      .findIndex(p=>p.local.latitude==this.conducao.origem.latitude&&p.local.longitude==this.conducao.origem.longitude)
      this.fatguys.condutor.roteiroEmexecucao.trajeto.pernas=this.fatguys.condutor.roteiroEmexecucao.trajeto.pernas.slice(io+1, this.fatguys.condutor.roteiroEmexecucao.trajeto.pernas.length);
      this.estimarTempo(localCondutor, this.conducao.destino, this.fatguys.condutor.roteiroEmexecucao.trajeto.pernas);
    }
  }

  processarResposta(response: google.maps.DirectionsResult, status: google.maps.DirectionsStatus){
    if(status=== google.maps.DirectionsStatus.OK){
                let tempoEstimado=0;
                let path=[];
                response.routes[0].legs
                .forEach(leg=>leg.steps
                  .forEach(step=>{
                  tempoEstimado+=step.duration.value;
                  path=path.concat(step.path);
                  }));                
                this.polylinePath.setMap(null);
                this.polylinePath = new google.maps.Polyline({
                    path: path,
                    strokeColor: '#000000',
                    strokeWeight: 4
                  });  
                this.polylinePath.setMap(this.mapa);
                this.onTempoEstimado.emit(tempoEstimado);
              }
  }

  conducaoEmAndamento(conducao:Conducao){
    this.onConducaoEmAndamento.emit(conducao);
  }

  conducaoEmbarcado(conducao:Conducao){
    this.onConducaoEmbarcado.emit(conducao);
  }

  conducaoRealizada(conducao:Conducao){
    this.polylinePath.setMap(null);
    this.conducaoSubscription.unsubscribe();
    if(this.localizacaoCondutorSubscription!=null){
      this.localizacaoCondutorSubscription.unsubscribe();
    }    
    this.marcaCondutor.setMap(null);
    this.onConducaoRealizada.emit(conducao);
  }
  conducaoCancelada(conducao:Conducao){
    this.polylinePath.setMap(null);
    this.conducaoSubscription.unsubscribe();
    if(this.localizacaoCondutorSubscription!=null){
      this.localizacaoCondutorSubscription.unsubscribe();
    }    
    this.marcaCondutor.setMap(null);
    this.onConducaoCancelada.emit(conducao);
  }
  
  iniciarMonitoramentoCondutor(){
    // let locCondtuorObs=Observable.of(this.fatguys.obterLocalizacaoCondutor(this.condutor))
    let primeiro =this.fatguys.obterLocalizacaoCondutor(this.condutor).take(1);
    let demais=this.fatguys.obterLocalizacaoCondutor(this.condutor).skip(1).debounceTime(1*1000)
    let locCondtuorObs=primeiro.concat(demais);

    //.distinctUntilChanged().debounceTime(3000) ;//this.fatguys.obterLocalizacaoCondutor(this.condutor)
    this.localizacaoCondutorSubscription=locCondtuorObs.subscribe(
      l=>{        
        try {
          console.log(l);
          this.setLocalizacaoCondutor(new google.maps.LatLng(l.latitude, l.longitude));
          if(this.conducao.emAndamento){
            this.estimarChegada();          
          }
          else if(this.conducao.embarcado){
            this.estimarDesembarque();
          }
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
      this.localizacaoConduzido=localizacao;
      this.marcarLocalizacaoConduzido();
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
    if(this.conducaoSubscription!=null){
      this.conducaoSubscription.unsubscribe();
    }
  }

  ngOnDestroy(): void {
    this.unsubscribeObservables();
    if(this.dadosUsuario.roteiroEmExecucaoSubscription==null){
      this.dadosUsuario.monitorarRoteiroEmExecucao();
    }
  }

  marcarLocaisConducao(){
    this.marcarOrigem();
    this.marcarDestino();
  }

  marcarLocalizacaoCondutor(){
    if(this.marcaCondutor!=null){
      return;
    }
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
    this.centralizarMapa()
  }

  marcarOrigem(){
    if(this.marcaOrigem!=null){
      return;
    }
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
    if(this.marcaDestino!=null){
      return;
    }
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
    if(this.marcaConduzido!=null){
      return;
    }
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
    this.centralizarMapa();
  }

  renderizarMapa(){
    if(this.mapa!=null){
      return;
    }
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

  centralizarMapaNoCondutor(){        
    this.mapa.panTo(this.marcaCondutor.getPosition());
    this.mapa.setZoom(15);
  }
  centralizarMapaNoConduzido(){        
    this.mapa.panTo(this.marcaConduzido.getPosition());
    this.mapa.setZoom(15);
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
