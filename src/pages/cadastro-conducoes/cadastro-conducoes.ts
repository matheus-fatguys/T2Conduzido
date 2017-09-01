import { Conducao } from './../../models/conducao';
import { MensagemProvider } from './../../providers/mensagem/mensagem';
import { FatguysUberProvider } from './../../providers/fatguys-uber/fatguys-uber';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController, AlertController } from 'ionic-angular';

@IonicPage()
@Component({
  selector: 'page-cadastro-conducoes',
  templateUrl: 'cadastro-conducoes.html',
})
export class CadastroConducoesPage  implements OnInit, OnDestroy {


  private conducoes;
  private conducaoSelecionada;

  constructor(public navCtrl: NavController, 
    public navParams: NavParams, 
    public viewCtrl: ViewController,
    public fatguys: FatguysUberProvider,
    public alertCtrl: AlertController,
    public msg: MensagemProvider) {
  }

  obterConducoes(){   
      this.conducoes=this.fatguys.obterConducoesDoConduzido(this.fatguys.conduzido);   
  }

  confirmarNormalizacao(){
    let confirm = this.alertCtrl.create({
      title: 'Avisar Comparecimento',
      message: "Avisar ao condutor que comparecerá?",
      buttons: [
        {
          text: 'Cancelar',
          handler: () => {
            
          }
        },
        {
          text: 'OK',
          handler: (opcoes) => {
            this.avisarNormalizacao(this.conducaoSelecionada);
          }
        }
      ]
    });
    confirm.present();
  }

  avisarNormalizacao(conducao:Conducao){
    conducao.cancelada=false;
    this.fatguys.normalizarConducaoRoteiro(conducao);
    if(this.fatguys.condutor.roteiroEmexecucao!=null){
      this.fatguys.normalizarConducaoRoteiroAndamento(conducao);
    }
  }

  confirmarCancelamento(){
    let confirm = this.alertCtrl.create({
      title: 'Avisar Falta',
      message: "Avisar ao condutor que faltará?",
      buttons: [
        {
          text: 'Cancelar',
          handler: () => {
            
          }
        },
        {
          text: 'OK',
          handler: (opcoes) => {
            this.avisarCancelamento(this.conducaoSelecionada);
          }
        }
      ]
    });
    confirm.present();
  }

  avisarCancelamento(conducao:Conducao){
    conducao.cancelada=true;
    conducao.emAndamento=false;
    conducao.embarcado=false;
    conducao.realizada=false;
    this.fatguys.cancelarConducaoRoteiro(conducao);
    if(this.fatguys.condutor.roteiroEmexecucao!=null){
      this.fatguys.cancelarConducaoRoteiroAndamento(conducao);
    }
  }

  ngOnInit(): void {
    if(this.fatguys.conduzido==null){      
      this.navCtrl.setRoot('LoginPage');
    }
    else{
      this.obterConducoes();
    }
  }
  ngOnDestroy(): void {
    this.unsubscribeObservables();
  }
  unsubscribeObservables(){
    
  }

 
  onSelect(conducao){
    this.conducaoSelecionada=conducao;
  }  

  

  dismiss() {
   let data = { conducao: this.conducaoSelecionada };
   this.viewCtrl.dismiss(data);
  }


  ionViewDidLoad() {
    console.log('ionViewDidLoad CadastroConducoesPage');
  }

}
