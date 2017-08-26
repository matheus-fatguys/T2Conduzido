import { Component } from '@angular/core';

/**
 * Generated class for the MenuLateralComponent component.
 *
 * See https://angular.io/docs/ts/latest/api/core/index/ComponentMetadata-class.html
 * for more info on Angular Components.
 */
@Component({
  selector: 'menu-lateral',
  templateUrl: 'menu-lateral.html'
})
export class MenuLateralComponent {

  text: string;

  constructor() {
    console.log('Hello MenuLateralComponent Component');
    this.text = 'Hello World';
  }

}
