import { AlertService } from './alert.service';
import { GlobalService } from './global.service';
import { Observable } from 'rxjs/Observable';
import { HttpService } from './http.service';
import { BLE } from '@ionic-native/ble';
import { Injectable } from '@angular/core';
import { LocalNotifications } from '@ionic-native/local-notifications';
const signal = -59;

@Injectable()
export class BTService {
    public devices: any = {};
    public mapping: Array<string> = [];
    public connectedMapping: Array<string> = [];
    constructor(
        private ble: BLE,
        private http: HttpService,
        private gs: GlobalService,
        private alert: AlertService,
        private localNotifications: LocalNotifications
    ) {

    }

    measureDistance(rssi) {
        console.log('measureDistance called', rssi);

        if (rssi == 0) {
            return -1.0;
        }

        let r = rssi * 1.0 / signal;
        if (r < 1.0) {
            // console.log('calculated!', r, Math.pow(r, 10));
            // let distance = Math.pow(r, 10)
            let distance = Math.pow(r, 10) / 2
            return distance.toFixed(2);
        } else {
            // console.log('calculated!', r, (0.89976) * Math.pow(r, 7.7095) + 0.111);
            // let distance = (0.89976) * Math.pow(r, 7.7095) + 0.111;
            let distance = (0.89976) * Math.pow(r, 7.7095) / 2 + 0.111;
            return distance.toFixed(2);
        }
    }

    searchDevices(myDevices) {
        console.log('searchDevices called', myDevices);
        let filter = [];
        // if (myDevices) filter = this.connectedMapping;
        return new Observable(observer => {

            this.ble.scan(filter, 2).subscribe((res) => {
                // console.log('DISKOVERY', res);
                console.log('1 er');
                res = this.processDevice(res, myDevices);
                console.log('2 er');
                this.mapping = this.mapping.sort((a, b) => this.sort(a, b));
                this.connectedMapping = this.connectedMapping.sort((a, b) => this.sort(a, b));

                console.log('Mapping after sort', this.mapping);
                observer.next({ devices: this.devices, mapping: this.mapping, connectedMapping: this.connectedMapping });
            }, err => {
                observer.error(err);
            }, () => {
                observer.next({ devices: this.devices, mapping: this.mapping });
            })
        })

    }

    processDevice(res, myDevices) {
        console.log('processDevice called', res, myDevices);
        res['distance'] = this.measureDistance(res['rssi']);
        if (res['rssi'] != 127 || res['rssi'] == 127 && this.devices[res['id']]) {
            if (res['rssi'] != 127) {
                if (myDevices && res['timestamp'] && Date.now() - res['timestamp'] > 10000) {
                    this.alert.outOfRange(this.devices[res['id']]);
                    this.localNotifications.schedule({
                            id: 1,
                            text: 'Device out of range!',
                            sound: 'file://sound.mp3'
                        });
                } else res['timestamp'] = Date.now()
                if (this.connectedMapping.indexOf(res['id']) != -1) {
                    if (res['distance'] > 5) {
                        if (!res['outOfRange']) {
                            this.alert.outOfRange(res);
                            this.localNotifications.schedule({
                                id: 1,
                                text: 'Device out of range!',
                                sound: 'file://sound.mp3'
                            });
                        }
                        res['outOfRange'] = true;

                    } else if (Date.now() - res['timestamp'] <= 10000) {
                        res['outOfRange = false']
                    }
                }
                this.devices[res['id']] = res;
            }
            if (this.mapping.indexOf(res['id']) == -1 && this.connectedMapping.indexOf(res['id']) == -1) {
                this.mapping.push(res['id']);
            }
        }
        return res;
    }

    mockDevices(myDevices) {
        console.log('mockDevices called', myDevices);
        let rssi = -60;
        this.devices['TEST_DEVICE'] = {
            id: 'TEST_DEVICE',
            name: 'Test Device',
            rssi: rssi,
            distance: this.measureDistance(rssi)
        };
        rssi = -40;
        this.devices['TEST_DEVICE_1'] = {
            id: 'TEST_DEVICE_1',
            name: 'Test Device 1',
            rssi: rssi,
            distance: this.measureDistance(rssi)
        };
        rssi = -55;
        this.devices['TEST_DEVICE_2'] = {
            id: 'TEST_DEVICE_2',
            name: 'Test Device 2',
            rssi: rssi,
            distance: this.measureDistance(rssi)
        };

        this.mapping = ['TEST_DEVICE', 'TEST_DEVICE_1', 'TEST_DEVICE_2'];
        this.mapping.forEach((id: any) => {
            this.devices[id] = this.processDevice(this.devices[id], true);
        })
        this.mapping.sort((a, b) => this.sort(a, b))
        return new Observable(observer => {
            observer.next({
                devices: this.devices,
                mapping: this.mapping
            })
        })
    }

    sort(a, b, backwards = false) {
        if (this.devices[a].distance < this.devices[b].distance)
            if (backwards)
                return 1;
            else return -1;
        if (this.devices[a].distance > this.devices[b].distance)
            if (backwards)
                return -1;
            else return 1;
        return 0;
    }

    showMyDevices() {
        console.log('showMyDevices called');
        return new Observable(observer => {
            this.http.get('devices/list').subscribe((res: any) => {
                console.log('showMyDevices', res);
                res.forEach((device, index) => {
                    console.log('forEach my devices', device);
                    // if(this.devices[device['id']]) online.push(device['id']);
                    if (!this.devices[device['id']] && device['id']) {
                        device['offline'] = true;
                        device['distance'] = 1337;
                        this.devices[device['id']] = device;
                        this.connectedMapping.push(device['id']);

                    } else {
                        this.moveDeviceToConnected(device);

                    }
                })
                this.connectedMapping = this.connectedMapping.sort((a, b) => this.sort(a, b));
                observer.next({ devices: this.devices, connectedMapping: this.connectedMapping });
                console.log(this.mapping, this.connectedMapping);
            })
        })
    }

    connectBLE(id) {
        this.ble.connect(id).subscribe(res => {
            console.log('connect successful!', res);
        }, err => {
            console.log('error connecting to device', err);
        })
    }

    connectDevice(device) {
        console.log('connectDevice called', device);
        return new Observable(observer => {
            this.connectBLE(device['id']);
            this.http.post('devices/add', device).subscribe((res: any) => {
                if (this.connectedMapping.indexOf(device['id']) == -1) {
                    this.connectedMapping.push(device['id']);
                }
                if (this.mapping.indexOf(device['id']) != -1) this.mapping.splice(this.mapping.indexOf(device['id']), 1);
                observer.next({ devices: this.devices, connectedMapping: this.connectedMapping, mapping: this.mapping })
            })
        })
    }

    moveDeviceToConnected(device) {
        console.log('moveDeviceToConnected called', device);
        if (this.connectedMapping.indexOf(device['id']) == -1) {
            this.connectedMapping.push(device['id']);
        }
        if (this.mapping.indexOf(device['id']) != -1) this.mapping.splice(this.mapping.indexOf(device['id']), 1);
    }

    disconnectDevice(device_id) {
        return this.http.post('devices/delete', { device_id: device_id }).map((res: any) => {
            res = res.json();
            console.log('my delete', res);
            return res;

        })
    }

    maintainConnection() {

    }
}