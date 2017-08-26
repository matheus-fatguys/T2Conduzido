import { AngularFireOfflineModule } from 'angularfire2-offline';
import { OfflinePageModule } from './../pages/offline/offline.module';
import { ConducaoPageModule } from './../pages/conducao/conducao.module';
import { MapaPopOverComponent } from './../components/mapa-pop-over/mapa-pop-over';
import { NativeAudio } from '@ionic-native/native-audio';
// import { TextMaskModule } from 'angular2-text-mask';

import { firebaseConfig } from './firebase-config';
import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { HttpModule } from '@angular/http';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { AngularFireDatabaseModule } from 'angularfire2/database';
import { AngularFireModule } from 'angularfire2';
import {AngularFireAuthModule} from 'angularfire2/auth';
import { ConducoesNaoAssociadasModalPageModule } from './../pages/conducoes-nao-associadas-modal/conducoes-nao-associadas-modal.module';
import { FormsModule } from "@angular/forms";
import { ConducoesNaoAssociadasModalPage } from './../pages/conducoes-nao-associadas-modal/conducoes-nao-associadas-modal';

import { MyApp } from './app.component';


import {Geolocation} from '@ionic-native/geolocation';
import { BackgroundGeolocation } from '@ionic-native/background-geolocation';
import { CarProvider } from '../providers/car/car';
import { FatguysUberProvider } from '../providers/fatguys-uber/fatguys-uber';
import { SimulateProvider } from '../providers/simulate/simulate';
import { PickupPubSubProvider } from '../providers/pickup-pub-sub/pickup-pub-sub';
import { MensagemProvider } from '../providers/mensagem/mensagem';
import { AutenticacaoProvider } from '../providers/autenticacao/autenticacao';
import { TrajetoProvider } from '../providers/trajeto/trajeto';
import { LocalizacaoProvider } from '../providers/localizacao/localizacao';
import { AudioProvider } from '../providers/audio/audio';


@NgModule({
  declarations: [
    MyApp,
  ],
  imports: [
    ConducoesNaoAssociadasModalPageModule,
    ConducaoPageModule,
    OfflinePageModule,
    BrowserModule,
    HttpModule,
    AngularFireDatabaseModule,
    AngularFireAuthModule,
    AngularFireOfflineModule,
    FormsModule,   
    // TextMaskModule, 
    AngularFireModule.initializeApp(firebaseConfig),
    IonicModule.forRoot(MyApp)
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp
  ],
  providers: [
    StatusBar,
    SplashScreen,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    Geolocation,    
    BackgroundGeolocation,
    CarProvider,
    SimulateProvider,
    PickupPubSubProvider,
    FatguysUberProvider,
    MensagemProvider,
    AutenticacaoProvider,
    TrajetoProvider,
    LocalizacaoProvider,
    NativeAudio,
    AudioProvider
  ]
})
export class AppModule {}
