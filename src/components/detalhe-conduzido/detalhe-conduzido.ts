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
import { Component, Input, OnInit, OnChanges, SimpleChanges, AfterViewInit, EventEmitter, Output, OnDestroy } from '@angular/core';

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
  

  constructor(public formBuilder: FormBuilder) {   

    this.form = formBuilder.group({
        nome: ['', Validators.compose([Validators.required, Validators.minLength(3)])],
        telefone: ['', Validators.compose([Validators.required, Validators.minLength(10), Validators.pattern('^[(][0-9]{2}[)][\\\s]?[0-9]{4,5}[-][0-9]{4}$')])],
        chave: [''],
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

  validar(){
    this.onChangeConduzidoValido.next(this.form.valid);
  }


  ngOnDestroy(){
    this.subscription.unsubscribe();
  }

}
