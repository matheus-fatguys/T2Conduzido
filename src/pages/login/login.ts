import { AutenticacaoProvider } from './../../providers/autenticacao/autenticacao';
import { MensagemProvider } from './../../providers/mensagem/mensagem';
import { FatguysUberProvider } from './../../providers/fatguys-uber/fatguys-uber';
import { Usuario } from './../../models/usuario';
import { Component, OnInit } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController, Loading } from 'ionic-angular';
import { Validators, FormBuilder } from "@angular/forms";
import { FormGroup } from "@angular/forms";


@IonicPage()
@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
})
export class LoginPage implements OnInit{
  ngOnInit(): void {
    // if(this.auth.usuarioLogado()){
    //   this.navCtrl.setRoot('HomePage');
    // }
  }

  private usuario= {} as Usuario;
  private loginForm:FormGroup;
  private loading:Loading ;

  constructor(public navCtrl: NavController, 
    public navParams: NavParams, 
    private fatguysService: FatguysUberProvider,
    private auth : AutenticacaoProvider,
    private msg : MensagemProvider,
    public formBuilder: FormBuilder,
    public loadingCtrl: LoadingController) {
      this.loginForm = formBuilder.group({
        email: ['', Validators.required],
        senha: ['', Validators.compose([Validators.required, Validators.minLength(6)])]
    });
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad LoginPage');
  }

  

  async login(){
    try {
      if(this.loginForm.invalid){
        this.msg.mostrarErro("Verifique o preenchimmento dos campos");
        return;
      }
      this.loading = this.loadingCtrl.create({
            content: 'Logando...'
          });
      this.loading.present().then(
        _=>{
          this.auth.logar(this.usuario)
          .then(
            res=>{          
                this.loading.dismiss();
          }).catch(error => {
            this.loading.dismiss();
            this.msg.mostrarErro('Falha no login: '+error);
          });
        }
      );
    } catch (error) {
      console.error(error);
      this.msg.mostrarErro('Falha no login: '+error);
    }
  }

  registrar(){
    this.navCtrl.push("RegistrarPage");
  }

}
