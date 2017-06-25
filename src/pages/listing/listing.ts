import { DevicePage } from './../device/device';
import { GlobalService } from './../../common/global.service';
import { BTService } from './../../common/bluetooth.service';
import { Component, OnInit } from '@angular/core';
import { NavController, LoadingController } from 'ionic-angular';

// import { FeedPage } from '../feed/feed';
import 'rxjs/Rx';

import { ListingModel } from './listing.model';

// import { BLE } from '@ionic-native/ble';

// import { IBeacon } from '@ionic-native/ibeacon';

const signal = -59;


@Component({
  selector: 'listing-page',
  templateUrl: 'listing.html',
})
export class ListingPage {
// implements OnInit {
  // listing: ListingModel = new ListingModel();
  // loading: any;

  // private devices: any = {};
  // private mapping: any = [];
  // private connectedMapping: any = [];

  // constructor(
  //   public nav: NavController,
  //   public loadingCtrl: LoadingController,
  //   private bluetoothService: BTService,
  //   private gs: GlobalService,
  //   // private ble: BLE,
  //   public bt: BTService
  // ) {
  //   this.gs.simpleLoading(true);
  // }

  // // measureDistance(rssi) {
  // //   console.log('measureDistance called', rssi);

  // //   if (rssi == 0) {
  // //     return -1.0;
  // //   }

  // //   let r = rssi * 1.0 / signal;
  // //   if (r < 1.0) {
  // //     console.log('calculated!', r, Math.pow(r, 10));
  // //     let distance = Math.pow(r, 10)
  // //     return distance.toFixed(2);
  // //   }
  // //   else {
  // //     console.log('calculated!', r, (0.89976) * Math.pow(r, 7.7095) + 0.111);
  // //     let distance = (0.89976) * Math.pow(r, 7.7095) + 0.111;
  // //     return distance.toFixed(2);
  // //   }
  // // }

  // // measureDistance2(freqInMHz) {
  // //   let exp = (27.55 - (20 * Math.log10(freqInMHz)) + Math.abs(signal)) / 20.0;
  // //   return Math.pow(10.0, exp);
  // // }

  // // measureDistance1(rssi) {
  // //   return Math.pow(10, (signal - rssi) / 20);
  // // }



  // startScanning(interval) {
  //   // this.loading.create();
  //   this.scan();
  //   setInterval(() => {
  //     this.scan();
  //   }, interval)
  // }

  // scan(myDevices = []) {
  //   if (this.gs.isCordova())
  //     this.bt.searchDevices([]).subscribe(res => {
  //       this.devices = res['devices'];
  //       this.mapping = res['mapping'];
  //       this.connectedMapping = res['connectedMapping'];
        
  //       // this.gs.simpleLoading(false);
  //     }, err => {
  //       // this.gs.simpleLoading(false);
  //       console.error('ERR', err);
  //     })
  //   else
  //     this.bt.mockDevices(myDevices).subscribe(res => {
  //       this.devices = res['devices'];
  //       this.mapping = res['mapping'];
  //       // this.gs.simpleLoading(false);
  //       console.log('mockDevices RES', this.devices, this.mapping, this.connectedMapping);
  //       // this.mapping = res['mapping'];
  //     }, err => {
  //       // this.gs.simpleLoading(false);
  //       console.error('ERR', err);
  //     })
  // }

  // connectDevice(device) { 
  //   console.log('connect device', device, this.mapping, this.connectedMapping);
  //   if (this.connectedMapping.indexOf(device['id']) == -1) {
  //     this.connectedMapping.push(device['id']);
  //   }
  //   if (this.mapping.indexOf(device['id']) != -1) this.mapping.splice(this.mapping.indexOf(device['id']), 1);
  //   // this.connectedMapping.push(device['id']);
  // }


  // ngOnInit() {
  //   // this.loading.present();
  //   // if (this.ble)
    
  //   console.log('heh');
  //   this.bt.showMyDevices().subscribe(res => {
  //     this.connectedMapping = res['connectedMapping'];
  //     this.devices = res['devices'];
  //     this.gs.simpleLoading(false);
  //     this.startScanning(4000);
      
  //     // offline.forEach(id=>this.connectDevice(id));
  //   }, err => {
  //     this.gs.simpleAlert(err, 'Error');
  //   })
  //   // this.ibeacon.requestAlwaysAuthorization();
  //   // let delegate = this.ibeacon.Delegate();


  //   // delegate.didRangeBeaconsInRegion()
  //   //   .subscribe(
  //   //   data => console.log('didRangeBeaconsInRegion: ', JSON.stringify(data)),
  //   //   error => console.error()
  //   //   );
  //   // delegate.didStartMonitoringForRegion()
  //   //   .subscribe(
  //   //   data => console.log('didStartMonitoringForRegion: ', JSON.stringify(data)),
  //   //   error => console.error()
  //   //   );
  //   // delegate.didEnterRegion()
  //   //   .subscribe(
  //   //   data => {
  //   //     console.log('didEnterRegion: ', JSON.stringify(data));
  //   //   }
  //   //   );

  //   // let beaconRegion = this.ibeacon.BeaconRegion('deskBeacon', 'F7826DA6-ASDF-ASDF-8024-BC5B71E0893E');

  //   // this.ibeacon.startMonitoringForRegion(beaconRegion)
  //   //   .then(
  //   //   () => console.log('Native layer recieved the request to monitoring'),
  //   //   error => console.error('Native layer failed to begin monitoring: ', JSON.stringify(error))
  //   //   );
  // }

  // goToDevice(device) {
  //   this.nav.push(DevicePage, {
  //     device: device
  //   })
  // }

  // connect(device) {
  //   // this.ble.connect(device['id']).subscribe(res => {
  //   //   console.log('CONNECT RES', JSON.stringify(res))
  //   // }, err => {
  //   //   console.log('CONNECT FAIOL', err);
  //   // })
  //   this.gs.simplePrompt(() => {
  //     this.bt.connectDevice(device).subscribe(res => {
  //       this.devices = res['devices'];
  //       this.mapping = res['mapping'];
  //       this.connectedMapping = res['connectedMapping'];
  //       // this.gs.simpleLoading(false);
  //     }, err => {
  //       // this.gs.simpleLoading(false);
  //       console.error('ERR', err);
  //     })
  //   })
    
  // }

}
