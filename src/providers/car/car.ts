import { Injectable } from '@angular/core';
import {Observable} from 'rxjs/Rx';
import 'rxjs/add/operator/map';

import {SimulateProvider} from '../simulate/simulate';


@Injectable()
export class CarProvider {

  constructor(private simulate: SimulateProvider) {
  }

  getCars(lat, lng) {
    return Observable
      .interval(2000)
      .switchMap(()=> {return this.simulate.getCars(lat, lng);})
      .share();
  }
  
  pollForRiderPickup() {
    return this.simulate.riderPickedUp();
  }
  
  pollForRiderDropoff() {
    return this.simulate.riderDroppedOff();
  }

  dropoffCar(pickupLocation, dropoffLocation) {
    return this.simulate.dropoffPickupCar(pickupLocation, dropoffLocation);
  }
  
  getPickupCar() {
    return this.simulate.getPickupCar();
  }
  
  findPickupCar(pickupLocation) {
    return this.simulate.findPickupCar(pickupLocation);
  }

}
