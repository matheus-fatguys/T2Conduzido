import { AngularFireOfflineDatabase, AfoListObservable } from 'angularfire2-offline';
import { ModalController } from 'ionic-angular';
import { MensagemProvider } from './../mensagem/mensagem';
import { Observable, Subscription } from 'rxjs';
import { Conducao } from './../../models/conducao';
import { Roteiro } from './../../models/roteiro';
import { Usuario } from './../../models/usuario';
import { Chave } from './../../models/chave';
import { AutenticacaoProvider } from './../autenticacao/autenticacao';
import { Conduzido } from './../../models/conduzido';
import { Condutor } from './../../models/condutor';
import { Injectable } from '@angular/core';

import { AngularFireDatabase, FirebaseListObservable } from "angularfire2/database";



@Injectable()
export class FatguysUberProvider {

  public conexao=null;

  public condutor: Condutor;
  public condutores: AfoListObservable<Condutor[]>;
  public conduzidos: AfoListObservable<Conduzido[]>;
  public chaves: AfoListObservable<Chave[]>;
  public conducoesSubscription:Subscription;

  constructor(private afd: AngularFireOfflineDatabase,
  private auth : AutenticacaoProvider,
  private msg: MensagemProvider,
  private modal: ModalController) {
    this.condutores=this.afd.list("condutores");
    this.conduzidos=this.afd.list("conduzidos");    
    this.chaves=this.afd.list("chaves");
    this.iniciarMonitaracaoConexao();
  }


  iniciarMonitaracaoConexao(){    
    let conectado=this.conectado();
      conectado.subscribe(
        c=>{
          if(this.conexao==null){
            this.conexao=true;
            return;
          }
          if(!c.$value){
            this.msg.mostrarErro("Você está sem conexão com a base!", 3000);
          }
          else{
            if(!this.conexao) {
              this.msg.mostrarErro("Conexão com a base restabelecida!", 3000);
            }
          }
          this.conexao=c.$value;
        }
      )
  }

  conectado(){
    return this.afd.object(".info/connected");
  }

  inciarRoteiro(roteiro:Roteiro){
    roteiro.emAndamento=true;
    roteiro.interrompido=false;
    roteiro.inicio=new Date();
    roteiro.fim=null;
    roteiro.conducoes.forEach(
      c=>{
        if(!c.cancelada){
          c.emAndamento=true;
          c.embarcado=false;
          c.interrompida=false;
          c.realizada=false;
          c.inicio=null;
          c.fim=null;
        }
      });
    this.condutor.roteiroEmexecucao=roteiro;
    let ref=this.salvarRoteiroEmexecucao();
    ref.then(r=>{
      this.salvarRoteiro(roteiro);
    });
    return ref;
  }
  reIniciarRoteiro(roteiro:Roteiro){
    roteiro.emAndamento=true;
    roteiro.interrompido=false;
    roteiro.fim=null;

    roteiro.conducoes.forEach(
      c=>{
        if(!c.cancelada&&!c.embarcado&&!c.realizada){
          c.emAndamento=true;
          c.inicio=null;
          c.fim=null;
        }
        else{
          c.emAndamento=false;
        }
      });
    
    this.condutor.roteiroEmexecucao=roteiro;
    let ref=this.salvarRoteiroEmexecucao();
    ref.then(r=>{
      this.salvarRoteiro(roteiro);
    });
    return ref;
  }

