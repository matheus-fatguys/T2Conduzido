import { Conducao } from './../../models/conducao';
import { AudioProvider } from './../../providers/audio/audio';
import { DetalheRoteiroComponent } from './../../components/detalhe-roteiro/detalhe-roteiro';
import { Condutor } from './../../models/condutor';
import { Roteiro } from './../../models/roteiro';
import { FatguysUberProvider } from './../../providers/fatguys-uber/fatguys-uber';
import { MensagemProvider } from './../../providers/mensagem/mensagem';
import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController } from 'ionic-angular';


@IonicPage()
@Component({
  selector: 'page-roteiro',
  templateUrl: 'roteiro.html',
})
export class RoteiroPage {  
  private roteiro={} as Roteiro;

  @ViewChild(DetalheRoteiroComponent)
  detalheRoteiro : DetalheRoteiroComponent;

  roteiroValido:boolean;
  private podeIniciarRoteiro:boolean=false;
  private podeReiniciarRoteiro:boolean=false;

  constructor(public navCtrl: NavController, 
    public navParams: NavParams,
    public alertCtrl: AlertController,
    public fatguys: FatguysUberProvider,
    public msg: MensagemProvider) {
      let roteiro=this.navParams.get('roteiro');
      if(roteiro){
        this.roteiro=roteiro;      
        this.validaPodeInicar();
        this.validaPodeReinicar();
      }
  }

  validaPodeInicar():boolean{
    this.podeIniciarRoteiro= (this.fatguys.condutor.roteiroEmexecucao==null
      ||!this.fatguys.condutor.roteiroEmexecucao.emAndamento
      ||(this.fatguys.condutor.roteiroEmexecucao.emAndamento
        &&this.roteiro.id==this.fatguys.condutor.roteiroEmexecucao.id)
    );
      
      console.log(this.podeIniciarRoteiro);
      return  this.podeIniciarRoteiro;
  }
  validaPodeReinicar():boolean{
    this.podeReiniciarRoteiro= this.fatguys.condutor.roteiroEmexecucao!=null
    &&((this.fatguys.condutor.roteiroEmexecucao.emAndamento||this.fatguys.condutor.roteiroEmexecucao.interrompido)
        &&this.roteiro.id==this.fatguys.condutor.roteiroEmexecucao.id);
      
      console.log(this.podeReiniciarRoteiro);
      return  this.podeReiniciarRoteiro;
  }

  salvar(){
    if(this.roteiro.id==null){
      this.perguntarSobreVolta();
    }
    else{
      let ref= this.fatguys.obterCondutorPeloUsuarioLogado().subscribe(
        r=>{
          this.roteiro.condutor=r[0].id;
          this.salvarRoteiro();
          ref.unsubscribe();
        }
      ) 
    } 
  }

  salvarRoteiro(){    
    let sub = this.fatguys.salvarRoteiro(this.roteiro).then(
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

  perguntarSobreVolta(){
    let confirm = this.alertCtrl.create({
      title: 'Roteiro de Volta',
      message: 'Gerar roteiro de volta também?',
      buttons: [
        {
          text: 'Não',
          handler: () => {
            this.roteiro.condutor=this.fatguys.condutor.id;
            this.salvarRoteiro();
          }
        },
        {
          text: 'Sim',
          handler: () => {
            this.salvarRoteiroIdaVolta();
          }
        }
      ]
    });
    confirm.present();
  }

  salvarRoteiroIdaVolta(){
    this.roteiro.condutor=this.fatguys.condutor.id;
    let sub = this.fatguys.salvarRoteiroIdaVolta(this.roteiro).then(
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

  iniciar(){
    this.navCtrl.setRoot('ViagemPage',{roteiro:this.roteiro});
  }

  onChangeRoteiroValido(){
    this.roteiroValido=this.detalheRoteiro.isValido();
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad RoteiroPage');    
  }

}
