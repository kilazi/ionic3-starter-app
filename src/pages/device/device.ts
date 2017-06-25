import { BTService } from './../../common/bluetooth.service';
import { Component, OnInit, ViewChild } from '@angular/core';
import { NavController, Range, NavParams, LoadingController } from 'ionic-angular';
import { FormGroup, FormControl } from '@angular/forms';
import { counterRangeValidator } from '../../components/counter-input/counter-input';
import { GoogleMap } from "../../components/google-map/google-map";
import { MapsModel, MapPlace } from './maps.model';
import { Geolocation } from '@ionic-native/geolocation';
@Component({
  selector: 'device-page',
  templateUrl: 'device.html'
})
export class DevicePage implements OnInit {
  rangeForm: any;
  checkboxForm: FormGroup;
  radioForm: FormGroup;
  checkboxTagsForm: FormGroup;
  radioTagsForm: FormGroup;
  switchersForm: FormGroup;
  counterForm: any;
  ratingForm: FormGroup;
  radioColorForm: FormGroup;
  device: any = {};
  devices: any = {};
  active: string = 'pocket';
  range: number = 0;
  mapCenter: any = {};
  mapOptions: google.maps.MapOptions = {};
  ngOnInit() {
    this.bt.updatedMETA.subscribe(devices => {
      this.devices = devices;
      this.device = devices[this.device['id']];
      console.log(this.device, 'DEVICE UPDATE');
    })

    // console.log('got position', position);
    // let current_location = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
    // console.log('setLocation', current_location);
    // this.map_model.map_options.center.lat = position.coords.latitude;
    // this.map_model.map_options.center.lng = position.coords.longitude;
    // this.map_model.map.setCenter(current_location);
    this._GoogleMap.$mapReady.subscribe(map => {
      this.map_model.init(map);
      
      this.geolocateMe();
      // this.geolocation.getCurrentPosition(function (pos) {
        // this.map_model.map.setCenter(new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude));
        // var myLocation = new google.maps.Marker({
        //   position: new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude),
        //   map: this.map_model.map,
        //   title: "My Location"
        // });
      // });
      // map.setCenter(this.map_model.map_options.center);
      // _loading.dismiss();
    });


  }

  @ViewChild(GoogleMap) _GoogleMap: GoogleMap;
  map_model: MapsModel = new MapsModel();



  geolocateMe(){
    let env = this,
        _loading = env.loadingCtrl.create();

    _loading.present();

    this.geolocation.getCurrentPosition().then((position) => {
      let current_location = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
      
      env.map_model.search_query = position.coords.latitude.toFixed(2) + ", " + position.coords.longitude.toFixed(2);
      env.setOrigin(current_location);
      env.map_model.using_geolocation = true;
      env.map_model.map.setCenter(current_location);
      console.log(env.map_model.map.getCenter(), 'MAPS CENTER');
      _loading.dismiss();
    }).catch((error) => {
      console.log('Error getting location', error);
      _loading.dismiss();
    });
  }



  setOrigin(location: google.maps.LatLng){
    let env = this;

    // Clean map
    env.map_model.cleanMap();

    // Set the origin for later directions
    env.map_model.directions_origin.location = location;

    env.map_model.addPlaceToMap(location, '#00e9d5');

    // With this result we should find restaurants (*places) arround this location and then show them in the map

  }

  setActive(type: string) {
    this.device['type'] = type;
    console.log('type changed');
    this.bt.setType(this.device['id'], type);
  }

  constructor(
    public nav: NavController,
    private navParams: NavParams,
    private bt: BTService,
    private geolocation: Geolocation,
    private loadingCtrl: LoadingController
  ) {
    this.device = navParams.get('device');
    console.log('device', this.device);
    this.rangeForm = new FormGroup({
      single: new FormControl(10),
      dual: new FormControl({ lower: 1, upper: 10 })
    });

    this.checkboxForm = new FormGroup({
      person_1: new FormControl(true),
      person_2: new FormControl(false),
      person_3: new FormControl(false),
      person_4: new FormControl(true),
      person_5: new FormControl(false)
    });

    this.radioForm = new FormGroup({
      selected_option: new FormControl('apple')
    });

    this.checkboxTagsForm = new FormGroup({
      tag_1: new FormControl(false),
      tag_2: new FormControl(false),
      tag_3: new FormControl(true),
      tag_4: new FormControl(true),
      tag_5: new FormControl(false),
      tag_6: new FormControl(false),
      tag_7: new FormControl(true),
      tag_8: new FormControl(false)
    });

    this.radioTagsForm = new FormGroup({
      selected_option: new FormControl('any')
    });

    this.switchersForm = new FormGroup({
      notifications: new FormControl(true),
      email_notifications: new FormControl(false)
    });

    this.counterForm = new FormGroup({
      counter: new FormControl(5, counterRangeValidator(7, 1)),
      counter2: new FormControl(2, counterRangeValidator(5, 1))
    });

    this.ratingForm = new FormGroup({
      rate: new FormControl(2.5),
      rate2: new FormControl(1.5)
    });

    this.radioColorForm = new FormGroup({
      selected_color: new FormControl('#fc9961')
    });
  }

  rangeChange(range: Range) {
    console.log(`range, change, ratio: ${range.ratio}, value: ${range.value}`);
    this.bt.notificationRange.emit(range.value);
  }

}
