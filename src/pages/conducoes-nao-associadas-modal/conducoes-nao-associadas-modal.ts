import { ConducaoPage } from './../conducao/conducao';
import { ModalController } from 'ionic-angular';
import { Roteiro } from './../../models/roteiro';
import { FatguysUberProvider } from './../../providers/fatguys-uber/fatguys-uber';
import { MensagemProvider } from './../../providers/mensagem/mensagem';
import { Conducao } from './../../models/conducao';
import { Component, OnDestroy } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';

@IonicPage()
@Component({
  selector: 'page-conducoes-nao-associadas-modal',
  templateUrl: 'conducoes-nao-associadas-modal.html',
})
export class ConducoesNaoAssociadasModalPage implements OnDestroy{
  ngOnInit(): void {
  }
  ngOnDestroy(): void {
    console.log("ngOnDestroy CadastroRoteirosPage ");
    this.unsbscribeobservables();    
  }
  unsbscribeobservables(){    
    if(this.subConducoes!=null){
      this.subConducoes.unsubscribe();
    }
  }

  private termo:string;
  private roteiro:Roteiro;
  private conducoes:Conducao[]=[] as Conducao[];
  private conducoesFiltradas:ConducaoModel[]=[] as ConducaoModel[];
  // private conducaoSelecionada:Conducao;
  private conducoesSelecionadas:Conducao[];
  private subConducoes;

  constructor(public navCtrl: NavController, 
    public navParams: NavParams, 
    public viewCtrl: ViewController,
    public modalCtrl: ModalController,
    public fatguys: FatguysUberProvider,
    public msg: MensagemProvider) {
      let roteiro=this.navParams.get('roteiro') as Roteiro;
      if(roteiro){
        this.roteiro=roteiro;      
      }
  }

  obterConducoes(){
    // let ref=this.fatguys.obterCondutorPeloUsuarioLogado();
    // if(ref!=null){
    //   let sub = ref.subscribe(
    //     conds=>{
          // this.conducoes=this.fatguys.obterConducoes(conds[0]);
          this.subConducoes = this.fatguys.obterConducoesComConduzidos(this.fatguys.condutor).subscribe(
              conducoes=>{
                this.conducoes=[];
                // var cs=[];
                conducoes.forEach(c => {
                  var ci;
                  if(this.roteiro.conducoes){
                    ci = this.roteiro.conducoes.findIndex(cr=>{
                      return cr.id==c.id;
                    });
                    if(ci<0){
                      // cs.push(c);
                      this.conducoes.push(c);
                    }
                  }
                  else{
                    this.conducoes.push(c);
                  }
                });
                this.conducoesFiltradas=ConducaoModel.toModel(this.conducoes);
                this.subConducoes.unsubscribe();
              }
          );  
          //   sub.unsubscribe();        
    //     }
    //   );
    // }    
  }

  

  

  onInput($event){
    this.conducoesFiltradas=ConducaoModel.toModel(this.conducoes);
    if(this.termo!=null&&this.termo.trim()==""){
      return;
    }
    let cf=this.conducoes.filter(
      conducao=>{
        // return conducao.conduzidoVO.nome.trim().toLowerCase().includes(termo.toLowerCase());
        return (
                  conducao.conduzidoVO.nome.trim().toLowerCase().includes(this.termo.toLowerCase())
                  ||conducao.origem.endereco.trim().toLowerCase().includes(this.termo.toLowerCase())
                  ||conducao.destino.endereco.trim().toLowerCase().includes(this.termo.toLowerCase())
                );
      }
    );
      this.conducoesFiltradas=ConducaoModel.toModel(cf);
  }

  ionClear($event){
    this.conducoesFiltradas=ConducaoModel.toModel(this.conducoes);
  }

  // onSelect(conducao){
  //   this.conducoesSelecionadas.push(conducao);
  // }  

  cancelar(){
    this.viewCtrl.dismiss();
  }

  // isSelecionada(conducao){

  // }

  nova(){
    let modal = this.modalCtrl.create(ConducaoPage, {roteiro: this.roteiro, modal: true});
    modal.onDidDismiss(data => {
      if(data!=null&&data.conducao!=null){                
        this.obterConducoes();        
      }
    });    
    modal.present();
  }
  
  ok(){
    this.viewCtrl.dismiss({conducoes: ConducaoModel.toConducao(this.conducoesFiltradas, true)});
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ConducoesNaoAssociadasModalPage');
    this.obterConducoes();
  }

}

class ConducaoModel{
  marcada:boolean;
  conducao:Conducao;
  constructor(marcada:boolean,conducao:Conducao){
    this.marcada=marcada;
    this.conducao=conducao;
  }
  static toModel(conducoes:Conducao[]):ConducaoModel[]{
    let m:ConducaoModel[]=[] as ConducaoModel[];
    conducoes.forEach(
      c=>{
        m.push(new ConducaoModel(false, c));
      }
    );
    return m;
  }
  static toConducao(model:ConducaoModel[], soMarcadas:boolean=false):Conducao[]{
    let m:Conducao[]=[] as Conducao[];
    model.forEach(
      c=>{
        if(!soMarcadas||(soMarcadas&&c.marcada)){
          m.push(c.conducao);
        }
      }
    );
    return m;
  }
}
