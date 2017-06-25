import { deviceMETA } from './bluetooth.service';
import { AlertService } from './alert.service';
import { GlobalService } from './global.service';
import { Observable } from 'rxjs/Observable';
import { HttpService } from './http.service';
import { BLE } from '@ionic-native/ble';
import { Injectable, EventEmitter, OnInit } from '@angular/core';
import { LocalNotifications } from '@ionic-native/local-notifications';


export interface BTDevice {
    name: string,
    id: string,
    advertising: Array<any>,
    rssi: number,
    services: Array<any>,
    characteristics: Array<any>
}

export interface deviceMETA {
    id: string,
    type?: string,
    gps?: Coordinates,
    offline?: boolean,
    alerted?: boolean
    distance?: number | string
}

export interface device {
    bt: BTDevice,
    meta: deviceMETA
}

export interface BTScan {
    devices_bt: {
        [key: string]: BTDevice
    }
    mapping: Array<string>
}

export interface MyDevicesScan {
    devices: {
        [key: string]: BTDevice
    },
    devices_meta: {
        [key: string]: deviceMETA
    },
    mapping: Array<string>
}

export interface MyDeviceScan {
    device?: device
    mapping?: Array<string>
}

//approx const in range measurement formula
const signal = -59;

//const in alert/range status monitoring, where 0 is alert range and array is [min, max] in meters for status
const RANGE = {
    pocket: {
        0: [
            5.5, 133333337
        ],
        1: [
            4.5, 5.5
        ],
        2: [
            3.5, 4.5
        ],
        3: [
            2.5, 3.5
        ],
        4: [
            1.5, 2.5
        ],
        5: [
            0, 1.5
        ]
    },
    bag: {
        0: [
            20, 13333337
        ],
        1: [
            12, 20
        ],
        2: [
            8, 12
        ],
        3: [
            5, 8
        ],
        4: [
            3, 5
        ],
        5: [
            0, 3
        ]
    },
    house: {
        0: [
            50, 13333337
        ],
        1: [
            35, 50
        ],
        2: [
            20, 35
        ],
        3: [
            15, 20
        ],
        4: [
            10, 15
        ],
        5: [
            0, 10
        ]
    }
}
@Injectable()
export class BTService implements OnInit {
    public devices: { [key: string]: BTDevice } = {};
    public myDevices: { [key: string]: BTDevice } = {};
    public devices_meta: { [key: string]: deviceMETA } = {};
    public myDevices_meta: { [key: string]: deviceMETA } = {};
    public mapping: Array<string> = [];
    public connectedMapping: Array<string> = [];
    public updatedMETA: EventEmitter<any>;
    private range: number = 5;
    constructor(
        private ble: BLE,
        private http: HttpService,
        private gs: GlobalService,
        private alert: AlertService
    ) {
        this.updatedMETA = new EventEmitter();
    }

    ngOnInit() {}

    //setters
    public setType(device_id, type): void {
        this.devices[device_id]['range_type'] = type;
        // this.searchDevices(false);
    }
    //end setters


    //measurements
    public rangeCondition(type, value): number {
        for (let i = 0; i <= 5; i++) {
            if (value >= RANGE[type][i][0] && value < RANGE[type][i][1]) {
                return i;
            }
        }
    }
    //end measurements

    public measureDistance(rssi: number): string | number {
        if (rssi == 0) {
            return -1.0;
        }

        let r = rssi * 1.0 / signal;
        if (r < 1.0) {
            let distance = Math.pow(r, 10) / 4
            return distance.toFixed(2);
        } else {
            let distance = (0.89976) * Math.pow(r, 7.7095) / 4 + 0.111;
            return distance.toFixed(2);
        }
    }

    public init(): Observable<any> {
        return new Observable(observer => {
            this.getData().subscribe(res => {
                this.initScan();
                observer.next();
            }, err => {
                observer.error(err);
            })
        })

    }

    public getData(): Observable<MyDeviceScan> {
        return Observable.forkJoin([
            this.http.get('devices/list'),
            this.http.get('devices/META')
        ]).map((data: [[BTDevice], [deviceMETA]]) => {
            data[0].forEach((device: BTDevice) => {
                this.myDevices[device.id] = device;
                this.connectedMapping.push(device.id);
            })
            data[1].forEach((meta: deviceMETA) => {
                this.myDevices_meta[meta.id] = meta;
            })
            let result: MyDevicesScan = {
                devices: this.myDevices,
                devices_meta: this.myDevices_meta,
                mapping: this.connectedMapping
            }
            return result;
        })
    }

    public initScan(filter: Array<string> = this.connectedMapping) {
        this.ble.startScan(filter).subscribe((device: BTDevice) => {
            let _device: device = {
                bt: device,
                meta: this.processDevice(device)
            }
        }, err => {
            console.error('error scanning', err);
        })
    }

