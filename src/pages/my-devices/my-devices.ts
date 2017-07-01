import { SafeHeavenPage } from './../safe-heaven/safe-heaven';
import { NgZone } from '@angular/core';
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
    private checkInProgress: boolean = false;
    constructor(
        private bt: BTService,
        private gs: GlobalService,
        private nav: NavController,
        private zone: NgZone
    ) { }

    ngOnInit() {
        this.getInfo();
        // console.log('ngOnInit myDEVICES');
        this.bt.init().subscribe(res => {
            this.devices = res.devices;
            // console.log('res devices_meta' + JSON.stringify(res.devices_meta));
            this.devices_meta = res.devices_meta;
            this.mapping = res.mapping;
            console.log('RESULTS FROM INIT', this.devices, this.devices_meta, this.mapping);
            // console.log('bt.init subscribe called' + JSON.stringiy(res));
        }, err => {
            console.error('error bt init', err);
        });
        this.bt.deviceScanned.subscribe((device: device) => {
            // console.log('deviceScanned here' + JSON.stringify(device.bt) + " ||| " + JSON.stringify(device.meta)); 
            this.devices[device.bt.id] = device.bt;
            // console.log('wtf is undefined?? ' + JSON.stringify(this.devices_meta) + ' ||| ' + JSON.stringify(device.meta));
            this.devices_meta[device.meta.id] = device.meta;
        })
    }

    checkDevices() {
        this.checkInProgress = true;
        this.bt.checkDevices().subscribe(res => {
            console.log('res checkDevices', res);
            if (res.device) {
                let _device: device = res.device;
                this.devices[_device.bt.id] = _device.bt;
                this.devices_meta[_device.bt.id] = _device.meta;
            }
            this.zone.run(() => {
                this.checkInProgress = !res.done;
            })
        }, err => {
            console.error('err checkDevices,', err)
        })
    }


    getInfo() {
        // let res = this.bt.getMyDevices();
        this.bt.stopscan();
        this.bt.init().subscribe(res => {
            this.devices = res.devices;
            // console.log('res devices_meta' + JSON.stringify(res.devices_meta));
            this.devices_meta = res.devices_meta;
            this.mapping = res.mapping;
            console.log('RESULTS FROM INIT', this.devices, this.devices_meta, this.mapping);
            // console.log('bt.init subscribe called' + JSON.stringiy(res));
        }, err => {
            console.error('error bt init', err);
        });
        // this.devices = res.devices;
        // this.devices_meta = res.devices_meta;
        // this.mapping = res.mapping;
        // console.log('got info!', JSON.stringify(res));
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
        this.nav.push(DevicePage, { device: _device });
    }

    goSafeHeaven() {
        this.nav.push(SafeHeavenPage);
    }
}