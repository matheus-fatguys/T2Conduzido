import { Coordenada } from './../../models/coordenada';
import { Perna } from './../../models/perna';
import { Roteiro } from './../../models/roteiro';
import { AlertController } from 'ionic-angular';
import { MensagemProvider } from './../mensagem/mensagem';
import { Local } from './../../models/local';
import { Trajeto } from './../../models/trajeto';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable()
export class TrajetoProvider {
  private locais = [] as Local[];
  private locaisOrdenados = [] as Local[];
  private destinos = [] as Local[];
  private origens = [] as Local[];
  private paradas = [] as Local[];
  private roteiro={} as Roteiro;
  private localizacao:google.maps.LatLng;
  public directionsService: google.maps.DirectionsService;
  public trajeto:Trajeto;
  constructor(
    public msg: MensagemProvider,
    private alertCtrl: AlertController) {
      this.directionsService = new google.maps.DirectionsService();    
  }

  mostrarTrajetoDoRoteiro(trajeto:Trajeto):Promise<any>{
    var promessa : Promise<any>= new Promise(
      (resolve, reject)=>{
        var opts=[];
          var duracaoTotal=0;
          var distanciaTotal=0;
          trajeto.pernas.forEach((perna, i) => {          
              opts.push({
                  type: 'checkbox',
                  // value: (1+i)+'- '+perna.local.endereco.substring(0,15)+'... ('+perna.tempo.texto+') - '+perna.distancia.texto,
                  label: (1+i)+'- '+perna.local.endereco.substring(0,15)+'... ('+perna.tempo.texto+') - '+perna.distancia.texto,
                  checked: true
                });
            });  
          opts.push({
                type: 'checkbox ',
                // value: 'Tot.: ('+trajeto.tempoTotal.texto+') - '+trajeto.distanciaTotal.texto,
                label: 'Tot.: ('+trajeto.tempoTotal.texto+') - '+trajeto.distanciaTotal.texto,
                checked: true
              });
          let prompt = this.alertCtrl.create({
          title: 'Trajeto: '+this.roteiro.nome,
          // message: 'Trajeto:',
          inputs: opts,
          buttons: [{
            text: 'Ok',
            handler: r => {
              resolve(trajeto);
            }
          }]
        });    
        prompt.present(prompt);
        
      }
    );
    return promessa;
  }

  

  formatar(n:number):string{
    var ret = "";
    var minutos =Math.round(n/60);
    var horas =Math.round(minutos/60);
    var strHr="";
    
    if(minutos>59){
      strHr=horas+" hr ";
      ret=ret+strHr;
      var m=Math.round((n-horas*60*60)/60);
      minutos=m;
    }
    var strMin=minutos+" min";
    ret=ret+strMin;
    return ret;
  }

  definirLocais(roteiro: Roteiro){
      roteiro.conducoes.forEach(c=>{
        if(c.emAndamento){
          var lio=this.locais.findIndex(l=>{return l.endereco==c.origem.endereco});
          if(lio<0){
            this.locais.push(c.origem);
          }
          lio=this.origens.findIndex(l=>{return l.endereco==c.origem.endereco});
          if(lio<0){
            this.origens.push(c.origem);
          }
        }
        if(c.emAndamento||c.embarcado){
          var lid=this.locais.findIndex(l=>{return l.endereco==c.destino.endereco});
          if(lid<0){
            this.locais.push(c.destino);
          }
          lid=this.destinos.findIndex(l=>{return l.endereco==c.destino.endereco});
          if(lid<0){
            this.destinos.push(c.destino);
          }
        }
      });      
  }

  ordenarLocaisPorDistancia(){
    var distancias=[];

    this.locais.forEach((lo, i) => {
      distancias.push({indice: i, 
        distancia: Math.sqrt(Math.pow(this.localizacao.lat()-lo.latitude,2)+Math.pow(this.localizacao.lng()-lo.longitude,2)) });        
    });
  
    distancias.sort((a, b)=>{return a.distancia-b.distancia });

    distancias.forEach(d=>{
      this.locaisOrdenados.push(this.locais[d.indice]);
    });
    if(this.locaisOrdenados.length>1){
      this.paradas=this.locaisOrdenados.slice(0,this.locaisOrdenados.length-1);
    }
    else{
      this.paradas=null;
    }
  }

