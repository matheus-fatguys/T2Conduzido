import { AudioProvider } from './../../providers/audio/audio';
import { Conducao } from './../../models/conducao';
import { Roteiro } from './../../models/roteiro';
import { MensagemProvider } from './../../providers/mensagem/mensagem';
import { FatguysUberProvider } from './../../providers/fatguys-uber/fatguys-uber';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController, Loading, AlertController } from 'ionic-angular';


@IonicPage()
@Component({
  selector: 'page-cadastro-roteiros',
  templateUrl: 'cadastro-roteiros.html',
})
export class CadastroRoteirosPage  implements OnInit, OnDestroy {
  ngOnDestroy(): void {
    console.log("ngOnDestroy CadastroRoteirosPage ");
    this.unsbscribeobservables();    
  }
  unsbscribeobservables(){    
    if(this.subRoteiros!=null){
      this.subRoteiros.unsubscribe();
    }
    // if(this.subCondutor!=null){
    //   this.subCondutor.unsbscribe();
    // }
  }

  private condutorObserver;
  private loading:Loading ;
  private roteiros;
  private roteiroSelecionado:Roteiro;
  private roteiroEmExecucao:Roteiro;
  private podeIniciarRoteiro:boolean=false;
  private podeReiniciarRoteiro:boolean=false;

  private subCondutor;
  private subRoteiros;

  constructor(public navCtrl: NavController, 
    public navParams: NavParams, 
    public fatguys: FatguysUberProvider,
    public msg: MensagemProvider,
    public audio:AudioProvider,
    public alertCtrl: AlertController,
    public loadingCtrl: LoadingController) {
      console.log("constructor CadastroRoteirosPage");
  }

  ngOnInit(): void {
    console.log("ngOnInit CadastroRoteirosPage");
    if(this.loading==null){      
      this.loading = this.loadingCtrl.create({
            content: 'Buscando condutor...'
          });
    }
    // console.log("ngOnInit CadastroRoteirosPage this.fatguys.condutor=>"+this.fatguys.condutor);
    // console.log(this.fatguys.condutor);
    if(this.fatguys.condutor==null){      
      this.navCtrl.setRoot('LoginPage');
    }
    else{
      this.loading.setContent("Buscando roteiros...");
      this.roteiros=this.fatguys.obterRoteiros(this.fatguys.condutor);
      this.subRoteiros=this.roteiros.subscribe(
        roteiros=>{
          console.log("ngOnInit CadastroRoteirosPage roteiros=>"+roteiros);
          console.log(roteiros);
          try {
            this.loading.dismiss();                        
          } catch (error) {
            
          }
          this.roteiroEmExecucao=this.fatguys.condutor.roteiroEmexecucao;  
        },
        e=>{
          this.loading.dismiss();
        }
      );
    }     
  }

  toggleAtivar(roteiro: Roteiro){
    this.fatguys.salvarRoteiro(roteiro).then(
      r=>{
        
      }
    ).catch(error=>{
        this.msg.mostrarMsg("Erro salvando : "+error);
      });
  }

  onSelect(roteiro){
    this.roteiroSelecionado=roteiro;
    this.validaPodeInicar();
    this.validaPodeReinicar();
  }  

  detalhe(){
    if(this.roteiroSelecionado.conducoes==null){
      this.roteiroSelecionado.conducoes=[] as Conducao[];
    }
    this.loading = this.loadingCtrl.create({
            content: 'Buscando conduções do roteiro...'
          });
    this.loading.present(this.loading).then(
      _=>{
          let sub = this.fatguys.obterConducoesDoRoteiroComConduzidos(this.roteiroSelecionado).subscribe(
          conducoes=>{
            this.loading.dismiss();
            this.roteiroSelecionado.conducoes=conducoes;
            this.navCtrl.push('RoteiroPage',{roteiro:this.roteiroSelecionado});    
            sub.unsubscribe();
          },
          error=>{
            this.loading.dismiss();
            this.msg.mostrarErro("Erro buscando roteiros: "+error);
          });
      }
    );
    
  }

  novo(){
    this.navCtrl.push('RoteiroPage',{roteiro:{conducoes: [] as Conducao[],
       domingo:false,
       segunda:true,
       terca:true,
       quarta:true,
       quinta:true,
       sexta:true,
       sabado:false,
      } as Roteiro});
  }

  validaPodeInicar():boolean{
    this.podeIniciarRoteiro= (this.fatguys.condutor.roteiroEmexecucao==null
      ||!this.fatguys.condutor.roteiroEmexecucao.emAndamento
      ||(this.fatguys.condutor.roteiroEmexecucao.emAndamento
        &&this.roteiroSelecionado.id==this.fatguys.condutor.roteiroEmexecucao.id)
    );
      
      console.log(this.podeIniciarRoteiro);
      return  this.podeIniciarRoteiro;
  }
  validaPodeReinicar():boolean{
    this.podeReiniciarRoteiro= this.fatguys.condutor.roteiroEmexecucao!=null
    &&((this.fatguys.condutor.roteiroEmexecucao.emAndamento||this.fatguys.condutor.roteiroEmexecucao.interrompido)
        &&this.roteiroSelecionado.id==this.fatguys.condutor.roteiroEmexecucao.id);
      
      console.log(this.podeReiniciarRoteiro);
      return  this.podeReiniciarRoteiro;
  }

  iniciar(){
    this.navCtrl.setRoot('ViagemPage',{roteiro:this.roteiroSelecionado});
  }

  excluir(roteiro){
    if(roteiro!=null){
      this.roteiroSelecionado=roteiro;
    }
    this.loading = this.loadingCtrl.create({
            content: 'Excluindo roteiro...'
          });
    // this.loading.setContent("Excluindo roteiro...");
    this.loading.present().then(
      _=>{
        this.fatguys.excluirRoteiro(this.roteiroSelecionado).then(
          (r)=>{
            this.msg.mostrarMsg("Exclusão realizada!", 3000);
          },
          e=>{
            this.loading.dismiss();
            this.msg.mostrarErro("Erro excluindo: "+e.message);  
          }
        ).catch(error=>{
          this.loading.dismiss();
          this.msg.mostrarErro("Erro excluindo: "+error);
        });
      }
    );
  }

  finalizarRoteiro(){     
    this.fatguys.finalizarRoteiro(this.roteiroSelecionado).then(
      r=>{
        this.loading.dismiss().catch(error=>{this.msg.mostrarErro(error)});
      })
    .catch(
      error=>{
        this.loading.dismiss();
        this.msg.mostrarErro("Erro finalizando roteiro: "+error);
      }
    )      
  }

  confirmarFinalizarRoteiro(){
    let confirm = this.alertCtrl.create({
      title: 'Finalizar Roteiro',
      message: 'Confrma finalização do roteiro?',
      buttons: [
        {
          text: 'Cancelar',
          handler: () => {
            return false;
          }
        },
        {
          text: 'OK',
          handler: () => {
            confirm.dismiss().then(
              r=>{
              this.finalizarRoteiro();
              this.validaPodeInicar();
              this.validaPodeReinicar();
              }
            )
            return false;
          }
        }
      ]
    });
    confirm.present();
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad CadastroRoteirosPage');
  }

}
