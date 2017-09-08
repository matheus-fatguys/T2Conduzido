import { DadosUsuarioProvider } from './../providers/dados-usuario/dados-usuario';
import { Conduzido } from './../models/conduzido';
import { User } from 'firebase/app';
import { Observable, Subscription } from 'rxjs';
import { OfflinePage } from './../pages/offline/offline';
import { MensagemProvider } from './../providers/mensagem/mensagem';
import { AudioProvider } from './../providers/audio/audio';
import { FatguysUberProvider } from './../providers/fatguys-uber/fatguys-uber';
import { AngularFireAuth } from 'angularfire2/auth';
import { Component, ViewChild } from '@angular/core';
import { Platform, Loading } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { Nav, ModalController, LoadingController } from "ionic-angular";
import { Veiculo } from "../models/veiculo";


@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  @ViewChild(Nav) nav: Nav;

  rootPage:any;

  pages: Array<{title: string, component: any, icon:string}>;
  

  constructor(platform: Platform, 
    statusBar: StatusBar, 
    private splashScreen: SplashScreen,
    public afAuth: AngularFireAuth,
    public fatguysService: FatguysUberProvider,
    public msg: MensagemProvider,
    public modalCtrl: ModalController,
    public audio:AudioProvider,
    public loadingCtrl: LoadingController,
  private dadosUsuario: DadosUsuarioProvider) {
      
      this.iniciarAplicacao();
      platform.ready().then(() => {
        console.log("plataforma pronta")
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      statusBar.styleDefault();
      // splashScreen.hide();
    });

    // used for an example of ngFor and navigation
    this.pages = [
      { title: 'Conduzido', component: 'ConduzidoPage', icon:'person' },
      { title: 'Condutor', component: 'CondutorPage', icon:'bus' },
      { title: 'Conduções', component: 'CadastroConducoesPage', icon:'git-network' },
      { title: 'Viagem', component: 'ViagemPage', icon:'map' },
      { title: 'Sair', component: 'LogoutPage', icon:'log-out' }
    ];
  }

  

  openPage(page) {
    // Reset the content nav to have just this page
    // we wouldn't want the back button to show in this scenario
    this.nav.setRoot(page.component);
  }

  

  iniciarAplicacao(){
    this.dadosUsuario.iniciarMonitoramento().subscribe(
      pagina=>{
        this.nav.setRoot(pagina);
        // this.rootPage=pagina;
      }
    );
  }
}

