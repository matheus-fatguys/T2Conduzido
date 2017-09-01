import { Component } from '@angular/core';
import { NavController, AlertController, IonicPage } from 'ionic-angular';

import {PickupPubSubProvider} from '../../providers/pickup-pub-sub/pickup-pub-sub';

@IonicPage()
@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  public isPickupRequested: boolean;
  public isRiderPickedUp: boolean;
  public destination: string;
  public pickupSubscription: any;
  public timeTillArrival: number;

  constructor(public navCtrl: NavController,
              private pickupPubSub: PickupPubSubProvider,
			  private alertCtrl: AlertController ) {
  }
  ionViewDidLoad() {
    console.log('ionViewDidLoad HomePage');
  }

  
}
