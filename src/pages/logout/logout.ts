import { Conduzido } from './../../models/conduzido';
import { MensagemProvider } from './../../providers/mensagem/mensagem';
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

  conduzido={} as Conduzido;
  private loading:Loading ;

  constructor(public navCtrl: NavController, 
    public navParams: NavParams,
    public auth:  AutenticacaoProvider,
    public fatguysService: FatguysUberProvider,
    private msg : MensagemProvider,
    public loadingCtrl: LoadingController) { 
      this.conduzido=this.fatguysService.conduzido;      
      
        if(this.conduzido==null){
          this.navCtrl.setRoot('LoginPage');
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
              this.msg.mostrarMsg("Até logo, "+this.conduzido.nome);
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
