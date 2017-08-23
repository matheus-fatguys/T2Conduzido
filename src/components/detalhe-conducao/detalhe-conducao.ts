import { Validators } from '@angular/forms';
import { FormBuilder } from '@angular/forms';
import { FormGroup } from '@angular/forms';
import { FatguysUberProvider } from './../../providers/fatguys-uber/fatguys-uber';
import { MensagemProvider } from './../../providers/mensagem/mensagem';
import { Conducao } from './../../models/conducao';
import { Conduzido } from './../../models/conduzido';
import { Component, Input, EventEmitter, Output } from '@angular/core';


@Component({
  selector: 'detalhe-conducao',
  templateUrl: 'detalhe-conducao.html'
})
export class DetalheConducaoComponent {

  @Input() conducao= {} as Conducao;  
  @Output()
  onChangeConducaoValida = new EventEmitter<any>();  
  public form:FormGroup;
  private subscription;

  private rotuloOrigem="Origem:";
  private rotuloDestino="Destino:";

  conduzidos;


  constructor(public fatguys: FatguysUberProvider,
    public msg: MensagemProvider,
    public formBuilder: FormBuilder) {    
      
      this.form = formBuilder.group({
                    conduzido: ['', Validators.compose([Validators.required])],
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

  ngOnInit(): void {
    let ref=this.fatguys.obterCondutorPeloUsuarioLogado();
    if(ref!=null){
      let sub = ref.subscribe(
        conds=>{
          this.conduzidos=this.fatguys.obterConduzidos(conds[0]);
        }
      );
    }    
  }

  conduzidoSelecionado(idConduzido){
    this.conducao.conduzido=idConduzido;
  }

  onEnderecoOrigemSelecionado($event){
    this.conducao.origem=$event;
    this.validar();
  }

  onEnderecoDestinoSelecionado($event){
    this.conducao.destino=$event;
    this.validar();
  }

  isValida(){
    return this.form.valid
            &&this.conducao.origem!=null
            &&this.conducao.destino!=null;
  }

  validar(){
    this.onChangeConducaoValida.next(this.form.valid
            &&this.conducao.origem!=null
            &&this.conducao.destino!=null
          );
  }


  ngOnDestroy(){
    this.subscription.unsubscribe();
  }

}
