import { FormGroup } from '@angular/forms';
import { Validators } from '@angular/forms';
import { FormBuilder } from '@angular/forms';
import { Veiculo } from './../../models/veiculo';
import { Component, Input, EventEmitter, Output } from '@angular/core';


@Component({
  selector: 'detalhe-veiculo',
  templateUrl: 'detalhe-veiculo.html'
})
export class DetalheVeiculoComponent {

  @Input() veiculo= {} as Veiculo;  
  @Output()
  onChangeVeiculoValido = new EventEmitter<any>();  
  public form:FormGroup;
  private subscription;

  constructor(public formBuilder: FormBuilder) {
    this.form = formBuilder.group({
                    marca: ['', Validators.compose([Validators.required, Validators.minLength(2)])],
                    modelo: ['', Validators.compose([Validators.required, Validators.minLength(2)])],
                    ano: ['', Validators.compose([Validators.required, Validators.minLength(4), Validators.pattern('^[1-2]{1}[0-9]{3}$')])],
                    placa: ['', Validators.compose([Validators.required, Validators.minLength(4), Validators.pattern('^[a-zA-Z]{3}[-][0-9]{4}$')])],
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
    this.onChangeVeiculoValido.next(this.form.valid);
  }


  ngOnDestroy(){
    this.subscription.unsubscribe();
  }

}
