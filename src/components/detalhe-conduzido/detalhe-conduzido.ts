import { Validators } from '@angular/forms';
import { FormBuilder } from '@angular/forms';
import { FormGroup } from '@angular/forms';
import { AngularFireDatabase } from 'angularfire2/database';
import { FirebaseListObservable } from 'angularfire2/database';
import { MensagemProvider } from './../../providers/mensagem/mensagem';
import { Observable } from 'rxjs';
import { FatguysUberProvider } from './../../providers/fatguys-uber/fatguys-uber';
import { Chave } from './../../models/chave';
import { Conduzido } from './../../models/conduzido';
import { Component, Input, OnInit, SimpleChanges, AfterViewInit, EventEmitter, Output, OnDestroy } from '@angular/core';

@Component({
  selector: 'detalhe-conduzido',
  templateUrl: 'detalhe-conduzido.html'
})
export class DetalheConduzidoComponent  implements OnDestroy{  

  @Input() conduzido= {} as Conduzido;
  @Input() chave= {} as Chave;
  @Output()
  onChangeConduzidoValido = new EventEmitter<any>();  
  public form:FormGroup;
  private subscription;
  

  constructor(public formBuilder: FormBuilder,
              public fatguys: FatguysUberProvider,
            public msg: MensagemProvider) {   

    this.form = formBuilder.group({
        nome: ['', Validators.compose([Validators.required, Validators.minLength(3)])],
        telefone: ['', Validators.compose([Validators.required, Validators.minLength(10), Validators.pattern('^[(][0-9]{2}[)][\\\s]?[0-9]{4,5}[-][0-9]{4}$')])],
        chave: ['', Validators.compose([Validators.required, Validators.minLength(4), Validators.pattern('^[0-9]{4}$')])]
    });
    this.subscription = this.form.valueChanges
      .debounceTime(500)
      .distinctUntilChanged()
      .subscribe(
        s=>{
          this.validar()
        }
      );
  }

    isValido(){
    return this.form.valid;
  }

  obterConduzido(){

    if(this.conduzido!=null&&this.conduzido.id!=null){
      return;
    }    

    if(this.chave.chave==null){
      return;
    }    
    if(this.chave.chave.length<4){
      return;
    }
    let ref = this.fatguys.obterConduzidoPelaChave(this.chave.chave);
    let sub = ref.subscribe(
      c=>{
        sub.unsubscribe();
        if(c[0]==null){
          this.msg.mostrarMsg("Essa chave não está associada a usuário algum");
        }
        else{
          let subConduzido = this.fatguys.obterConduzido(c[0].conduzido).subscribe(
            cond=>{
              subConduzido.unsubscribe();
              this.fatguys.conduzido=cond[0];
              this.conduzido=this.fatguys.conduzido
            }
          );
        }
      }
    );
  }

  validar(){
    this.obterConduzido();
    this.onChangeConduzidoValido.next(this.form.valid);
  }


  ngOnDestroy(){
    this.subscription.unsubscribe();
  }

}
