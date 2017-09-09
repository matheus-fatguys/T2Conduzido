import { NotificacaoProvider } from './../notificacao/notificacao';
import { Conducao } from './../../models/conducao';
import { Loading, LoadingController, AlertController } from 'ionic-angular';
import { MensagemProvider } from './../mensagem/mensagem';
import { Conduzido } from './../../models/conduzido';
import { FatguysUberProvider } from './../fatguys-uber/fatguys-uber';
import { AngularFireAuth } from 'angularfire2/auth';
import { Injectable } from '@angular/core';
import { Observer, Observable, Subscription } from "rxjs/Rx";
import { Subject } from "rxjs/Subject";

/*
  Generated class for the DadosUsuarioProvider provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular DI.
*/
@Injectable()
export class DadosUsuarioProvider {
  
  private observer:Observer<string>;
  private observable:Observable<string>;
  private userConduzidoObservable: Observable<Conduzido[]>;
  private userConduzidoCondutorObservable: Observable<any[]>;
  private conduzidoSubscription: Subscription;;
  private userConduzidoCondutorSubscription: Subscription;
  public roteiroEmExecucaoSubscription:Subscription;
  private loading:Loading ;
  public emViagem:boolean=false;

  constructor(
    public afAuth: AngularFireAuth,
    public fatguysService: FatguysUberProvider,  
    public msg: MensagemProvider,
    public loadingCtrl: LoadingController,
    public alertCtrl:AlertController,
    public notificacao: NotificacaoProvider) {
  }

  iniciarMonitoramento():Observable<string>{
    this. observable=Observable.create((observer) =>{
      this.observer=observer;
      if(this.loading==null){      
        this.loading = this.loadingCtrl.create({
              content: 'Buscando usuário...'
            });
      }      

      this.afAuth.authState.subscribe(
            user=>{
               if(user==null){    
                 console.log("nenhum usuário logado")                            
                  this.observer.next('LoginPage');
                  this.fatguysService.conduzido=null;
                  this.fatguysService.condutor=null;
                  try {
                    this.loading.dismiss()
                  } catch (error) {
                    
                  }
              }
              else{
                this.criarSubscriptions();
              }
            }
          );
    this.criarObservables();                    
    // this.criarSubscriptions();
    });
    return this.observable;
  }

  criarObservables(){
    this.userConduzidoObservable = this.afAuth.authState
    .filter(user=>{
      // console.log("user!=null&&this.fatguysService.conduzido==null: "+(user!=null&&this.fatguysService.conduzido==null))
      return user!=null&&this.fatguysService.conduzido==null
    })
    .flatMap(user=>{
      // console.log("this.fatguysService.obterConduzidoPeloUsuarioLogado(user): "+(this.fatguysService.obterConduzidoPeloUsuarioLogado(user)))
      return this.fatguysService.obterConduzidoPeloUsuarioLogado(user)
    });

    this.userConduzidoCondutorObservable = this.userConduzidoObservable
    .filter((conduzidos)=>{
      // console.log("conduzidos.length>0&&this.fatguysService.condutor==null: "+(conduzidos.length>0&&this.fatguysService.condutor==null))
      return conduzidos.length>0&&this.fatguysService.condutor==null})
    .flatMap((conduzidos)=>{
      // console.log("this.fatguysService.obterCondutorPeloConduzido(conduzidos[0]): ")
      // console.log(conduzidos[0])
      return this.fatguysService.obterCondutorPeloConduzido(conduzidos[0])
    });
  }