  ordenarLocaisPorDistanciaComUnicoDestino(){
    var distancias=[];
    var id=this.locais.findIndex(l=>{return l.endereco==this.destinos[0].endereco})
    var destino=this.locais[id];
    this.locais.splice(id,1);

    this.locais.forEach((lo, i) => {
      distancias.push({indice: i, 
        distancia: Math.sqrt(Math.pow(this.localizacao.lat()-lo.latitude,2)+Math.pow(this.localizacao.lng()-lo.longitude,2)) });        
    });
  
    distancias.sort((a, b)=>{return a.distancia-b.distancia });

    distancias.forEach(d=>{
      this.locaisOrdenados.push(this.locais[d.indice]);
    });
    if(this.locaisOrdenados.length>0){
      this.paradas=this.locaisOrdenados.map(l=>l);
    }
    else{
      this.paradas=null;
    }
    this.locaisOrdenados.push(destino);
  }

  ordenarLocaisPorDistanciaComUnicaOrigem(){
    var distancias=[];
    var io=this.locais.findIndex(l=>{return l.endereco==this.origens[0].endereco})
    var origem=this.locais[io];
    this.locais.splice(io,1);

    this.locais.forEach((lo, i) => {
      distancias.push({indice: i, 
        distancia: Math.sqrt(Math.pow(origem.latitude-lo.latitude,2)+Math.pow(origem.longitude-lo.longitude,2)) });        
    });
  
    distancias.sort((a, b)=>{return a.distancia-b.distancia });

    this.locaisOrdenados.push(origem);
    distancias.forEach(d=>{
      this.locaisOrdenados.push(this.locais[d.indice]);
    });
    if(this.locaisOrdenados.length>1){
      this.paradas=this.locaisOrdenados.slice(1,this.locaisOrdenados.length-1);
    }
    else{
      this.paradas=null;
    }
  }

  calcularRota(origem:Local, destino:Local, intermediarias:Local[], locaisOrdenados:Local[]):Observable<Trajeto>{
    
    var pontos=null;
    var lista = [];
    // if(origem!=null){
    //   lista.push(origem);
    // }
    if(intermediarias!=null){
      pontos=intermediarias.map(local=>new google.maps.LatLng(local.latitude, local.longitude));
    }
    let paradas=null;
    let inicio : google.maps.LatLng;
    if(origem!=null){
      inicio = new google.maps.LatLng(origem.latitude, origem.longitude);
    }
    else{
      inicio = new google.maps.LatLng(this.localizacao.lat(), this.localizacao.lng());
    }
    var fim ;
    if(destino!=null){
      fim = new google.maps.LatLng(destino.latitude, destino.longitude);
    }
    else{
      fim = pontos[pontos.length-1];
    }
    if(pontos!=null && pontos.length>0){
      paradas=[];
      // var ps=pontos.slice(0,pontos.length-1);
      pontos.forEach(
              p=> {
                var wp ={
                          location: p,
                          stopover:true
                        };
                paradas.push(wp);
              });      
    }    
    let trajetoObservable:Observable<Trajeto>=Observable.create(
      observable=>{
          try{
            this.directionsService.route({
              origin: inicio,
              destination: fim,
              travelMode: google.maps.TravelMode.DRIVING,
              drivingOptions:{
                                departureTime: new Date(),
                                trafficModel: google.maps.TrafficModel.BEST_GUESS
                            },
              waypoints: paradas,
              optimizeWaypoints: true
            }, (response, status) => {
                try{
                  var trajeto:Trajeto = this.processarResposta(response, status, paradas, lista, destino, locaisOrdenados);  
                  observable.next(trajeto);   
                }
                catch(error){
                  observable.error(error);
                }
            })
        }
        catch(error){        
          observable.error(error);   
        }
      }
    );
    return trajetoObservable;
  }

