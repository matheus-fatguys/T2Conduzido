import { ToastController } from 'ionic-angular';
import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';


@Injectable()
export class MensagemProvider {

  constructor(public http: Http, 
    private toastCtrl: ToastController) {
  }

  mostrarMsg(msg, tempo?:number){
    let toast = this.toastCtrl.create({
                  message: msg,
                  duration: tempo?tempo:null,
                  position: 'top',
                  showCloseButton:tempo?false:true
                });          
    toast.present();  
    return toast; 
  }
  mostrarErro(error, tempo?:number){
    console.error(error);
    var msg="";
    try {
      msg=error.message?error.message:error;      
    } catch (error) {
      msg=error.msg?error.msg:error;      
    }
      let toast = this.toastCtrl.create({
                  message: msg,
                  duration: tempo?tempo:null,
                  position: 'top',
                  showCloseButton: tempo?false:true
                });
      toast.present();
      return toast;
  }

}
