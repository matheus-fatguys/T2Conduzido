import { Component, OnInit, Input } from '@angular/core';
import { Geolocation } from '@ionic-native/geolocation';
import { Platform, LoadingController } from 'ionic-angular';
import {Observable} from 'rxjs';
import {AvailableCarsComponent} from '../available-cars/available-cars';


/**
 * Generated class for the MapComponent component.
 *
 * See https://angular.io/docs/ts/latest/api/core/index/ComponentMetadata-class.html
 * for more info on Angular Components.
 */
@Component({
  selector: 'map',
  templateUrl: 'map.html'
})
export class MapComponent implements OnInit {

  @Input() isPickupRequested: boolean;
  public map: google.maps.Map;
  public isMapIdle: boolean;
  public currentLocation: google.maps.LatLng;
  @Input() destination: string;

  constructor(private geolocation: Geolocation, private platform : Platform, public loadingCtrl: LoadingController) {
    
  }

  ngOnInit() {
    this.map = this.createMap();  

    this.addMapEventListeners();

    this.platform.ready().then(
      a=>{
        this.geolocation.getCurrentPosition().then(resp=>{
          
          let location = new google.maps.LatLng(resp.coords.latitude, resp.coords.longitude);          
          
          this.getCurrentLocation().subscribe(location => {
            this.centerLocation(location);
          });
          
        }).catch(err=>{
          console.log('Geolocation err: ' + err);
        });
      }
    );
  }
  
  updatePickupLocation(location) {
    this.currentLocation = location;
    this.centerLocation(location);
  }

  addMapEventListeners() {
    
    google.maps.event.addListener(this.map, 'dragstart', () => {
      this.isMapIdle = false;
    })
    google.maps.event.addListener(this.map, 'idle', () => {
      this.isMapIdle = true;
    })
    
  }

  createMap(location = new google.maps.LatLng(-12.9648806,-38.4747462)) {
    let mapOptions = {
      center: location,
      zoom: 15,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      disableDefaultUI: true
    }
    
    let mapEl = document.getElementById('map');
    let map = new google.maps.Map(mapEl, mapOptions);
    
    return map;
  }

  centerLocation(location) {
    
    if (location) {
      this.map.panTo(location);
    }
    else {
      
      this.getCurrentLocation().subscribe(currentLocation => {
        this.map.panTo(currentLocation);
      });
    }
  }

  getCurrentLocation(): Observable<google.maps.LatLng> {
    
    let loading = this.loadingCtrl.create({
      content: 'Obtendo localização...'
    });
    
    loading.present(loading);
    
    let options = {timeout: 10000, enableHighAccuracy: true};
    
    let locationObs = Observable.create(observable => {
      
      this.geolocation.getCurrentPosition(options)
        .then(resp => {
          let lat = resp.coords.latitude;
          let lng = resp.coords.longitude;
          
          let location = new google.maps.LatLng(lat, lng);
          let currentLocation = location;
          console.log('Geolocation: ' + location);
          
          observable.next(location);
          
          loading.dismiss();
        },
        (err) => {
          console.log('Geolocation err: ' + err);
          loading.dismiss();
        })

    })
    
    return locationObs;
  }

}
