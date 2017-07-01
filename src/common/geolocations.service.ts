import { Geolocation, Geoposition } from '@ionic-native/geolocation';
import { Observable } from 'rxjs/Observable';
import { GlobalService } from './global.service';
import { Injectable } from '@angular/core';
const POSITION_OPTIONS: PositionOptions = {};
@Injectable()
// scans and returns GPS
export class GeolocationService {
    private subscription;
    private coords: google.maps.LatLng;
    constructor(
        private geolocation: Geolocation,
        private gs: GlobalService
    ) {

    }

    public watch(): void {
        this.subscription = this.geolocation.watchPosition(POSITION_OPTIONS).subscribe((position: Geoposition) => {
            let latLng: google.maps.LatLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude)
            this.coords = latLng;
        }, err => {
            this.gs.simpleAlert('Could not get your current location. Please turn on GPS in your phone settings to be able to track devices locations.', 'GPS Error')
        })
    }

    public getCurrentPosition(): google.maps.LatLng {
        if (!this.coords) {
            console.error('Coordinates are not set.');            
        }
        return this.coords;
    }

    public forceGetCurrentPosition(): Observable<google.maps.LatLng> {
        return new Observable(observer => {
            this.geolocation.getCurrentPosition().then((position: Position) => {
                let latLng: google.maps.LatLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
                observer.next(latLng);
            }).catch(err => {
                observer.error(err);
            })
        })
    }




}