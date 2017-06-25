import { Geolocation, Geoposition } from '@ionic-native/geolocation';
import { Observable } from 'rxjs/Observable';
import { GlobalService } from './global.service';
import { Injectable } from '@angular/core';
const POSITION_OPTIONS: PositionOptions = {};
@Injectable()
export class GeolocationService {
    private subscription;
    private coords: Coordinates;
    constructor(
        private geolocation: Geolocation,
        private gs: GlobalService
    ) {

    }

    public watch(): void {
        this.subscription = this.geolocation.watchPosition(POSITION_OPTIONS).subscribe((position: Geoposition) => {
            this.coords = position.coords;
        }, err => {
            this.gs.simpleAlert('Could not get your current location. Please turn on GPS in your phone settings to be able to track devices locations.', 'GPS Error')
        })
    }

    public getCurrentPosition(): Coordinates {
        if (!this.coords) throw new Error('Coordinates are not set.');
        return this.coords;
    }

    public forceGetCurrentPosition(): Observable<Coordinates> {
        return new Observable(observer => {
            this.geolocation.getCurrentPosition().then((position: Position) => {
                observer.next(position.coords)
            }).catch(err => {
                observer.error(err);
            })
        })
    }




}