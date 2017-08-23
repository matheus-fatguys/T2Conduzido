import { Component, Input, OnInit, OnChanges } from '@angular/core';

import { CarProvider } from '../../providers/car/car';

import {PickupPubSubProvider} from '../../providers/pickup-pub-sub/pickup-pub-sub';
import * as SlidingMarker from 'marker-animate-unobtrusive';

@Component({
  selector: 'pickup-car',
  templateUrl: 'pickup-car.html'
})
export class PickupCarComponent implements OnInit, OnChanges {

	@Input() map: google.maps.Map;
  @Input() isPickupRequested: boolean;
  @Input() pickupLocation: google.maps.LatLng;
  @Input() destination: string;
  public pickupCarMarker: any;
  public polylinePath: google.maps.Polyline;

  constructor(public carService: CarProvider,
    private pickupPubSub: PickupPubSubProvider) {
  }
  
  ngOnInit() {
    
  }
  
  ngOnChanges() {
    
    if (this.destination) {
      this.dropoffCar();
    }
    else {
      if (this.isPickupRequested) {
        this.requestCar();
      }
      else {
        this.removeCar();
        this.removeDirections();
      }
    }
    
  }
  
  addCarMarker(position) {
    this.pickupCarMarker = new SlidingMarker({
      map: this.map,
      position: position,
      icon: 'img/car-icon.png'
    });
    
    this.pickupCarMarker.setDuration(1000);
    this.pickupCarMarker.setEasing('linear');
  }
  
  showDirections(path) {
    this.polylinePath = new google.maps.Polyline({
      path: path,
      strokeColor: '#FF0000',
      strokeWeight: 3
    });
    this.polylinePath.setMap(this.map);
  }
  
  updateCar(cbDone) {
    
    this.carService.getPickupCar().subscribe(car => {
      if(!this.pickupCarMarker) return;
      if(!car){
			return;
	  }
      // animate car to next point
      this.pickupCarMarker.setPosition(car.position);
      // set direction path for car
      this.polylinePath.setPath(car.path);
      // update arrival time
      this.pickupPubSub.emitArrivalTime(car.time);
      
      // keep updating car 
      if (car.path.length > 1) {
        setTimeout(() => {
          this.updateCar(cbDone);
        }, 100);
      }else {
        // car arrived
        cbDone();
      } 
    });
  }
  
   checkForRiderPickup() {
    this.carService.pollForRiderPickup().subscribe(data => {
      this.pickupPubSub.emitPickUp();
    })
  }

  checkForRiderDropoff() {
    this.carService.pollForRiderDropoff().subscribe(data => {
      this.pickupPubSub.emitDropOff();
    })
  }
  
  requestCar() {
		console.log('request car ' + this.pickupLocation);
		this.carService.findPickupCar(this.pickupLocation)
		  .subscribe(car => {
			// show car marker
			this.addCarMarker(car.position);
			// show car path/directions to you
			this.showDirections(car.path);
			// keep updating car
			this.updateCar(()=> this.checkForRiderPickup());
		  })
  }

  dropoffCar() {
    this.carService.dropoffCar(this.pickupLocation, this.destination)
      .subscribe( car => {
        // keep updating car
        this.updateCar( ()=> this.checkForRiderDropoff() );
      })
  }
    
  removeDirections() {
    if (this.polylinePath) {
      this.polylinePath.setMap(null);
      this.polylinePath = null;
    }
  }
	
	removeCar() {
    if (this.pickupCarMarker) {
      this.pickupCarMarker.setMap(null);
      this.pickupCarMarker = null;
    }
  }

}