  interromperRoteiro(roteiro:Roteiro){
    roteiro.emAndamento=false;
    roteiro.interrompido=true;
    roteiro.fim=new Date();
    roteiro.conducoes.forEach(
      c=>{
        if(!c.cancelada&&!c.fim==null&&!c.realizada){
          // c.emAndamento=false;
          // c.embarcado=false;
          c.interrompida=true;
        }
      }
    )
    this.condutor.roteiroEmexecucao=roteiro;
    let ref=this.salvarRoteiroEmexecucao();
    ref.then(r=>{
      this.salvarRoteiro(roteiro);
    });
    return ref;
  }
  salvarRoteiroEmexecucao(){    
    return this.afd.object("/condutores/"+this.condutor.id+"/roteiroEmexecucao/")
    .set(this.condutor.roteiroEmexecucao);
  }
  finalizarRoteiro(roteiro:Roteiro){
    roteiro.emAndamento=false;
    roteiro.interrompido=false;
    roteiro.fim=new Date();
    roteiro.conducoes.forEach(
      c=>{
        if(!c.cancelada&&!c.interrompida&&!c.fim==null){
          c.emAndamento=false;
          c.embarcado=false;
          c.interrompida=false;
          c.realizada=true;
        }
      }
    )
    this.condutor.roteiroEmexecucao=roteiro;
    this.condutor.roteiroEmexecucao=null;
    if(roteiro.trajeto!=null&&roteiro.trajeto.pernas!=null){
      roteiro.trajeto.pernas.forEach(
        p=>{
          p.caminho=null;
        }
      )
    }
    
    let ref=this.afd.object("/condutores/"+this.condutor.id+"/roteiroEmexecucao/").remove();
    ref.then(r=>{
      this.salvarRoteiro(roteiro).then(r=>{
        this.afd.list("/condutores/"+this.condutor.id+"/roteiroRealizados/").push(this.condutor.roteiroEmexecucao);
      })
    });
    return ref;
  }

 
  salvarConducoesDoRoteiro(roteiro:Roteiro){   
    return this.afd.object("/condutores/"+roteiro.condutor+"/roteiros/"+roteiro.id+"/conducoes/").set(roteiro.conducoes);
  }
  atualizarLocalizacaoCondutor(condutor:Condutor){   
    return this.afd.object("/condutores/"+condutor.id+"/localizacao/").set(condutor.localizacao);
  }
  atualizarLocalizacaoSimuladaCondutor(condutor:Condutor){   
    return this.afd.object("/condutores/"+condutor.id+"/localizacaoSimulada/").set(condutor.localizacaoSimulada);
  }
  obterLocalizacaoCondutor(condutor:Condutor){   
    return this.afd.object("/condutores/"+condutor.id+"/localizacao/");
  }
  obterLocalizacaoSimuladaCondutor(condutor:Condutor){   
    return this.afd.object("/condutores/"+condutor.id+"/localizacaoSimulada/");
  }

  obterConduzidosDoRoteiro(roteiro:Roteiro){
    let refc=this.afd.object("/condutores/"+roteiro.condutor
    +"/roteiros/conducoes/");

  }

  

  obterConducoes (condutor: Condutor){    
    let ref = this.afd.list("/condutores/"+condutor.id+"/conducoes/", {
      query: {
        orderByChild: "condutor",
        equalTo: condutor.id
      }
    }); 
    return ref;  
  }
  
  obterConducoesComConduzidos (condutor: Condutor){    
    
    // Compose an observable based on the conducoes
    let conducoesComConduzido = Observable.from(this.afd.list("/condutores/"+condutor.id+"/conducoes/", {
      query: {
        orderByChild: "condutor",
        equalTo: condutor.id
      }
    }))
    /// Each time the conducoes emits, switch to unsubscribe/ignore
    // any pending conduzido queries:
    .switchMap(conducoes => {

    // Map the conducoes to the array of observables that are to be
    // combined.
    let conduzidoObservables = conducoes.map(conducao => this.afd.object("/conduzidos/"+conducao.conduzido+"/"));
    
    // Combine the user observables, and match up the users with the
    // projects, etc.

    return conduzidoObservables.length === 0 ?
      Observable.of(conducoes) :
      Observable.combineLatest(...conduzidoObservables, (...conduzidos) => {
        conducoes.forEach((conducao, index) => {
          conducao.conduzidoVO = conduzidos[index];
        });
        return conducoes;          
      });
  });  



    return conducoesComConduzido;  
  }

  obterConducoesDoRoteiroComConduzidos(roteiro: Roteiro){
      // Compose an observable based on the conducoes
    let conducoesComConduzido = Observable.from(this.afd.list("/condutores/"+roteiro.condutor+"/roteiros/"+roteiro.id+"/conducoes/", {
      query: {
        orderByChild: "condutor",
        equalTo: roteiro.condutor
      }
    }))
    /// Each time the conducoes emits, switch to unsubscribe/ignore
    // any pending conduzido queries:
    .switchMap(conducoes => {

    // Map the conducoes to the array of observables that are to be
    // combined.
    let conduzidoObservables = conducoes.map(conducao => this.afd.object("/conduzidos/"+conducao.conduzido+"/"));
    
    // Combine the user observables, and match up the users with the
    // projects, etc.

    return conduzidoObservables.length === 0 ?
      Observable.of(conducoes) :
      Observable.combineLatest(...conduzidoObservables, (...conduzidos) => {
        conducoes.forEach((conducao, index) => {
          conducao.conduzidoVO = conduzidos[index];
        });
        return conducoes;          
      });
  });  



    return conducoesComConduzido;  
  }

