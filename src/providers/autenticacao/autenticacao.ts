import { AngularFireAuth } from 'angularfire2/auth';
import { Usuario } from './../../models/usuario';
import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';
import { User } from "firebase/app";


@Injectable()
export class AutenticacaoProvider {

 
  constructor(public http: Http,
  private afAuth: AngularFireAuth) {    
  }

  registrarUsuario(usuario: Usuario){
    return this.afAuth.auth.createUserWithEmailAndPassword(usuario.email, usuario.senha);
  }

  logar(usuario: Usuario){
      return this.afAuth.auth.signInWithEmailAndPassword(usuario.email, usuario.senha);
  }
  
  logout(){
    return this.afAuth.auth.signOut();
  }

  usuarioLogado(): User{
    return this.afAuth.auth.currentUser;
  }

}
