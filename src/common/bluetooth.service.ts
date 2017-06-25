import { deviceMETA } from './bluetooth.service';
import { GeolocationService } from './geolocations.service';
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
    alerted?: boolean,
    distance?: number | string,
    rangeCondition?: number,
    updated?: number
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
const SIGNAL = -59;

//how much time we do wait before alerting if lost connection to device
const POSSIBLE_TIMEOUT = 5000;

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
    public deviceScanned: EventEmitter<device>;

    private devices: { [key: string]: BTDevice } = {};
    private myDevices: { [key: string]: BTDevice } = {};
    private devices_meta: { [key: string]: deviceMETA } = {};
    private myDevices_meta: { [key: string]: deviceMETA } = {};
    private mapping: Array<string> = [];
    private connectedMapping: Array<string> = [];

    constructor(
        private ble: BLE,
        private http: HttpService,
        private gs: GlobalService,
        private alert: AlertService,
        private geo: GeolocationService
    ) {
        this.deviceScanned = new EventEmitter<device>();
    }

    ngOnInit() { }

    //setters
    public setType(device_id, type): Observable<device> {
        return new Observable(observer => {
            this.myDevices_meta[device_id].type = type;
            let _device: device = this.processDevice(this.myDevices[device_id]);
            observer.next(_device);
        })
    }
    //end setters


    //measurements and helpers
    private rangeCondition(type, value): number {
        for (let i = 0; i <= 5; i++) {
            if (value >= RANGE[type][i][0] && value < RANGE[type][i][1]) {
                return i;
            }
        }
    }


    private measureDistance(rssi: number): string | number {
        if (rssi == 0) {
            return -1.0;
        }

        let r = rssi * 1.0 / SIGNAL;
        if (r < 1.0) {
            let distance = Math.pow(r, 10) / 4
            return distance.toFixed(2);
        } else {
            let distance = (0.89976) * Math.pow(r, 7.7095) / 4 + 0.111;
            return distance.toFixed(2);
        }
    }

    private sort(a, b, backwards = false): number {
        if (this.myDevices_meta[a].distance < this.myDevices_meta[b].distance)
            if (backwards)
                return 1;
            else return -1;
        if (this.myDevices_meta[a].distance > this.myDevices_meta[b].distance)
            if (backwards)
                return -1;
            else return 1;
        return 0;
    }

    public connectDevice(device: BTDevice): Observable<any> {
        return new Observable(observer => {
            this.http.post('devices/add', {device:device, device_meta: this.getMeta(device)}).subscribe(() => {
                if (this.connectedMapping.indexOf(device.id) >= 0) observer.error('Trying to connect device which is already on the list.');
                if (this.mapping.indexOf(device.id) == -1) observer.error('Could not find device, please try again.');

                this.mapping.splice(this.mapping.indexOf(device.id), 1);
                delete this.devices[device.id];

                this.connectedMapping.push(device.id);
                this.myDevices[device.id] = device;
 
                let _device: device = this.processDevice(device);

                this.myDevices[device.id] = _device.bt;
                this.myDevices_meta[device.id] = _device.meta;

                observer.next();
            }, err => observer.error(err));
        })
    }

    public getMeta(device: BTDevice): deviceMETA {
        let meta: deviceMETA = {
            id: device.id
        }
        if (!meta.type) meta.type = 'pocket';
        meta.distance = this.measureDistance(device.rssi);
        meta.rangeCondition = this.rangeCondition(meta.type, meta.distance);

        return meta;
    }



    private processDevice(device: BTDevice): device {
        //console.log('processDevice called', res, myDevices);
        let _device: device = {
            bt: device,
            meta: {
                id: device.id
            }
        }

        if (!this.myDevices[device.id]) {
            console.error('Trying to process device which is not on the connected list!');
            return;
        }

        //small hack because of iOS bug showing rssi 127 for no reason. whenever we get that, just ignoring and not updating range.
        if (device.rssi != 127) {
            _device.meta = this.getMeta(device);
            if (_device.meta.distance > RANGE[_device.meta.type][0][0]) {
                if (this.geo.getCurrentPosition() !)
                    _device.meta.gps = this.geo.getCurrentPosition();
                _device.meta.offline = true;
                _device.meta.alerted = true;
                this.http.post('device/lost', { device: _device }).subscribe(res => {
                    console.log('device lost successfully sent');
                }, err => {
                    console.error('device lost error', err);
                })
                this.alert.outOfRange(_device);
            } else {
                if (_device.meta['timestamp'] && ((Date.now() - _device.meta['timestamp']) > POSSIBLE_TIMEOUT)) {
                    this.alert.lostConnection(_device);
                } else _device.meta['timestamp'] = Date.now();
            }
        }



        return _device;
    }
    //end measurements and helpers



    //onetime methods
    public init(): Observable<any> {
        return new Observable(observer => {
            this.getData().subscribe(res => {
                this.initScan();
                observer.next(res);
            }, err => {
                observer.error(err);
            })
        })

    }

    private getData(): Observable<MyDevicesScan> {
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
            console.log('WHAT WE HAVE GOT' + JSON.stringify(data));
            let result: MyDevicesScan = {
                devices: this.myDevices,
                devices_meta: this.myDevices_meta,
                mapping: this.connectedMapping
            }
            return result;
        })
    }

    private initScan(filter: Array<string> = this.connectedMapping) {
        this.ble.startScan(filter).subscribe((device: BTDevice) => {
            this.deviceScanned.emit(this.processDevice(device));
        }, err => {
            console.error('error scanning', err);
        })
    }


    public stopscan() {
        this.ble.stopScan();
    }
    //end onetime methods
 
    //emitters and subscribables
    public scanAllDevices(): Observable<BTScan> {
        return new Observable(observer => {
            this.ble.scan([], 2).subscribe((device: BTDevice) => {
                // this.mapping = this.mapping.sort((a, b) => this.sort(a, b));
                // this.updatedMETA.emit(this.devices);
                this.devices[device.id] = device;
                if (this.mapping.indexOf(device.id) == -1 && this.connectedMapping.indexOf(device.id) == -1) this.mapping.push(device.id);
                let _device: BTScan = {
                    devices_bt: this.devices,
                    mapping: this.mapping
                }
                observer.next(_device);
            }, err => {
                observer.error(err);
            })
        })
    }

    public getMyDevices(): MyDevicesScan {
        return {
            devices: this.myDevices,
            devices_meta: this.myDevices_meta,
            mapping: this.connectedMapping
        };
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


    //end subscribables

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



    // showMyDevices() {

    //     //console.log('showMyDevices called');
    //     return new Observable(observer => {
    //         this.http.get('devices/list').subscribe((res: any) => {
    //             //console.log('showMyDevices', res);
    //             res.forEach((device, index) => {
    //                 //console.log('forEach my devices', device);
    //                 // if(this.devices[device['id']]) online.push(device['id']);
    //                 if (!this.devices[device['id']] && device['id']) {
    //                     device['offline'] = true;
    //                     device['distance'] = 1337;
    //                     this.devices[device['id']] = device;
    //                     this.connectedMapping.push(device['id']);

    //                 } else {
    //                     this.moveDeviceToConnected(device);

    //                 }
    //             })

    //             // this.connectedMapping = this.connectedMapping.sort((a, b) => this.sort(a, b));

    //             observer.next({ devices: this.devices, connectedMapping: this.connectedMapping });
    //             //console.log(this.mapping, this.connectedMapping);
    //         })
    //     })
    // }

    connectBLE(id) {
        // this.ble.connect(id).subscribe(res => {
        //     //console.log('connect successful!', res);
        // }, err => {
        //     //console.log('error connecting to device', err);
        // })
    }

    // connectDevice(device) {
    //     //console.log('connectDevice called', device);
    //     return new Observable(observer => {
    //         this.connectBLE(device['id']);
    //         this.http.post('devices/add', device).subscribe((res: any) => {
    //             if (this.connectedMapping.indexOf(device['id']) == -1) {
    //                 this.connectedMapping.push(device['id']);
    //             }
    //             if (this.mapping.indexOf(device['id']) != -1) this.mapping.splice(this.mapping.indexOf(device['id']), 1);
    //             observer.next({ devices: this.devices, connectedMapping: this.connectedMapping, mapping: this.mapping })
    //         })
    //     })
    // }

    // moveDeviceToConnected(device) {
    //     //console.log('moveDeviceToConnected called', device);
    //     if (this.connectedMapping.indexOf(device['id']) == -1) {
    //         this.connectedMapping.push(device['id']);
    //     }
    //     if (this.mapping.indexOf(device['id']) != -1) this.mapping.splice(this.mapping.indexOf(device['id']), 1);
    // }

    // disconnectDevice(device_id) {
    //     return this.http.post('devices/delete', { device_id: device_id }).map((res: any) => {
    //         res = res.json();
    //         //console.log('my delete', res);
    //         return res;

    //     })
    // }

    // maintainConnection() {

    // }
}