  salvarConducao (conducao: Conducao){
    conducao.condutor=this.condutor.id;

    if(!conducao.id){
      let ref = this.afd.list("condutores/"+conducao.condutor+"/conducoes").push(conducao).then(
        ref => {
          conducao.id=ref.key;
          return this.afd.list("condutores/"+conducao.condutor+"/conducoes").update(conducao.id,conducao);
        }
      ) 
      return ref;
    }
    else{
      return this.afd.list("condutores/"+conducao.condutor+"/conducoes").update(conducao.id, conducao);
    }    
  }

  // obterRoteirosAssociadosAConducao(conducao: Conducao){
  //   // let ret =this.afd.list("condutores/"+conducao.condutor+"/roteiros/conducoes",{
  //   //   query: {
  //   //     orderByChild: "id",
  //   //     equalTo: conducao.id
  //   //   }
  //   // });
  //   // let ref =this.afd.database.ref("condutores/"+conducao.condutor+"/roteiros/conducoes/").orderByChild("id").equalTo(conducao.id);
  //   // let ref =this.afd.database.ref("/condutores/-Kr2XRBVjGmF4XGSxTpO/roteiros/-KrrOFYAmv0AB13VYimL/conducoes").orderByChild("id").equalTo(conducao.id);
  //   let ref =this.afd.database.ref("/condutores/-Kr2XRBVjGmF4XGSxTpO/roteiros").orderByChild("conducoes").equalTo(0);
  //   ref.on("child_added",
  // r=>{
  //   console.log(r.val());
  // })
  //   // .equalTo(conducao.id);
  //   return ref;
  // }

  excluirConducao (conducao: Conducao){
    let ret =this.afd.list("condutores/"+conducao.condutor+"/conducoes").remove(conducao.id);      
    return ret;
  }


  obterConduzidos (condutor: Condutor){    
    return this.afd.list(`/conduzidos/`, {
      query: {
        orderByChild: "condutor",
        equalTo: condutor.id
      }
    });    
  }

  salvarConduzido (conduzido: Conduzido){
    conduzido.condutor=this.condutor.id;    
    if(!conduzido.id){
      let chaveGerada=this.gerarChave();
      let chave={} as Chave;
      chave.chave=chaveGerada;            
      let ref = this.chaves.push(chave).then(r=>{
        conduzido.chave=r.key;      
        this.conduzidos.push(conduzido).then(
          ref => {
            conduzido.id=ref.key;
            this.conduzidos.update(conduzido.id, conduzido);
            chave.conduzido=conduzido.id;
            this.chaves.update(r.key, chave);
          }
        );
      });      
      return ref;
    }
    else{
      return this.conduzidos.update(conduzido.id, conduzido);
    }    
  }

  private gerarChave():string{
    const tamChave=4;
    var chave:string="";
    for(var i=0;i<tamChave;i++){
      chave+=Math.round(Math.random()*9);  
    }
    return chave;
  }

  excluirConduzido (conduzido){
    let ret =this.conduzidos.remove(conduzido.id);
    let sub = this.obterChaveDoConduzido(conduzido).subscribe(
      chaves=>{
        this.removerChaveDoConduzido(chaves[0].$key)
        .then(()=>{
          // this.conduzidos.remove(conduzido.id);
        });
        sub.unsubscribe();
      });    
    return ret;
  }

