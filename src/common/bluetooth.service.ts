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
    gps?: google.maps.LatLng,
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

const SECOND = 100000;

//how much time we do wait before alerting if lost connection to device (10 seconds)
const POSSIBLE_TIMEOUT = 5 * SECOND;

//const in alert/range status monitoring, where 0 is alert range and array is [min, max] in meters for status
export const RANGE = {
    pocket: {
        0: [
            3.5, 133333337
        ],
        1: [
            2.5, 3.5
        ],
        2: [
            1.5, 2.5
        ],
        3: [
            1.0, 1.5
        ],
        4: [
            0.5, 1.0
        ],
        5: [
            0, 0.5
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
//main service of the application, handles BT connection and main logic
export class BTService {
    public deviceScanned: EventEmitter<device>;

    //we have 4 objects containing info about devices around.
    //devices and myDevices -- are all devices around and mydevices around
    //object_meta contains META info about the device (which is stored in another DB table)
    //mapping arrays contain arrays of ids of those ^ objects; we could go object.keys every time but why overload resources
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

    //setters
    public setType(device_id: string, type: string): Observable<device> {
        return new Observable(observer => {
            this.myDevices_meta[device_id].type = type;
            console.log('set type', device_id, type);
            let _device: device = this.processDevice(this.myDevices[device_id]);
            this.updateDeviceHTTP(_device).subscribe(res => {
                console.log('updated device meta succesfully!');
            }, err => {
                console.error('error updating META', err);
            })
            if (_device)
                observer.next(_device);
        })
    }
    //end setters


    //measurements and helpers 

    //range + colors. temporary i suppose
    private rangeCondition(type, value): number {
        for (let i = 0; i <= 5; i++) {
            if (value >= RANGE[type][i][0] && value < RANGE[type][i][1]) {
                return i;
            }
        }
    }

    //main function to measure approx distance based on RSSI
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

    private sort(a, b, backwards = false): 0 | 1 | -1 {
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


    //connects device from all devices to my devices
    public connectDevice(device: BTDevice): Observable<any> {
        return new Observable(observer => {
            let meta: deviceMETA = {
                id: device.id
            }
            if (!meta.type) meta.type = 'pocket';
            meta.distance = this.measureDistance(device.rssi);
            meta.rangeCondition = this.rangeCondition(meta.type, meta.distance);

            this.http.post('devices/add', { device: device, device_meta: meta }).subscribe(() => {
                if (this.connectedMapping.indexOf(device.id) >= 0) observer.error('Trying to connect device which is already on the list.');
                if (this.mapping.indexOf(device.id) == -1) observer.error('Could not find device, please try again.');

                this.mapping.splice(this.mapping.indexOf(device.id), 1);
                delete this.devices[device.id];

                this.connectedMapping.push(device.id);
                this.myDevices[device.id] = device;

                let _device: device = this.processDevice(device);
                if (_device) {

                    this.myDevices[device.id] = _device.bt;
                    this.myDevices_meta[device.id] = _device.meta;

                    observer.next();
                }
            }, err => observer.error(err));
        })
    }


    //measures main META information about the device
    private getMeta(device: BTDevice): deviceMETA {
        let meta: deviceMETA = {
            id: device.id
        }
        if (!meta.type) meta.type = 'pocket';
        meta.distance = this.measureDistance(device.rssi);
        meta.rangeCondition = this.rangeCondition(meta.type, meta.distance);

        return meta;
    }

    //emergency scan. called to prove if device is really out of range and by user demand
    //take a lot of resources, but fast.
    public checkDevices(): Observable<any> {
        let done: boolean = false;
        let counter: number = 0;
        console.log('check Devices Initiated');
        return new Observable(observer => {
            setTimeout(() => {
                console.log('Restarting checkDevices, not done');
                if (!done) return this.checkDevices();
            }, 2)
            this.ble.scan([], 2).subscribe(device => {

                if (this.connectedMapping.indexOf(device.id) != -1) {
                    console.log('connected device found! ', device);
                    done = ++counter >= this.connectedMapping.length;
                    console.log('DONE: ', counter, this.connectedMapping.length);
                    let _device: device = this.processDevice(device);
                    console.log('checkDevices return', _device);
                    observer.next({ device: _device, done: done })
                }
                observer.next({ device: false, done: done });

            }, err => {
                console.log('checkDevicesFail', err);
            })
        })
    }


    //main method which processes the device found; contains logic if we should alert user or just set the data
    //TODO: refactor this method again, it needs to be perfect

    private updateDeviceHTTP(device): Observable<any> {
        return this.http.put('devices/meta', device.meta);
    }

    private processDevice(device: BTDevice): device {
        let meta = this.myDevices_meta[device.id];
        //console.log('processDevice called', res, myDevices);
        let _device: device = {
            bt: device,
            meta: meta
        }

        if (!this.myDevices[device.id]) {
            // console.error('Trying to process device which is not on the connected list!');
            return;
        }


        console.log('Starting device alert thing', _device);



        //small hack because of iOS bug showing rssi 127 for no reason. whenever we get that, just ignoring and not updating range.
        // https://github.com/SiliconLabs/thunderboard-ios/blob/master/ThunderBoard/BleManager.swift and many others
        if (device.rssi != 127) {
            // _device.meta = this.getMeta(device);
            // _device.meta = meta;
            if (!_device.meta) _device.meta = {
                id: device.id
            }
            if (!_device.meta.type) _device.meta.type = 'pocket';
            _device.meta.distance = this.measureDistance(device.rssi);
            _device.meta.rangeCondition = this.rangeCondition(meta.type, meta.distance);

            if (_device.meta.distance > RANGE[_device.meta.type][0][0]) {

                _device.meta.offline = true;
                console.log('meta?', _device.meta);
                if (!_device.meta.alerted) {
                    _device.meta.alerted = true;
                    // this.http.post('device/lost', { device: _device }).subscribe(res => {
                    //     console.log('device lost successfully sent');
                    // }, err => {
                    //     console.error('device lost error', err);
                    // })
                    console.log('outOfRANGE');
                    this.alert.outOfRange(_device);
                    this.updateDeviceHTTP(_device).subscribe(res => {
                        console.log('updated device meta succesfully!');
                    }, err => {
                        console.error('error updating META', err);
                    })
                }
            } else {
                if (!_device.meta.alerted && _device.meta.updated && ((Date.now() - _device.meta.updated) > POSSIBLE_TIMEOUT)) {
                    console.log('lostConnection', Date.now(), _device.meta.updated, Date.now() - _device.meta.updated, POSSIBLE_TIMEOUT, );
                    _device.meta.alerted = true;
                    this.alert.lostConnection(_device);
                    this.updateDeviceHTTP(_device).subscribe(res => {
                        console.log('updated device meta succesfully!');
                    }, err => {
                        console.error('error updating META', err);
                    })
                } else {
                    // console.log('set position?');
                    if (this.geo.getCurrentPosition()) {
                        // console.log('getCurrentPosition' + JSON.stringify(this.geo.getCurrentPosition()));
                        _device.meta.gps = this.geo.getCurrentPosition();
                    }
                    _device.meta.alerted = false;
                    _device.meta.updated = Date.now();
                }
            }
        }


        // console.log('processDevice done');
        return _device;
    }
    //end measurements and helpers



    //onetime methods

    //inits main on-call and background methods. returns all the data we've got from HTTP
    public init(): Observable<MyDevicesScan> {
        return new Observable(observer => {
            // console.log('BT init triggered');
            this.getData().subscribe(res => {
                this.initScan();
                // console.log('getData subscribe');
                observer.next(res);
            }, err => {
                // console.log('getData error');
                observer.error(err);
            })
        })

    }


    //gets myDevices list and their META. observable.merge doesnt work for some reason so had to put small hack
    private getData(): Observable<MyDevicesScan> {

        return new Observable(observer => {
            let done: number = 0;
            let data: any = {};

            this.http.get('devices/list').subscribe((devices: Array<BTDevice>) => {
                // console.log('got return from devices/list ' + JSON.stringify(devices));
                this.connectedMapping = [];
                devices.forEach((device: BTDevice) => {
                    console.log('devices FOR EACH');
                    this.myDevices[device.id] = device;
                    this.connectedMapping.push(device.id);
                })

                data['devices'] = this.myDevices;

                data['mapping'] = this.connectedMapping;

                if (++done == 2) observer.next(data);
            }, err => {
                observer.error(err);
            });

            this.http.get('devices/META').subscribe((devices: Array<deviceMETA>) => {
                devices.forEach((meta: deviceMETA) => {
                    this.myDevices_meta[meta.id] = meta;
                })
                // console.log('got meta, done = ' + done);
                data['devices_meta'] = this.myDevices_meta;
                if (++done == 2) observer.next(data);
            }, err => {
                observer.error(err);
            });

        })

        // return this.http.get('devices/list')
        // .merge(this.http.get('devices/META')).map((data: [[BTDevice], [deviceMETA]]) => {
        //     console.log('getData res', data);
        //     data[0].forEach((device: BTDevice) => {
        //         this.myDevices[device.id] = device;
        //         this.connectedMapping.push(device.id);
        //     }) 
        //     data[1].forEach((meta: deviceMETA) => {
        //         this.myDevices_meta[meta.id] = meta;
        //     }) 
        //     console.log('WHAT WE HAVE GOT' + JSON.stringify(data));
        //     let result: MyDevicesScan = {
        //         devices: this.myDevices,
        //         devices_meta: this.myDevices_meta,
        //         mapping: this.connectedMapping
        //     }
        //     return result;
        // })


        // return Observable.forkJoin([
        //     this.http.get('devices/list').map(res => res),
        //     this.http.get('devices/META').map(res => res)
        // ]).map((data: [[BTDevice], [deviceMETA]]) => {
        //     console.log('getData res', data);
        //     data[0].forEach((device: BTDevice) => {
        //         this.myDevices[device.id] = device;
        //         this.connectedMapping.push(device.id);
        //     }) 
        //     data[1].forEach((meta: deviceMETA) => {
        //         this.myDevices_meta[meta.id] = meta;
        //     }) 
        //     console.log('WHAT WE HAVE GOT' + JSON.stringify(data));
        //     let result: MyDevicesScan = {
        //         devices: this.myDevices,
        //         devices_meta: this.myDevices_meta,
        //         mapping: this.connectedMapping
        //     }
        //     return result;
        // })
    }


    //main background process which keeps on scanning devices
    private initScan(filter: Array<string> = this.connectedMapping) {
        console.log('INIT SCAN');
        this.ble.startScan([]).subscribe((device: BTDevice) => {
            // console.log('startScan hit ' + device.id);

            let _device = this.processDevice(device);
            if (_device) {
                this.myDevices[_device['id']] = _device.bt;
                this.myDevices_meta[_device['id']] = _device.meta;
                this.deviceScanned.emit(_device);
            }


        }, err => {
            console.error('error scanning', err);
        })
    }


    //method to ensure that device is offline whenever we lost connection, because BT is unstable
    private reScanDevice(id: string): Observable<boolean> {
        return new Observable(observer => {
            this.ble.isConnected(id).then(connected => {
                console.log('device is connected', id, connected);
                this.ble.scan([id], 1).subscribe(device => {
                    console.log('connected device scanned', device);
                })
            }, err => {
                console.error('lost connection to device', id, err)
            })
        })
    }

    // whenever we have a device connected, we want to stay it this way. 
    // but what if it does not appear on scan process because it went offline/out of range?
    // then we initiate this function which measures when exactly the device was last scanned and throws an alert if it exceedes timeout
    private checkConnected() {
        this.connectedMapping.forEach(device_id => {
            if (!this.devices_meta[device_id].updated || Date.now() - this.devices_meta[device_id].updated < POSSIBLE_TIMEOUT) {
                let _device = {
                    bt: this.devices[device_id],
                    meta: this.devices_meta[device_id]
                }
                // this.alert.lostConnection(_device);
            }
        })
    }


    //for DND mode
    public stopscan() {
        this.ble.stopScan();
    }
    //end onetime methods



    //emitters and subscribables

    //continuous scan itself
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


    // just a getter
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