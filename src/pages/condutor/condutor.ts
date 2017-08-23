import { Validators } from '@angular/forms';
import { FormBuilder } from '@angular/forms';
import { FormGroup } from '@angular/forms';
import { DetalheVeiculoComponent } from './../../components/detalhe-veiculo/detalhe-veiculo';
import { DetalheCondutorComponent } from './../../components/detalhe-condutor/detalhe-condutor';
import { Veiculo } from './../../models/veiculo';
import { MensagemProvider } from './../../providers/mensagem/mensagem';
import { Condutor } from './../../models/condutor';
import { FatguysUberProvider } from './../../providers/fatguys-uber/fatguys-uber';
import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';


@IonicPage()
@Component({
  selector: 'page-condutor',
  templateUrl: 'condutor.html',
})
export class CondutorPage {

  valido=false;

  condutor={} as Condutor;  

  @ViewChild(DetalheCondutorComponent)
  detalheCondutor : DetalheCondutorComponent;
  @ViewChild(DetalheVeiculoComponent)
  detalheVeiculo : DetalheVeiculoComponent;

  condutorValido:boolean;

  constructor(public navCtrl: NavController, 
    public navParams: NavParams,
    public fatguys: FatguysUberProvider,
    public msg: MensagemProvider) {


    let condutor=this.navParams.get('condutor');
    if(condutor!=null){
      this.condutor=condutor;
    }
    else{
      let ref =this.fatguys.obterCondutorPeloUsuarioLogado();
      if(ref!=null){
        ref.subscribe(r=>{
          this.condutor=r[0];
          if(!this.condutor.veiculo){
            this.condutor.veiculo={} as Veiculo;
          }
        });        
      }
    }
    if(!this.condutor.veiculo){
      this.condutor.veiculo={} as Veiculo;
    }
    else{
      this.condutor.veiculo={} as Veiculo;
      this.condutor.veiculo.modelo="DFGDFG";      
    }
  }

  salvar(){
      this.fatguys.salvarCondutor(this.condutor).then(r=>{
        this.msg.mostrarMsg("Dados salvos!", 3000).onDidDismiss(r=>{
         if(this.navCtrl.canGoBack()){
            this.navCtrl.pop();
          }
        })
      }).catch(error=>{
        this.msg.mostrarErro("Erro salvando: "+error);
      });     
  }

  onChangeCondutorValido(){
    this.condutorValido=this.detalheCondutor.isValido()&&this.detalheVeiculo.isValido();
  }
  onChangeVeiculoValido(){
    this.onChangeCondutorValido();
  }


  ionViewDidLoad() {
    console.log('ionViewDidLoad CondutorPage');
  }

}