 salvarRoteiro (roteiro: Roteiro){
    if(roteiro.domingo==null){
      roteiro.domingo=false;
    }
    if(roteiro.segunda==null){
      roteiro.segunda=false;
    }
    if(roteiro.terca==null){
      roteiro.terca=false;
    }
    if(roteiro.quarta==null){
      roteiro.quarta=false;
    }
    if(roteiro.quinta==null){
      roteiro.quinta=false;
    }
    if(roteiro.sexta==null){
      roteiro.sexta=false;
    }
    if(roteiro.sabado==null){
      roteiro.sabado=false;
    }
    if(!roteiro.id){
      return this.afd.list("condutores/"+roteiro.condutor+"/roteiros").push(roteiro).then(
        ref => {
          roteiro.id=ref.key;
          return this.afd.list("condutores/"+roteiro.condutor+"/roteiros").update(roteiro.id,roteiro);
        }
      ) 
    }
    else{
      return this.afd.list("condutores/"+roteiro.condutor+"/roteiros").update(roteiro.id, roteiro);
    }    
  }
 salvarRoteiroIdaVolta (roteiro: Roteiro){
    if(roteiro.domingo==null){
      roteiro.domingo=false;
    }
    if(roteiro.segunda==null){
      roteiro.segunda=false;
    }
    if(roteiro.terca==null){
      roteiro.terca=false;
    }
    if(roteiro.quarta==null){
      roteiro.quarta=false;
    }
    if(roteiro.quinta==null){
      roteiro.quinta=false;
    }
    if(roteiro.sexta==null){
      roteiro.sexta=false;
    }
    if(roteiro.sabado==null){
      roteiro.sabado=false;
    }

    let roteiroVolta:Roteiro={} as Roteiro;
    roteiroVolta.condutor=roteiro.condutor;
    roteiroVolta.domingo=roteiro.domingo;
    roteiroVolta.segunda=roteiro.segunda;
    roteiroVolta.terca=roteiro.terca;
    roteiroVolta.quarta=roteiro.quarta;
    roteiroVolta.quinta=roteiro.quinta;
    roteiroVolta.sexta=roteiro.sexta;
    roteiroVolta.sabado=roteiro.sabado;
    roteiroVolta.hora=roteiro.hora;
    roteiroVolta.nome=roteiro.nome+"[VOLTA]";
    roteiro.nome+="[IDA]";
    let conducoesVolta:Conducao[]=[] as Conducao[];
    roteiro.conducoes.forEach(
      c=>{
        var cond:Conducao= {} as Conducao;
        cond.origem=c.destino;
        cond.destino=c.origem;
        cond.condutor=c.condutor;
        cond.conduzido=c.conduzido;
        conducoesVolta.push(cond);
      }
    )
    roteiroVolta.conducoes=conducoesVolta;
       
    if(!roteiro.id){
      return this.afd.list("condutores/"+roteiro.condutor+"/roteiros").push(roteiro).then(
        ref => {
          roteiro.id=ref.key;
          this.salvarRoteiro(roteiroVolta).then(
            r=>{
              roteiroVolta.conducoes.forEach(c => {
                this.salvarConducao(c);
              });
            }
          )
          return this.afd.list("condutores/"+roteiro.condutor+"/roteiros").update(roteiro.id,roteiro);
        }
      ) 
    }
    else{
      let ret =this.afd.list("condutores/"+roteiro.condutor+"/roteiros").update(roteiro.id, roteiro);
      ret.then(r=>{
        this.salvarRoteiro(roteiroVolta).then(
            r=>{
              roteiroVolta.conducoes.forEach(c => {
                this.salvarConducao(c);
              });
            }
          )
      })
      return ret;
    }    
  }

  excluirRoteiro (roteiro: Roteiro){
    
    return this.afd.list("condutores/"+roteiro.condutor+"/roteiros").remove(roteiro.id);
    
  }

  obterRoteiros(condutor: Condutor){
    return this.afd.list(`/condutores/`+condutor.id+"/roteiros");
  }

  removerChaveDoConduzido(id){
    return this.chaves.remove(id);
  }

  obterCondutores (){
    return this.condutores;
  }

  salvarCondutor (condutor: Condutor){
    if(!condutor.id){
      return this.condutores.push(condutor).then(
        ref => {
          condutor.id=ref.key;
          return this.condutores.update(condutor.id,condutor);
        }
      )      
    }
    else{
      return this.condutores.update(condutor.id, condutor);
    }    
  }

 
  registrarCondutor (condutor: Condutor, usuario: Usuario){
    return this.auth.registrarUsuario(usuario)
    .then((ref) => {
        condutor.usuario=ref.uid;
        return this.condutores.push(condutor).then(
          ref => {
            condutor.id=ref.key;
            return this.condutores.update(ref, condutor);
          }
        );
    });  
  }

  obterChaveDoConduzido(conduzido: Conduzido){//:FirebaseListObservable<Chave[]>{
    return this.afd.list(`/chaves/`, {
      query: {
        orderByChild: "conduzido",
        equalTo: conduzido.id
      }
    });    
  }
  
  // obterChaveDoConduzido(conduzido: Conduzido){//:FirebaseListObservable<Chave[]>{
  //   return this.afd.list("chaves/"+conduzido.chave);
  // }

  obterCondutorPeloUsuarioLogado(){

    let user = this.auth.usuarioLogado();

    if(user==null){
      return null;
    }
    
    let obs = this.afd.list("condutores", {
      query: {
        orderByChild: "usuario",
        equalTo: user.uid
      }
    })
    // obs.subscribe(condutor=>{
    //         this.condutor=condutor[0];
    // });  
    return obs;
  }

  excluirCondutor (id){
    return this.condutores.remove(id);
  } 

}
