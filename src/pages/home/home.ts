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
  
      // this.isPickupRequested = false;
      // this.isRiderPickedUp = false;
      // this.timeTillArrival = 5;
      // this.pickupSubscription = this.pickupPubSub.watch().subscribe(e => {
      //   this.processPickupSubscription(e);
      // })
  }

  // processPickupSubscription(e) {
  //   switch(e.event) {
  //     case this.pickupPubSub.EVENTS.ARRIVAL_TIME:
  //       this.updateArrivalTime(e.data);
  //       break;
  //     case this.pickupPubSub.EVENTS.PICKUP:
  //       this.riderPickedUp();
  //       break;
  //     case this.pickupPubSub.EVENTS.DROPOFF:
  //       this.riderDroppedOff();
  //       break;
  //   }
  // }
  
  // setDestination(destination) {
  //   this.destination = destination;
  // }
  
  // riderPickedUp() {
  //   this.isRiderPickedUp = true;
  // }
  
  // rateDriver() {
  //   let prompt = this.alertCtrl.create({
  //     title: 'Classifique o condutor',
  //     message: 'Selecione uma classificação',
  //     inputs: [{
  //       type: 'radio',
  //       label: 'Ótimo',
  //       value: 'perfect',
  //       checked: true
  //     },
  //     {
  //       type: 'radio',
  //       label: 'Regular',
  //       value: 'okay'
  //     },
  //     {
  //       type: 'radio',
  //       label: 'Ruim',
  //       value: 'horrible'
  //     }],
  //     buttons: [{
  //       text: 'Submit',
  //       handler: rating => {
  //         // TODO: send rating to server
  //         console.log(rating);
  //       }
  //     }]
  //   });
    
  //   prompt.present(prompt);
  // }

  // riderDroppedOff() {
	// this.rateDriver();
  //   this.isRiderPickedUp = false;
  //   this.isPickupRequested = false;
  //   this.destination = null;
  //   this.timeTillArrival = 5;
  // }

  // updateArrivalTime(seconds) {
  //   let minutes = Math.floor(seconds/60);
  //   this.timeTillArrival = minutes;
  // }

  // confirmPickup() {
  //   this.isPickupRequested = true;
  // }

  // cancelPickup() {
  //   this.isPickupRequested = false;
  // }

}