  processarResposta(response: google.maps.DirectionsResult,
                    status: google.maps.DirectionsStatus,
                    paradas: google.maps.DirectionsWaypoint[],
                    lista:Local[],
                    destino:Local,
                    locaisOrdenados:Local[]):Trajeto{
    let trajeto:Trajeto = null;
    if (status === google.maps.DirectionsStatus.OK) {
      console.log(response);
      trajeto={} as Trajeto;
      trajeto.pernas=[] as Perna[];
      var ordemGoogle=[];
      if(paradas!=null){
        response.routes[0].waypoint_order.forEach(
          wpo=>{
            ordemGoogle.push(locaisOrdenados[wpo]);
            lista.push(locaisOrdenados[wpo]);
          });
          if(destino!=null){
            lista.push(destino);
          }
        locaisOrdenados.splice(0,ordemGoogle.length,...ordemGoogle);
      }
      else{
        lista.push(destino);
      }
      var duracaoTotal=0;
      var distanciaTotal=0;
      lista.forEach((lo, i) => {
          var perna:Perna={} as Perna;
          perna.local=lo;
          perna.tempo={texto:"", numero:0};;
          perna.tempo.texto=response.routes[0].legs[i].duration.text;
          perna.distancia={texto:"", numero:0};
          perna.distancia.texto=response.routes[0].legs[i].distance.text;
          perna.tempo.numero=response.routes[0].legs[i].duration.value;
          perna.distancia.numero=response.routes[0].legs[i].distance.value;
          perna.caminho=[] as Coordenada [];
          response.routes[0].legs[i].steps.forEach(
            step=>{
              step.path.forEach(
                p=>{
                  let coord = {} as Coordenada;
                  coord.latitude=p.lat();
                  coord.longitude=p.lng();
                  perna.caminho.push(coord);
                }
              );
            }
          )
          trajeto.pernas.push(perna);
          duracaoTotal+=response.routes[0].legs[i].duration.value;
          distanciaTotal+=response.routes[0].legs[i].distance.value;          
        });  
      trajeto.tempoTotal={texto:"", numero:0};        
      trajeto.tempoTotal.texto=this.formatar(duracaoTotal);        
      trajeto.tempoTotal.numero=duracaoTotal;        
      trajeto.distanciaTotal={texto:"", numero:0};
      trajeto.distanciaTotal.texto=Math.round(distanciaTotal/1000)+' km';  
      trajeto.distanciaTotal.numero=distanciaTotal;  
      return trajeto;
    }
    else {
      console.error(status);
      var msgErro=this.obterMesnagemErro(status);
      this.msg.mostrarErro("Erro obtendo trajeto da viagem: "+msgErro);
    }
    return trajeto;
  }

  obterMesnagemErro(status: google.maps.DirectionsStatus):string{
      var msgErro:string="";
      switch(status){
        case google.maps.DirectionsStatus.ZERO_RESULTS: 
          msgErro="Nenhum trajeto encontrado!";
          break;
        case google.maps.DirectionsStatus.NOT_FOUND: 
          msgErro="Local não encontrado!";
          break;
        case google.maps.DirectionsStatus.REQUEST_DENIED: 
          msgErro="Requisição negada!";
          break;
        case google.maps.DirectionsStatus.INVALID_REQUEST: 
          msgErro="Requisição inválida!";
          break;
        case google.maps.DirectionsStatus.MAX_WAYPOINTS_EXCEEDED: 
          msgErro="Máximo de paradas excedido!";
          break;
        case google.maps.DirectionsStatus.OVER_QUERY_LIMIT: 
          msgErro="Máximo de consultas excedido!";
          break;
        case google.maps.DirectionsStatus.UNKNOWN_ERROR: 
          msgErro="Erro desconhecido!";
          break;
        case google.maps.DirectionsStatus.OK: 
          msgErro="Nenhum erro!";
          break;
      }
        return msgErro;
  }
  calcularTrajetoComUnicoDestinoEUnicaOrigem():Observable<Trajeto>{
    this.ordenarLocaisPorDistanciaComUnicoDestino();
    let trajetoObservable:Observable<Trajeto>=Observable.create(
      obervable=>{
        try{
          this.calcularRota(null, 
            this.destinos[0], 
            [this.origens[0]], 
            this.locaisOrdenados).subscribe(
            trajeto=>{
              obervable.next(trajeto);
            },
            error=>{
              obervable.error(error);    
            }
          );
        }
        catch(error){
          obervable.error(error);
        }
      }
    );
    return trajetoObservable;
  }
  calcularTrajetoComUnicoDestino():Observable<Trajeto>{
    this.ordenarLocaisPorDistanciaComUnicoDestino();
    let trajetoObservable:Observable<Trajeto>=Observable.create(
      obervable=>{
        try{
          this.calcularRota(null, 
            this.destinos[0], 
            this.paradas, 
            this.locaisOrdenados).subscribe(
            trajeto=>{
              obervable.next(trajeto);
            },
            error=>{
              obervable.error(error);    
            }
          );
        }
        catch(error){
          obervable.error(error);
        }
      }
    );
    return trajetoObservable;
  }

