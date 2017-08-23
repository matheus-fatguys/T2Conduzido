import { DetalheVeiculoComponent } from './../../components/detalhe-veiculo/detalhe-veiculo';
import { DetalheCondutorComponent } from './../../components/detalhe-condutor/detalhe-condutor';
import { Validators, FormGroup, FormBuilder } from '@angular/forms';
import { Veiculo } from './../../models/veiculo';
import { MensagemProvider } from './../../providers/mensagem/mensagem';
import { Usuario } from './../../models/usuario';
import { Condutor } from './../../models/condutor';
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
  private condutor= {} as Condutor;
  private loading:Loading ;  
  private condutorValido:boolean;
  @ViewChild(DetalheCondutorComponent)
  detalheCondutor : DetalheCondutorComponent;
  @ViewChild(DetalheVeiculoComponent)
  detalheVeiculo : DetalheVeiculoComponent;

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
      this.condutor.veiculo={} as Veiculo;
  }

  onChangeCondutorValido(){
    this.condutorValido=this.detalheCondutor.isValido()&&this.detalheVeiculo.isValido();
  }
  onChangeVeiculoValido(){
    this.onChangeCondutorValido();
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad RegistrarPage');
  }

  voltar(){
    this.navCtrl.setRoot('LoginPage');
  }

  async registrar(){
    try {
      
      if(this.loading==null){      
        this.loading = this.loadingCtrl.create({
              content: 'Registrando...'
            });
      }
      this.loading.present().then(
        _=>{          
          let resultado = this.fatguysService.registrarCondutor(this.condutor, this.usuario).then(
            ref => {
              this.loading.dismiss();
              let toast = this.msg.mostrarMsg('Bem vindo, '+this.condutor.nome+'!', 3000);
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
