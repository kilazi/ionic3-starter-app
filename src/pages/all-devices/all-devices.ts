import { NavController } from 'ionic-angular';
import { GlobalService } from './../../common/global.service';
import { BTService, BTDevice } from './../../common/bluetooth.service';
import { Component, OnInit } from '@angular/core';
@Component({
    selector: 'all-devices',
    templateUrl: './all-devices.html'
})
export class AllDevicesPage implements OnInit {
    private devices: { [key: string]: BTDevice } = {};
    private mapping: Array<string> = [];
    constructor(
        private bt: BTService,
        private gs: GlobalService,
        private nav: NavController
    ) { }

    ngOnInit() {
        this.getInfo(); 
    }


    getInfo() {
        this.bt.scanAllDevices().subscribe(res => {
            console.log(res, 'scan res');
            this.devices = res.devices_bt;
            this.mapping = res.mapping;
        }, err => {
            console.error('error scanAllDevices', err);
        })
    }

    update() {
        this.getInfo();
    }

    connect(device) {
        this.gs.simplePrompt(() =>
            this.bt.connectDevice(device).subscribe(res => {
                this.nav.pop();
            })
        );
    }
}