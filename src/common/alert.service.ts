import { LocalNotifications } from '@ionic-native/local-notifications';
import { device } from './bluetooth.service';
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
//this service contains logic about in-app and local alerts
export class AlertService {
    constructor(
        private alertCtrl: AlertController,
        private localNotifications: LocalNotifications
    ) {


    }
    public outOfRange(device: device): void {
        let text = "";
        if (device.bt.name && device.bt.name)
            text = `${device.bt.name} (${device.bt.id}) is out of range!`;
        else
            text = `${device.bt.id} is out of range!`;
        let alert = this.alertCtrl.create({
            title: "Signal lost!",
            subTitle: text,
            buttons: ['COMMON.DISMISS']
        });
        alert.present();
        this.localNotifications.schedule({
            id: 1,
            text: 'Device out of range!',
            // sound: 'file://sound.mp3'
        });
    }

    public lostConnection(device: device): void {
        let text = "";
        if (device.bt.name && device.bt.name)
            text = `Lost connection with ${device.bt.name} (${device.bt.id})!`;
        else
            text = `Lost connection with ${device.bt.id}!`;
        let alert = this.alertCtrl.create({
            title: "Signal lost!",
            subTitle: text,
            buttons: ['COMMON.DISMISS']
        });
        alert.present();
        this.localNotifications.schedule({
            id: 1,
            text: 'Lost connectin with a device!',
            // sound: 'file://sound.mp3'
        });
    }
}