import { DevicePage } from './../device/device';
import { AllDevicesPage } from './../all-devices/all-devices';
import { NavController } from 'ionic-angular';
import { GlobalService } from './../../common/global.service';
import { BTService, BTDevice, deviceMETA, device } from './../../common/bluetooth.service';
import { Component, OnInit } from '@angular/core';
@Component({
    selector: 'my-devices',
    templateUrl: './my-devices.html'
})
export class MyDevicesPage implements OnInit {
    private devices: { [key: string]: BTDevice } = {};
    private devices_meta: { [key: string]: deviceMETA } = {};
    private mapping: Array<string> = [];
    constructor(
        private bt: BTService,
        private gs: GlobalService,
        private nav: NavController
    ) { }

    ngOnInit() {
        this.getInfo();
        this.bt.init().subscribe(res => {
            this.devices = res.devices;
            this.devices_meta = res.devices_meta;
            this.mapping = res.mapping;
            console.log('bt.init subscribe called');
        }, err => {
            console.error('error bt init', err);
        });
        this.bt.deviceScanned.subscribe((device: device) => {
            this.devices[device.bt.id] = device.bt;
            this.devices_meta[device.bt.id] = device.meta;
        })
    }


    getInfo() {
        let res = this.bt.getMyDevices();
        this.devices = res.devices;
        this.devices_meta = res.devices_meta;
        this.mapping = res.mapping;
        console.log('got info!', JSON.stringify(res));
    }

    update() {
        this.getInfo();
    }

    addDevice() {
        this.nav.push(AllDevicesPage); 
    }

    open(id) {
        console.log('open', id);
        let _device: device = {
            bt: this.devices[id],
            meta: this.devices_meta[id]
        };
        this.nav.push(DevicePage, _device);
    }
}