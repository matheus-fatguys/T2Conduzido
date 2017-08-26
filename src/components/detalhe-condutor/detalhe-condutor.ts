import { Validators } from '@angular/forms';
import { FormGroup } from '@angular/forms';
import { FormBuilder } from '@angular/forms';
import { Condutor } from './../../models/condutor';
import { Component, Input, ChangeDetectorRef, EventEmitter, Output, OnDestroy } from '@angular/core';
import { Observable } from "rxjs";


@Component({
  selector: 'detalhe-condutor',
  templateUrl: 'detalhe-condutor.html'
})
export class DetalheCondutorComponent implements OnDestroy{

  @Input() condutor= {} as Condutor;
  @Output()
  onChangeCondutorValido = new EventEmitter<any>();  
  public form:FormGroup;
  private subscription;

  

  constructor(public formBuilder: FormBuilder) {
      
      
      this.form = formBuilder.group({
                    nome: ['', Validators.compose([Validators.required, Validators.minLength(3)])],
                    telefone: ['', Validators.compose([Validators.required, Validators.minLength(10), Validators.pattern('^[(][0-9]{2}[)][\\\s]?[0-9]{4,5}[-][0-9]{4}$')])],
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
    this.onChangeCondutorValido.next(this.form.valid);
  }


  ngOnDestroy(){
    this.subscription.unsubscribe();
  }


}
