/**
 * Diretiva de máscara genérica em campo de texto.
 *
 * @author Márcio Casale de Souza <contato@kazale.com>
 * @since 0.0.4
 */

import { Directive, HostListener, Input, forwardRef } from '@angular/core';
import { 
  NG_VALUE_ACCESSOR, ControlValueAccessor 
} from '@angular/forms';

@Directive({
  selector: '[mascara]',
  providers: [{
    provide: NG_VALUE_ACCESSOR, 
    useExisting: forwardRef(() => MascaraDirective), 
    multi: true 
  }]
})
export class MascaraDirective implements ControlValueAccessor {
  registerOnChange(fn: any): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }
  setDisabledState?(isDisabled: boolean): void {
    throw new Error("Method not implemented.");
  }

  onTouched: any;
  onChange: any;

  @Input('mascara') mascara: string;

  writeValue(value: any): void {
  }

  // registerOnChange(fn: any): void {
  //   this.onChange = fn;
  // }

  // registerOnTouched(fn: any): void {
  //   this.onTouched = fn;
  // }

  @HostListener('keyup', ['$event']) 
  onKeyup($event: any) {
    // this.aplicarMascaraApenasNumeros($event);  
    this.aplicarMascaraLetrasNumeros($event);  
  }

  aplicarMascaraLetrasNumeros($event){
    
    // retorna caso pressionado backspace
    if ($event.keyCode === 8) {
      // this.onChange(valor);
      return;
    }

    var valor ="";
    for (var i = 0; i < this.mascara.length; i++) {
      var m=this.mascara.charAt(i);
      var v=$event.target.value.charAt(i);
      var mp=this.mascara.charAt(i+1);
      var vp=$event.target.value.charAt(i+1);
      if(i<$event.target.value.length){
        if(m=='A'){
          if(v.match(/\W/)||v.match(/\d/)){
            valor+='_';
          }
          else{
            valor+=v;
          }
        }
        else if(m=='9'){
          if(v.match(/\D/)){
            valor+='_';
          }
          else{
            valor+=v;
          }
        }
        else {
          valor+=m;
          if(mp=='A'){
            if(v.match(/\w/)){
              valor+=v;
            }
          }
          else if(mp=='9'){
            if(v.match(/\d/)){
              valor+=v;
            }
          }
        }
      }
      // else{
      //   if(m!='A'&&m!='9'){
      //     valor+=m;
      //   }
      // }
    }

    if (valor.indexOf('_') > -1) {
      valor = valor.substr(0, valor.indexOf('_'));
    }

    $event.target.value = valor;
  }

  aplicarMascaraApenasNumeros($event){
    var valor = $event.target.value.replace(/\D/g, '');
    var pad = this.mascara.replace(/\D/g, '').replace(/9/g, '_');
    var valorMask = valor + pad.substring(0, pad.length - valor.length);

    // retorna caso pressionado backspace
    if ($event.keyCode === 8) {
      // this.onChange(valor);
      return;
    }

    if (valor.length <= pad.length) {
      // this.onChange(valor);
    }

    var valorMaskPos = 0;
    valor = '';
    for (var i = 0; i < this.mascara.length; i++) {
      if (isNaN(parseInt(this.mascara.charAt(i)))) {
        valor += this.mascara.charAt(i);
      } else {
        valor += valorMask[valorMaskPos++];
      }
    }
    
    if (valor.indexOf('_') > -1) {
      valor = valor.substr(0, valor.indexOf('_'));
    }

    $event.target.value = valor;
  }

  @HostListener('blur', ['$event']) 
  onBlur($event: any) {
    if ($event.target.value.length === this.mascara.length) {
      return;
    }
    // this.onChange('');
    $event.target.value = '';
  }
}