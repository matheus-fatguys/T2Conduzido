import { DetalheConduzidoComponent } from './../../components/detalhe-conduzido/detalhe-conduzido';
import { Validators } from '@angular/forms';
import { FormBuilder } from '@angular/forms';
import { FormGroup } from '@angular/forms';
import { Chave } from './../../models/chave';
import { MensagemProvider } from './../../providers/mensagem/mensagem';
import { FatguysUberProvider } from './../../providers/fatguys-uber/fatguys-uber';
import { Conduzido } from './../../models/conduzido';
import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';


@IonicPage()
@Component({
  selector: 'page-conduzido',
  templateUrl: 'conduzido.html',
})
export class ConduzidoPage {
  

  private conduzido={} as Conduzido;
  private chave={} as Chave;
  @ViewChild(DetalheConduzidoComponent)
  private detalheConduzido:DetalheConduzidoComponent;
  conduzidoValido:boolean;

  constructor(public navCtrl: NavController, 
    public navParams: NavParams,
    public fatguys: FatguysUberProvider,
    public msg: MensagemProvider) {
    let conduzido=this.navParams.get('conduzido');
    let chave=this.navParams.get('chave');
    if(conduzido){
      this.conduzido=conduzido;      
    }
    if(chave){
      this.chave=chave as Chave;      
    }

  }

  salvar(){
    this.fatguys.salvarConduzido(this.conduzido).then(
      r=>{
        this.msg.mostrarMsg("Dados salvos!", 3000).onDidDismiss(d=>{
          if(this.navCtrl.canGoBack()){
            this.navCtrl.pop();
          }
        });
      }
    ).catch(error=>{
        this.msg.mostrarMsg("Erro salvando : "+error);
      });   
  }

  onChangeConduzidoValido(){
    this.conduzidoValido=this.detalheConduzido.isValido();
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ConduzidoPage');
  }

}
