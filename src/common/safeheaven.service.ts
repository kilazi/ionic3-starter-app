import { GlobalService } from './global.service';
import { HttpService } from './http.service';
import { GeolocationService } from './geolocations.service';
import { Observable } from 'rxjs/Observable';
import { Injectable } from '@angular/core';

export interface SafeHeaven {
    gps: google.maps.LatLng;
    name: string;
    radius: number;
    id?: string;
}

export interface Radius {
    name: string,
    value: number
}

export const RADIUSES: Array<Radius> = [{
    name: 'Apartment',
    value: 50
}, {
    name: 'House',
    value: 150
}, {
    name: 'Area',
    value: 500
}]

@Injectable()
//safeHeaven CRUD and watcher service
export class SafeHeavenService {
    constructor(
        private geo: GeolocationService,
        private http: HttpService,
        private gs: GlobalService
    ) {
        
    }

    public summon(name:string, radius: number): Observable<SafeHeaven> {
        return new Observable(observer => {            
            let data:SafeHeaven = {
                name: name,
                radius: radius,
                gps: this.geo.getCurrentPosition()
            }
            this.http.post('safeheaven/create', data).subscribe((res:any) => {
                data.id = res.id;
                observer.next(data);
            }, err => {
                observer.error(err);
            })
        })
    }

    public update(name: string, radius: number): Observable<SafeHeaven> {
        return new Observable(observer => {            
            let data:SafeHeaven = {
                name: name,
                radius: radius,
                gps: this.geo.getCurrentPosition()
            }
            this.http.put('safeheaven/update', data).subscribe((res:any) => {
                observer.next(data);
            }, err => {
                observer.error(err);
            })
        })
    }

    public getList(): Observable<Array<SafeHeaven>> {
        return new Observable(observer => {
            this.http.get('safeheaven/get').subscribe(res => {
                observer.next(res);
            }, err => {
                observer.next(err);
            })
        })
    }

    public dismiss(id: string): Observable<boolean> {
        let data = {id: id};
        return new Observable(observer => {     
            this.http.post('safeheaven/delete', data).subscribe((res:any) => {
                observer.next(true);
            }, err => {
                observer.error(err);
            })
        })
    }

}