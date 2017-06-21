import { ToastController, AlertController, Platform, LoadingController } from 'ionic-angular';
import { Injectable } from '@angular/core';
@Injectable()
export class GlobalService {
    private _isCordova: boolean = false;
    private preloader: any;
    constructor(
        private toastCtrl: ToastController,
        private alertCtrl: AlertController,
        private platform: Platform,
        private loading: LoadingController
    ) {
        if (this.platform.is('cordova')) this._isCordova = true;

        this.preloader = loading.create();
    }

    isCordova() {
        return this._isCordova;
    }

    simpleToast(message: string) {
        this.toastCtrl.create(message);
    }

    simpleAlert(message: string, title: string = 'Error') {
        let alert = this.alertCtrl.create({
            title: title,
            subTitle: message,
            buttons: ['COMMON.DISMISS']
        });
        alert.present();
    }

    simpleLoading(check) {
        if (check)
            this.preloader.present();
        else
            this.preloader.dismiss();
    }

    simplePrompt(callbackOK, title='COMMON.YOU_SURE_TITLE', message='COMMON.YOU_SURE_MESSAGE') {
        let alert = this.alertCtrl.create({
            title: title,
            subTitle: message,
            buttons: [
                {
                    text: 'COMMON.CANCEL',
                    role: 'cancel',
                    handler: () => {
                        console.log('Cancel clicked');
                    }
                },
                {
                    text: 'COMMON.OK',
                    handler: () => {
                        callbackOK()
                    }
                }
            ]
        });
        alert.present();
    }

    

}