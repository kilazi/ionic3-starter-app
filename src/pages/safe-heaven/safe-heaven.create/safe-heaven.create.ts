import { GeolocationService } from './../../../common/geolocations.service';
import { MapsModel } from './../../device/maps.model';
import { GoogleMap } from './../../../components/google-map/google-map';
import { GlobalService } from './../../../common/global.service';
import { NavController } from 'ionic-angular';
import { SafeHeavenService, RADIUSES, Radius } from './../../../common/safeheaven.service';
import { Component, OnInit, ViewChild } from '@angular/core';

@Component({
    selector: 'safe-heaven-create',
    templateUrl: './safe-heaven.create.html'
})
export class SafeHeavenCreatePage implements OnInit {
    private name: string = "";
    private radiuses: Array<Radius> = RADIUSES;
    private radius: number = 500;
    @ViewChild(GoogleMap) _GoogleMap: GoogleMap;
    private map_model: MapsModel = new MapsModel();

    constructor(
        private sh: SafeHeavenService,
        private nav: NavController,
        private gs: GlobalService,
        private geo: GeolocationService
    ) {

    }

    private setActive(radius: number): void {
        this.radius = radius;
    }

    private create(): void {
        this.sh.summon(this.name, this.radius).subscribe(res => {
            this.nav.pop();
            this.gs.updateView.emit();
        }, err => this.gs.simpleAlert('Server Error'));
    }

    ngOnInit() {
        this._GoogleMap.$mapReady.subscribe(map => {
            this.map_model.init(map);
            this.map_model.using_geolocation = true;
            console.log('current position: ', this.geo.getCurrentPosition());
            let location = this.geo.getCurrentPosition();
            this.map_model.map.setCenter(location);
            this.map_model.addPlaceToMap(location, '#111111');            
        });
    }
}