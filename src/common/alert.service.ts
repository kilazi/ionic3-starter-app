// import { LocalNotifications } from '@ionic-native/local-notifiactions';
import { Platform, AlertController } from 'ionic-angular';
import { Observable } from 'rxjs/Observable';
import { Http } from '@angular/http';
import { HttpService } from './http.service';
import { GlobalService } from './global.service';
import { Injectable } from '@angular/core';
import { baseUrl, apiVersion } from './environment';
import { Storage } from '@ionic/storage';
@Injectable()
export class AlertService {
    constructor(
        private alertCtrl: AlertController,
        // private localNotifications: LocalNotifications
    ) {


    }
    outOfRange(device) {
        let text = "";
        if (device['name'])
            text = `${device['name']} (${device['id']}) is out of range!`;
        else
            text = `${device['id']} is out of range!`;
        let alert = this.alertCtrl.create({
            title: "Out of range!",
            subTitle: text,
            buttons: ['COMMON.DISMISS']
        });
        alert.present();
        // this.localNotifications.schedule({
        //     id: 1,
        //     text: 'Device out of range!',
        //     sound: 'file://sound.mp3'
        // });
    }
}