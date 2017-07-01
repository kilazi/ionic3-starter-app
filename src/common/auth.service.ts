import { Platform } from 'ionic-angular';
import { Observable } from 'rxjs/Observable';
import { Http } from '@angular/http';
import { HttpService } from './http.service';
import { GlobalService } from './global.service';
import { Injectable } from '@angular/core';
import { baseUrl, apiVersion } from './environment';
import { Storage } from '@ionic/storage';
@Injectable()
//handles JwT and authentication process
export class AuthService {
    private socialSecret: string = 'e4901652-9ef1-4e79-abd1-cde058ba51bf';
    private baseUrl: string = baseUrl;
    constructor(
        private nhttp: Http,
        private gs: GlobalService,
        private storage: Storage,
        platform: Platform
    ) {

        if (!platform.is('cordova')) {
            this.baseUrl = "http://62.109.16.138:1337";
        }
    }

    login(email, password) {
        return this.nhttp.post(`${this.baseUrl}/${apiVersion}/auth/login`, { email: email, password: password })
            .map(res => res.json())
    }

    loginSocial(type, data) {
        return this.nhttp.post(`${this.baseUrl}/${apiVersion}/auth/login-social`, { data: data, type: type, secret: this.socialSecret })
            .map(res => res.json())
    }

    register(email, password) {
        return this.nhttp.post(`${this.baseUrl}/${apiVersion}/auth/register`, { email: email, password: password })
            .map(res => res.json())
    }

    saveToken(token) {
        return new Observable(observer => {
            this.storage.set('accessToken', token).then(() => {
                observer.next();
            }).catch(err => {
                observer.error();
            })
        })
    }

    logout() {
        return new Observable(observer => {
            this.storage.remove('accessToken').then(() => {
                observer.next();
            }).catch(err => {
                observer.error();
            })
        })
    }

    checkToken() {
        return new Observable(observer => {
            this.storage.get('accessToken').then(res => {
                console.log('got tokean!', res);
                if (res && res.length)
                    observer.next();
                else observer.error();
            })
        })
    }
}