import { DetalheVeiculoComponent } from './../../components/detalhe-veiculo/detalhe-veiculo';
import { DetalheConduzidoComponent } from './../../components/detalhe-conduzido/detalhe-conduzido';
import { Validators, FormGroup, FormBuilder } from '@angular/forms';
import { Veiculo } from './../../models/veiculo';
import { MensagemProvider } from './../../providers/mensagem/mensagem';
import { Usuario } from './../../models/usuario';
import { Conduzido } from './../../models/conduzido';
import { FatguysUberProvider } from './../../providers/fatguys-uber/fatguys-uber';
import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, Loading, LoadingController } from 'ionic-angular';


@IonicPage()
@Component({
  selector: 'page-registrar',
  templateUrl: 'registrar.html',
})
export class RegistrarPage {

  private usuario= {} as Usuario;
  private loginForm:FormGroup;
  private conduzido= {} as Conduzido;
  private loading:Loading ;  
  private conduzidoValido:boolean;
  @ViewChild(DetalheConduzidoComponent)
  detalheConduzido : DetalheConduzidoComponent;
  

  constructor(public navCtrl: NavController, 
    public navParams: NavParams,
    public formBuilder: FormBuilder,
    private fatguysService: FatguysUberProvider,
    private msg : MensagemProvider,
    public loadingCtrl: LoadingController) {
      this.loginForm = formBuilder.group({
        email: ['', Validators.required],
        senha: ['', Validators.compose([Validators.required, Validators.minLength(6)])]
    });      
  }

  onChangeConduzidoValido(){
    this.conduzidoValido=this.detalheConduzido.isValido();
    this.conduzido=this.detalheConduzido.conduzido;
  }
  onChangeVeiculoValido(){
    this.onChangeConduzidoValido();
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad RegistrarPage');
  }

  voltar(){
    this.navCtrl.setRoot('LoginPage');
  }

  async registrar(){
    try {
      
        this.loading = this.loadingCtrl.create({
              content: 'Registrando...'
            });
      this.loading.present().then(
        _=>{          
          let resultado = this.fatguysService.registrarConduzido(this.conduzido, this.usuario).then(
            ref => {
              this.loading.dismiss();              
              let toast = this.msg.mostrarMsg('Bem vindo, '+this.conduzido.nome+'!', 3000);
              toast.onDidDismiss(() => {
                this.navCtrl.setRoot('HomePage');
              });
            }
          ).catch(error=>{
              this.loading.dismiss();
              this.msg.mostrarErro('Erro registrando: ' + error);
          });
        }
      );
    } catch (error) {
      this.msg.mostrarErro(error);
    }
  }
  

}