  criarSubscriptions(){
    this.unsubscribeObservables();
    this.conduzidoSubscription=this.userConduzidoObservable.distinctUntilChanged().subscribe(
            conduzido=>{
              if(this.fatguysService.conduzido==null&&conduzido[0]!=null){
                this.fatguysService.conduzido=conduzido[0];
              }
              if(this.afAuth.auth.currentUser!=null&&this.fatguysService.conduzido==null){                    
                  console.log("Esse usuário não é um conduzido!");
                this.msg.mostrarMsg("Esse usuário não é um conduzido!", 3000)
                .onDidDismiss(d=>{
                    this.observer.next('LoginPage');
                    try {                        
                      this.loading.dismiss()
                    } catch (error) {
                      
                    }
                });                
              }
            }
          );
    this.userConduzidoCondutorSubscription =this.userConduzidoCondutorObservable
          .subscribe(
            (condutor)=>{                                                        
              if(this.fatguysService.condutor==null||(this.fatguysService.condutor!=null&&this.fatguysService.condutor.id!=condutor[0].id)){                
                  this.fatguysService.condutor=condutor[0]; 
                  this.notificacao.iniciarNotificacoes();  
                  // console.log("this.fatguysService.condutor=condutor[0];")
                  // console.log(condutor[0])
                this.msg.mostrarMsg("Bem vindo, "+ this.fatguysService.conduzido.nome +"!", 3000) 
                .onDidDismiss(d=>{
                    this.observer.next('HomePage');                    
                    try {
                      this.unsubscribeObservables();
                      this.loading.dismiss()
                      console.log("this.monitorarRoteiroEmExecucao()")
                      this.monitorarRoteiroEmExecucao();
                    } catch (error) {
                      
                    }
                });
              }
            }
          );
  }

  monitorarRoteiroEmExecucao(){
    console.log("monitorarRoteiroEmExecucao()");
    if(this.fatguysService.condutor==null){
      return ;
    }
    console.log("this.roteiroEmExecucaoSubscription: "+this.roteiroEmExecucaoSubscription);
      if(this.roteiroEmExecucaoSubscription!=null){
        console.log("this.roteiroEmExecucaoSubscription.unsubscribe()");
        this.roteiroEmExecucaoSubscription.unsubscribe();
      }
      this.emViagem=false;
      this.roteiroEmExecucaoSubscription=(this.fatguysService.obterConducoesDoRoteiroAndamento(this.fatguysService.condutor) as any)
      .filter(conducoes=>{
        // console.log("!this.emViagem: "+!this.emViagem);
        return !this.emViagem;
      })
      .filter(conducoes=>{
        // console.log("return conducoes.findIndex(conducao=>conducao.conduzido==this.fatguysService.conduzido.id)>=0: "+(conducoes.findIndex(conducao=>conducao.conduzido==this.fatguysService.conduzido.id)>=0));
        return conducoes.findIndex(conducao=>conducao.conduzido==this.fatguysService.conduzido.id)>=0;
      })
      .filter(conducoes=>{
        // console.log("return conducoes.findIndex(conducao=>conducao.emAndamento)>=0: "+(conducoes.findIndex(conducao=>conducao.emAndamento)>=0));
        return conducoes.findIndex(conducao=>conducao.emAndamento)>=0;
      })
      .subscribe(conducoes=>{
        // console.log("this.confimarIrParaViagem(conducoes[0]): ");
        // console.log(conducoes[0]);
        this.confimarIrParaViagem(conducoes[0]);        
      });
  }

  confimarIrParaViagem(conducao:Conducao){
    let confirm = this.alertCtrl.create({
      title: 'Condução em Andamento',
      message: "Sua condução está em andamento, ir para viagem?",
      buttons: [
        {
          text: 'Cancelar',
          handler: () => {
            
          }
        },
        {
          text: 'OK',
          handler: (opcoes) => {
            this.emViagem=true;
            this.observer.next('ViagemPage');
          }
        }
      ]
    });
    confirm.present();
  }

  pararMonitoramentoRoteiroExecucao(){
    this.emViagem=true;
    if(this.roteiroEmExecucaoSubscription!=null){
      this.roteiroEmExecucaoSubscription.unsubscribe();      
    }
    this.roteiroEmExecucaoSubscription=null;
  }

  unsubscribeObservables(){
    if(this.conduzidoSubscription!=null){
      this.conduzidoSubscription.unsubscribe()
    }
    this.conduzidoSubscription=null;
    if(this.userConduzidoCondutorSubscription!=null){
      this.userConduzidoCondutorSubscription.unsubscribe()
    }
    this.userConduzidoCondutorSubscription=null;
  }

}
