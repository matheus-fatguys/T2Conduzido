import { Component } from '@angular/core';

/**
 * Generated class for the SimpleComponent component.
 *
 * See https://angular.io/docs/ts/latest/api/core/index/ComponentMetadata-class.html
 * for more info on Angular Components.
 */
@Component({
  selector: 'simple',
  templateUrl: 'simple.html'
})
export class SimpleComponent {

  text: string;

  constructor() {
    console.log('Hello SimpleComponent Component');
    this.text = 'Simple works l ljlkjlk  hiuhk kkb!';
  }

}
