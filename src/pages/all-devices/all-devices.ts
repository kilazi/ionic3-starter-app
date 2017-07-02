import { NavController } from 'ionic-angular';
import { GlobalService } from './../../common/global.service';
import { Component, OnInit } from '@angular/core';
@Component({
    selector: 'all-devices',
    templateUrl: './all-devices.html'
})
export class AllDevicesPage implements OnInit {
    constructor(
        private gs: GlobalService,
        private nav: NavController
    ) { }

    ngOnInit() {
    }


}