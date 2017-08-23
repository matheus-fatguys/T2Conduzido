import { IonicModule } from 'ionic-angular';
import { NgModule } from '@angular/core';
import { MascaraDirective } from './mascara/mascara';
@NgModule({
	declarations: [MascaraDirective],
	imports: [IonicModule],
	exports: [MascaraDirective]
})
export class DirectivesModule {}
