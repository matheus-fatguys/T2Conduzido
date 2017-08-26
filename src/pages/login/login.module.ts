import { DirectivesModule } from './../../directives/directives.module';
import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { LoginPage } from './login';

@NgModule({
  declarations: [
    LoginPage,
  ],
  imports: [
    DirectivesModule,
    IonicPageModule.forChild(LoginPage),
  ],
})
export class LoginPageModule {}