    public stopscan() {
        this.ble.stopScan();
    }

    public scanAllDevices(): Observable<BTScan> {
        return new Observable(observer => {
            this.ble.scan([], 2).subscribe((res: BTDevice) => {
                this.mapping = this.mapping.sort((a, b) => this.sort(a, b));
                this.updatedMETA.emit(this.devices);
                let result: BTScan = {
                    devices_bt: this.devices,
                    mapping: this.mapping
                }
                observer.next(result);
            }, err => {
                observer.error(err);
            })
        })
    }

    // public scanMyDevices(): Observable<MyDeiceScan> {


        //     .subscribe((connectedDevices: Array<string>) => {
        //         this.connectedMapping = connectedDevices;
        //     }, err => observer.next(err));

        //     this.ble.scan([], 2).subscribe((res: BTDevice) => {
        //         this.mapping = this.mapping.sort((a, b) => this.sort(a, b));
        //         this.updatedMETA.emit(this.devices);
        //         let result: BTScan = {
        //             devices_bt: this.devices,
        //             mapping: this.mapping
        //         }
        //         observer.next(result);
        //     }, err => {
        //         observer.error(err);
        //     })
        // })
    // }

    processDevice(res) {
        //console.log('processDevice called', res, myDevices);
        res['distance'] = this.measureDistance(res['rssi']);
        if (!this.devices[res['id']] || (this.devices[res['id']] && !this.devices[res['id']]['type'])) res['type'] = 'pocket';
        else res['type'] = this.devices[res['id']]['type'];
        res['rangeCondition'] = this.rangeCondition(res['type'], res['distance']);
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
                    if (res['distance'] > this.range) {
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
                        res['outOfRange'] = false;
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

    // mockDevices(myDevices) {
    //     //console.log('mockDevices called', myDevices);
    //     let rssi = -60;
    //     this.devices['TEST_DEVICE'] = {
    //         id: 'TEST_DEVICE',
    //         name: 'Test Device',
    //         rssi: rssi,
    //         distance: this.measureDistance(rssi)
    //     };
    //     rssi = -40;
    //     this.devices['TEST_DEVICE_1'] = {
    //         id: 'TEST_DEVICE_1',
    //         name: 'Test Device 1',
    //         rssi: rssi,
    //         distance: this.measureDistance(rssi)
    //     };
    //     rssi = -55;
    //     this.devices['TEST_DEVICE_2'] = {
    //         id: 'TEST_DEVICE_2',
    //         name: 'Test Device 2',
    //         rssi: rssi,
    //         distance: this.measureDistance(rssi)
    //     };

    //     this.mapping = ['TEST_DEVICE', 'TEST_DEVICE_1', 'TEST_DEVICE_2'];
    //     this.mapping.forEach((id: any) => {
    //         this.devices[id] = this.processDevice(this.devices[id], true);
    //     })
    //     this.mapping.sort((a, b) => this.sort(a, b))
    //     return new Observable(observer => {
    //         observer.next({
    //             devices: this.devices,
    //             mapping: this.mapping
    //         })
    //     })
    // }

    private sort(a, b, backwards = false): number {
        if (this.devices_meta[a].distance < this.devices_meta[b].distance)
            if (backwards)
                return 1;
            else return -1;
        if (this.devices_meta[a].distance > this.devices_meta[b].distance)
            if (backwards)
                return -1;
            else return 1;
        return 0;
    }

    showMyDevices() {

        //console.log('showMyDevices called');
        return new Observable(observer => {
            this.http.get('devices/list').subscribe((res: any) => {
                //console.log('showMyDevices', res);
                res.forEach((device, index) => {
                    //console.log('forEach my devices', device);
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
                //console.log(this.mapping, this.connectedMapping);
            })
        })
    }

    connectBLE(id) {
        // this.ble.connect(id).subscribe(res => {
        //     //console.log('connect successful!', res);
        // }, err => {
        //     //console.log('error connecting to device', err);
        // })
    }

    connectDevice(device) {
        //console.log('connectDevice called', device);
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
        //console.log('moveDeviceToConnected called', device);
        if (this.connectedMapping.indexOf(device['id']) == -1) {
            this.connectedMapping.push(device['id']);
        }
        if (this.mapping.indexOf(device['id']) != -1) this.mapping.splice(this.mapping.indexOf(device['id']), 1);
    }

    disconnectDevice(device_id) {
        return this.http.post('devices/delete', { device_id: device_id }).map((res: any) => {
            res = res.json();
            //console.log('my delete', res);
            return res;

        })
    }

    maintainConnection() {

    }
}