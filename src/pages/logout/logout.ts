import { MensagemProvider } from './../../providers/mensagem/mensagem';
import { Condutor } from './../../models/condutor';
import { FatguysUberProvider } from './../../providers/fatguys-uber/fatguys-uber';
import { AutenticacaoProvider } from './../../providers/autenticacao/autenticacao';
import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, Loading, LoadingController } from 'ionic-angular';



@IonicPage()
@Component({
  selector: 'page-logout',
  templateUrl: 'logout.html',
})
export class LogoutPage {

  condutor={} as Condutor;
  private loading:Loading ;

  constructor(public navCtrl: NavController, 
    public navParams: NavParams,
    public auth:  AutenticacaoProvider,
    public fatguysService: FatguysUberProvider,
    private msg : MensagemProvider,
    public loadingCtrl: LoadingController) { 
      let ref = this.fatguysService.obterCondutorPeloUsuarioLogado();
      if(ref!=null){
      let sub=ref.subscribe(r=>{
        if(r[0]){
          this.condutor=r[0];
        }
        else{
          this.navCtrl.setRoot('LoginPage');
        }
        sub.unsubscribe();
      });
      }
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad LogoutPage');
  }

  sair(){
    if(this.loading==null){      
      this.loading = this.loadingCtrl.create({
            content: 'Saindo...'
          });
    }
    this.loading.present().then(
      _=>{
          this.auth.logout().then(r=>{
              this.loading.dismiss();
              this.msg.mostrarMsg("Até logo, "+this.condutor.nome).onDidDismiss(
                _=>{
                  this.navCtrl.setRoot("LoginPage");
                }
              );
          }).catch(error => {
            this.loading.dismiss();
            this.msg.mostrarErro('Falha saindo: '+error);
          });
      }).catch(error => {
        this.loading.dismiss();
        this.msg.mostrarErro('Falha saindo: '+error);
      });
  }
}
