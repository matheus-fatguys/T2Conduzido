import { FatguysUberProvider } from './../fatguys-uber/fatguys-uber';
import { Platform, AlertController } from 'ionic-angular';
import { Injectable } from '@angular/core';

declare var FCMPlugin:IFCMPlugin;
@Injectable()
export class NotificacaoProvider {
  
  constructor(public platform: Platform,
              public alertCtrl: AlertController,
              public fatguys: FatguysUberProvider
            ) {
  }

  iniciarNotificacoes(){
    this.platform.ready().then(() => {

      if(typeof(FCMPlugin) !== "undefined"){

        FCMPlugin.subscribeToTopic('condutores_'+this.fatguys.condutor.id);
        // ,
        //   success=>this.showAlert("subscribeToTopic [condutores_"+this.fatguys.condutor.id+"]: "+success),
        //   error=> this.showAlert("subscribeToTopic error: \n"+JSON.stringify(error)));

        // FCMPlugin.onTokenRefresh(token=>{
        //   this.showAlert("onTokenRefresh\nToken: " + token);
        // });

        FCMPlugin.getToken(token=>{
          try {
            // this.showAlert("getToken Token: \n" + token);
            this.saveDeviceToken(token);            
          } catch (error) {
            this.showAlert("getToken error:\n"+JSON.stringify(error))
          }
          // this.msg.mostrarMsg("getToken\nToken: " + token);
        }, error=>{
          console.error("getToken error:\n"+JSON.stringify(error));
        });
        

        FCMPlugin.onNotification(d=>{
          if(d.wasTapped){  
            this.showAlert('onNotification BACKGROUND:\n'+JSON.stringify(d));
          } else {
            this.showAlert('onNotification FOREGROUND:\n'+JSON.stringify(d));
          }
        }, sucess=>{
          // this.showAlert("onNotification sucess:\n"+sucess);
          console.log(sucess);
        }, error=>{
          // this.showAlert("onNotification error:\n"+JSON.stringify(error));
          console.error(error);
        });
      }
    });
  }

  showAlert(msg:string){
    console.log(msg);
    let confirm = this.alertCtrl.create({
      title: msg,
      message: "",
      buttons: [        
        {
          text: 'OK',
          handler: (opcoes) => {            
            
          }
        }
      ]
    });
    confirm.present();
  }

  saveDeviceToken(token:string){
    this.fatguys.atualizarTokenConduzido(token)
    // .then(_=>this.showAlert("succesfully saved token: "+token))
    // .catch(error=> this.showAlert("error saving token: "+token+"\n"+error));
  }

  
}
