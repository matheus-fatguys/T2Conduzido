import { Validators } from '@angular/forms';
import { FormBuilder } from '@angular/forms';
import { FormGroup, FormControl } from '@angular/forms';
import { Conducao } from './../../models/conducao';
import { ConducoesNaoAssociadasModalPage } from './../../pages/conducoes-nao-associadas-modal/conducoes-nao-associadas-modal';
import { MensagemProvider } from './../../providers/mensagem/mensagem';
import { Roteiro } from './../../models/roteiro';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { ModalController } from "ionic-angular";


@Component({
  selector: 'detalhe-roteiro',
  templateUrl: 'detalhe-roteiro.html'
})
export class DetalheRoteiroComponent{
  

  @Input() roteiro={} as Roteiro
  conducaoSelecionada:Conducao; 
  @Output()
  onChangeRoteiroValido = new EventEmitter<any>();  
  public form:FormGroup;
  private subscription;
  // conducoes; 

  constructor( 
    public modalCtrl: ModalController,
    public msg: MensagemProvider,
    public formBuilder: FormBuilder) {

      this.form = formBuilder.group({
                    nome: ['', Validators.compose([Validators.required, Validators.minLength(3)])],
                    hora: ['', Validators.compose([Validators.required, Validators.minLength(5), Validators.pattern('^[0-2][0-9][\\\:][0-5][0-9]$')])],
                    domingo: [false, ],
                    segunda: [true, ],
                    terca: [true, ],
                    quarta: [true, ],
                    quinta: [true, ],
                    sexta: [true, ],
                    sabado: [false, ],
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
 

  mostrarConducoesNaoAssociadas(){
    let modal = this.modalCtrl.create(ConducoesNaoAssociadasModalPage, {roteiro: this.roteiro});
    modal.onDidDismiss(data => {
      console.log(data);
      if(data!=null&&data.conducoes!=null){
        data.conducoes.forEach(c => {
          this.roteiro.conducoes.push(c);          
        });
        this.validar();
      }
    });
    modal.present();
  }

  onSelect(conducao){
    this.conducaoSelecionada=conducao;
    this.validar();
  }

  desassociarConducao(){
    this.roteiro.conducoes=this.roteiro.conducoes.filter(c=>{return c.id!=this.conducaoSelecionada.id});
  }

  isValido(){
    return this.form.valid
      &&this.roteiro.conducoes!=null
      &&this.roteiro.conducoes.length>0;
  }

  validar(){
    this.onChangeRoteiroValido.next(this.form.valid
      &&this.roteiro.conducoes!=null
      &&this.roteiro.conducoes.length>0
    );
  }


  ngOnDestroy(){
    this.subscription.unsubscribe();
  }

}


