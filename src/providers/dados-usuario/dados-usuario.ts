import { Loading, LoadingController } from 'ionic-angular';
import { MensagemProvider } from './../mensagem/mensagem';
import { Conduzido } from './../../models/conduzido';
import { FatguysUberProvider } from './../fatguys-uber/fatguys-uber';
import { AngularFireAuth } from 'angularfire2/auth';
import { Injectable } from '@angular/core';
import { Observable, Subscription } from "rxjs/Rx";

/*
  Generated class for the DadosUsuarioProvider provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular DI.
*/
@Injectable()
export class DadosUsuarioProvider {
  
  private userConduzidoObservable: Observable<Conduzido[]>;
  private userConduzidoCondutorObservable: Observable<any[]>;
  private conduzidoSubscription: Subscription;;
  private userConduzidoCondutorSubscription: Subscription;
  private loading:Loading ;

  constructor(
    public afAuth: AngularFireAuth,
    public fatguysService: FatguysUberProvider,  
    public msg: MensagemProvider,
    public loadingCtrl: LoadingController,) {

      
  }

  iniciarMonitoramento(){
    if(this.loading==null){      
        this.loading = this.loadingCtrl.create({
              content: 'Buscando usuário...'
            });
      }
      this.loading.present().then(
        _=>{
          
          
          this.criarObservables();                    
          this.criarSubscriptions();
      });

      this.afAuth.authState.subscribe(
            user=>{
               if(user==null){                                
                  this.rootPage = 'LoginPage';
                  this.fatguysService.conduzido=null;
                  this.fatguysService.condutor=null;
                  try {
                    this.loading.dismiss()
                  } catch (error) {
                    
                  }
              }
            }
          );
  }

  criarObservables(){
    this.userConduzidoObservable = this.afAuth.authState
    .filter(user=>user!=null&&this.fatguysService.conduzido==null)
    .flatMap(user=>this.fatguysService.obterConduzidoPeloUsuarioLogado(user));

    this.userConduzidoCondutorObservable = this.userConduzidoObservable
    .filter((conduzidos)=>conduzidos.length>0&&this.fatguysService.condutor==null)
    .flatMap((conduzidos)=>this.fatguysService.obterCondutorPeloConduzido(conduzidos[0]));
  }

  criarSubscriptions(){
    this.unsubscribeObservables();
    this.conduzidoSubscription=this.userConduzidoObservable.distinctUntilChanged().subscribe(
            conduzido=>{
              if(this.fatguysService.conduzido==null&&conduzido[0]!=null){
                this.fatguysService.conduzido=conduzido[0];
              }
              if(this.afAuth.auth.currentUser!=null&&this.fatguysService.conduzido==null){                    
                this.msg.mostrarMsg("Esse usuário não é um conduzido!", 3000)
                .onDidDismiss(d=>{
                    this.rootPage = 'LoginPage';
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
                this.msg.mostrarMsg("Bem vindo, "+ this.fatguysService.conduzido.nome +"!", 3000)
                .onDidDismiss(d=>{
                    this.rootPage = 'HomePage';                    
                    try {
                      this.loading.dismiss()
                    } catch (error) {
                      
                    }
                });
              }
            }
          );
  }

  unsubscribeObservables(){
    if(this.conduzidoSubscription!=null){
      this.conduzidoSubscription.unsubscribe
    }
    this.conduzidoSubscription=null;
    if(this.userConduzidoCondutorSubscription!=null){
      this.userConduzidoCondutorSubscription.unsubscribe
    }
    this.userConduzidoCondutorSubscription=null;
  }

}
