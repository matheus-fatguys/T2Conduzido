import { Chave } from './../../models/chave';
import { MensagemProvider } from './../../providers/mensagem/mensagem';
import { Conduzido } from './../../models/conduzido';
import { FatguysUberProvider } from './../../providers/fatguys-uber/fatguys-uber';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

@IonicPage()
@Component({
  selector: 'page-cadastro-conduzidos',
  templateUrl: 'cadastro-conduzidos.html',
})
export class CadastroConduzidosPage implements OnInit, OnDestroy {
  
  private conduzidos;
  private conduzidoSelecionado:Conduzido;
  private conduzidosSubscription;

  constructor(public navCtrl: NavController, 
    public navParams: NavParams, 
    public fatguys: FatguysUberProvider,
    public msg: MensagemProvider) {
  }

  ngOnInit(): void {
    if(this.fatguys.condutor==null){      
      this.navCtrl.setRoot('LoginPage');
    }
    else{
      this.obterConduzidos();
    }    
  }

  ngOnDestroy(): void {
    this.unsubscribeObservables();
  }
  unsubscribeObservables(){
    
  }

  obterConduzidos(){
      this.conduzidos=this.fatguys.obterConduzidos(this.fatguys.condutor);
  }

  toggleAtivar(conduzido: Conduzido){
    this.fatguys.salvarConduzido(conduzido).then(
      r=>{
        
      }
    ).catch(error=>{
        this.msg.mostrarMsg("Erro salvando : "+error);
      });
  }

  onSelect(conduzido){
    this.conduzidoSelecionado=conduzido;
    //this.detalhe();
  }  

  detalhe(){
    let sub = this.fatguys.obterChaveDoConduzido(this.conduzidoSelecionado)
    .subscribe(
        r=>{
          let chave={} as Chave;
          //chave.chave=r[0].chave;
          chave=r[0] as Chave;
          chave.conduzido=this.conduzidoSelecionado.id;
          this.navCtrl.push('ConduzidoPage',{conduzido:this.conduzidoSelecionado, chave:chave});          
          sub.unsubscribe();
        }
      );    
  }

  novo(){
    this.navCtrl.push('ConduzidoPage',{} as Conduzido);
  }

  excluir(conduzido){
    if(conduzido!=null){
      this.conduzidoSelecionado=conduzido;
    }
    this.fatguys.excluirConduzido(this.conduzidoSelecionado).then(
      (r)=>{
        this.msg.mostrarMsg("Exclusão realizada!", 3000);
      },
      e=>{
        this.msg.mostrarErro("Erro excluindo: "+e.message);  
      }
    ).catch(error=>{
      this.msg.mostrarErro("Erro excluindo: "+error);
    });
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad CadastroConduzidosPage');
  }

  telefonar(){
    window.open('tel://' + this.conduzidoSelecionado.telefone);
  }

}
