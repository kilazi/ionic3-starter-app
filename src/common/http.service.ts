import { AuthService } from './auth.service';
import { Platform } from 'ionic-angular';
// import { LoginPage } from './../pages/login/login';
import { GlobalService } from './global.service';
import { baseUrl, apiVersion } from './environment';
import { ToastController, AlertController, NavController } from 'ionic-angular';
import { Observable } from 'rxjs/Observable';
import { Inject, Injectable } from '@angular/core';
import { Headers, Http, RequestOptionsArgs, URLSearchParams } from '@angular/http';
import { Storage } from '@ionic/storage';
@Injectable()
export class HttpService {
    constructor(
        private _http: Http,
        private gs: GlobalService,
        private storage: Storage,
        private alertCtrl: AlertController,
        private toastCtrl: ToastController,
        private platform: Platform,
        private auth: AuthService
        // private navCtrl: NavController,
    ) {
        if (!this.platform.is('cordova')) {
            this.baseUrl = "http://62.109.16.138:1337";
        }
    }

    private baseUrl: string = baseUrl;
    private cachedToken: string = '';

    public get(url: string, options?: RequestOptionsArgs, ignoreBaseUrl: boolean = false) {

        return new Observable(observer => {
            this._createAuthorizationHeader(options).subscribe(options => {
                console.log('Call GET Request: ' + url, options);
                this._http
                    .get(this._generateUrl(url, ignoreBaseUrl), options)
                    .map(this._extractData)
                    .catch((err: any) => {
                        return this._handleError(err);
                    }).subscribe(res => {
                        console.log('Call GET Response: ' + url, res);
                        observer.next(res);
                    }, err => {
                        console.log('Call GET Error: ' + url, err);
                        observer.error(err);
                    })
            });
        })
    }

    public post(url: string, body: any, options?: RequestOptionsArgs, ignoreBaseUrl: boolean = false) {

        return new Observable(observer => {
            this._createAuthorizationHeader(options).subscribe(options => {
                console.log('Call POST Request: ' + url, options);
                this._http
                    .post(this._generateUrl(url, ignoreBaseUrl), body, options)
                    .map(this._extractData)
                    .catch((err: any) => {
                        return this._handleError(err);
                    }).subscribe(res => {
                        console.log('Call POST Response: ' + url, res);
                        observer.next(res);
                    }, err => {
                        console.log('Call POST Error: ' + url, err);
                        observer.error(err);
                    })
            });
        })
    }

    public put(url: string, body: any, options?: RequestOptionsArgs, ignoreBaseUrl: boolean = false) {

        return new Observable(observer => {
            this._createAuthorizationHeader(options).subscribe(options => {
                console.log('Call PUT Request: ' + url, options);
                this._http
                    .put(this._generateUrl(url, ignoreBaseUrl), body, options)
                    .map(this._extractData)
                    .catch((err: any) => {
                        return this._handleError(err);
                    }).subscribe(res => {
                        console.log('Call PUT Response: ' + url, res);
                        observer.next(res);
                    }, err => {
                        console.log('Call PUT Error: ' + url, err);
                        observer.error(err);
                    })
            });
        })
    }

    public delete(url: string, options?: RequestOptionsArgs, ignoreBaseUrl: boolean = false) {
        return new Observable(observer => {
            this._createAuthorizationHeader(options).subscribe(options => {
                this._http
                    .delete(this._generateUrl(url, ignoreBaseUrl), options)
                    .map(this._extractData)
                    .catch((err: any) => {
                        return this._handleError(err);
                    }).subscribe(res => {
                        observer.next(res);
                    }, err => {
                        observer.error(err);
                    })
            });
        })
    }

    public patch(url: string, body: any, options?: RequestOptionsArgs) {
        options = this._createAuthorizationHeader(options);

        return this._http
            .patch(this._generateUrl(url), body, options)
            .map(this._extractData)
            .catch((err: any) => {
                return this._handleError(err);
            });
    }

    private _generateUrl(url, ignoreBaseUrl = false): string {
        if (ignoreBaseUrl) {
            return `${this.baseUrl}/${url}`;
        }
        return `${this.baseUrl}/${apiVersion}/${url}`;
    }

    private _prepareRequest(options: RequestOptionsArgs = {}) {
        if (options.params) {
            options.params = this._prepareUrlParams(options.params);
        }
        options = this._createBaseHeader(options);
        options = this._createAuthorizationHeader(options);

        return options;
    }

    private _extractData(res: any) {
        if (res.status === 204 || !res._body) {
            return {};
        }
        let body = res.json();
        // let body = res;
        let total = res.headers.get('X-Total-Count');

        if (total) { 
            return { total, data: body };
        }
        return body || {};
    }

    private _handleError(err): Observable<any> {
        if (err.status >= 500) {
            this._handleServerError();
            return Observable.throw(null);
        }
        switch (err.status) {
            case 401:
                this._handleUnauthorized();
                break;
            case 404:
                this._handleNotFound();
                break;
            case 0:
                this._handleServerError();
                return Observable.throw(null);
            default:
                break;
        }
        return Observable.throw(err);
    }

    private _createBaseHeader(options: any = {}) {
        if (!options.headers) {
            options.headers = new Headers();
        }

        options.headers.append('Content-Type', 'application/json');

        return options;
    }

    private _createAuthorizationHeader(options: any = {}) {
        return new Observable(observer => {
            if (!options.headers) {
                options.headers = new Headers();
            }

            let token = "";
            if (this.cachedToken.length) {                 
                token = this.cachedToken;
                options.headers.set('Authorization', `Bearer ${token}`);
                observer.next(options);
            } else this.storage.get('accessToken').then(res => {
                token = res;
                if (token) {
                    options.headers.set('Authorization', `Bearer ${token}`);
                }

                observer.next(options);
            }).catch(err => {
                console.error('Could not get token from storage!');
                observer.error('Token could not be pulled.');
            });

        })

    }

    private _prepareUrlParams(options) {
        if (options instanceof URLSearchParams) {
            return options;
        }

        const params = new URLSearchParams();

        Object.keys(options).map((key) => {
            params.set(key, options[key]);
        });

        return params;
    }

    private _handleServerError() {
        this.gs.simpleToast('Something went wrong. Please, try a bit later');
    }

    private _handleUnauthorized() {
        this.cachedToken = '';
        this.gs.simpleLoading(false);
        this.auth.logout();
        // this.navCtrl.setRoot(LoginPage);
    }

    private _handleNotFound() {
        // this.navCtrl.setRoot(LoginPage);
    }
    
}