  calcularTrajetoComUnicaOrigem():Observable<Trajeto>{
    this.ordenarLocaisPorDistanciaComUnicaOrigem();
    let trajetoObservable:Observable<Trajeto>=Observable.create(
      obervable=>{
        this.calcularRota(null, 
          this.origens[0], 
          null, 
          this.locaisOrdenados).subscribe(
          trajeto=>{
            try{
              this.calcularRota(this.origens[0], 
                this.locaisOrdenados[this.locaisOrdenados.length-1], 
                this.paradas,
                this.locaisOrdenados.slice(1, this.locaisOrdenados.length)).subscribe(
                trajeto2=>{
                  let trajetoConcatenado:Trajeto=this.concatenarTrajetos(trajeto, trajeto2);
                  obervable.next(trajetoConcatenado);
                },
                error=>{
                  obervable.error(error);    
                }
              );
            }
            catch(error){
              obervable.error(error);
            }
          },
            error=>{
              obervable.error(error);    
            }
        );
      }
    );
    return trajetoObservable;
  }

  concatenarTrajetos(trajeto1:Trajeto, trajeto2:Trajeto):Trajeto{
    let trajetoConcatenado:Trajeto={} as Trajeto;
    trajetoConcatenado.pernas=[] as Perna[];        
    trajeto1.pernas.forEach(
      p=>{
        trajetoConcatenado.pernas.push(p);
      });
    if(trajetoConcatenado.pernas[trajetoConcatenado.pernas.length-1].local.endereco==
      trajeto2.pernas[0].local.endereco
    ){
      trajetoConcatenado.pernas.pop();
    }
    trajeto2.pernas.forEach(
      p=>{
        trajetoConcatenado.pernas.push(p);
      });      
    trajetoConcatenado.distanciaTotal={texto:"", numero:0};
    trajetoConcatenado.distanciaTotal.numero=trajeto1.distanciaTotal.numero+trajeto2.distanciaTotal.numero;
    trajetoConcatenado.distanciaTotal.texto=trajetoConcatenado.distanciaTotal.numero/1000+' km';
    trajetoConcatenado.tempoTotal={texto:"", numero:0};
    trajetoConcatenado.tempoTotal.numero=trajeto1.tempoTotal.numero+trajeto2.tempoTotal.numero;
    trajetoConcatenado.tempoTotal.texto=this.formatar(trajetoConcatenado.tempoTotal.numero);
    return trajetoConcatenado;
  }

  calcularTrajetoPorDistancia():Observable<Trajeto>{
    this.ordenarLocaisPorDistancia();
    let trajetoObservable:Observable<Trajeto>=Observable.create(
      obervable=>{
        try{
          this.calcularRota(null, 
            this.locaisOrdenados[this.locaisOrdenados.length-1], 
            this.paradas, 
            this.locaisOrdenados).subscribe(
            trajeto=>{
              obervable.next(trajeto);
            },
            error=>{
              obervable.error(error);    
            }
          );
        }
        catch(error){
          obervable.error(error);
        }
      }
    );
    return trajetoObservable;
  }

  calcularTrajeto(localizacao:google.maps.LatLng, roteiro:Roteiro):Observable<Trajeto>{ 
    this.roteiro=roteiro;
    this.locais = [] as Local[];
    this.locaisOrdenados = [] as Local[];
    this.destinos = [] as Local[];
    this.origens = [] as Local[];
    this.paradas = [] as Local[];
    this.localizacao=localizacao;
    this.definirLocais(this.roteiro);
    let trajetoObservable:Observable<Trajeto>=Observable.create(
      obervable=>{
        try{          
          var sub;
          if(this.destinos.length==1&&this.origens.length==1){
            sub=this.calcularTrajetoComUnicoDestinoEUnicaOrigem();
          }else if(this.destinos.length==1)   {
            sub=this.calcularTrajetoComUnicoDestino();
          }else if(this.origens.length==1){
            sub=this.calcularTrajetoComUnicaOrigem();
          }else{
            sub=this.calcularTrajetoPorDistancia();
          }
          sub.subscribe(
            trajeto=>{
              this.trajeto=trajeto;              
              obervable.next(trajeto);
            },
            error=>{
              obervable.error(error);    
            }
          );
        }
        catch(error){
          obervable.error(error);
        }
      });     
    return trajetoObservable;
  }

}
