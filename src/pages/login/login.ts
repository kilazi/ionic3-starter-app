import { MyDevicesPage } from './../my-devices/my-devices';
import { AllDevicesPage } from './../all-devices/all-devices';
import { GlobalService } from './../../common/global.service';
import { AuthService } from './../../common/auth.service';
import { HttpService } from './../../common/http.service';
import { Component } from '@angular/core';
import { NavController, LoadingController } from 'ionic-angular';
import { Validators, FormGroup, FormControl } from '@angular/forms';

// import { TabsNavigationPage } from '../tabs-navigation/tabs-navigation';
import { SignupPage } from '../signup/signup';
import { ForgotPasswordPage } from '../forgot-password/forgot-password';

import { FacebookLoginService } from '../facebook-login/facebook-login.service';
import { GoogleLoginService } from '../google-login/google-login.service';

import { JwtHelper, AuthHttp } from "angular2-jwt";

@Component({
  selector: 'login-page',
  templateUrl: 'login.html'
})
export class LoginPage {
  login: FormGroup;
  main_page: { component: any };
  loading: any;


  constructor(
    public nav: NavController,
    public facebookLoginService: FacebookLoginService,
    public googleLoginService: GoogleLoginService,
    public loadingCtrl: LoadingController,
    public authService: AuthService,
    public gs: GlobalService,
    public jwt: JwtHelper
  ) {
    this.main_page = { component: MyDevicesPage };

    this.login = new FormGroup({
      email: new FormControl('', Validators.required),
      password: new FormControl('test', Validators.required)
    });
  }

  handleToken(token) {
    console.log('login successful! token: ', token, this.jwt.decodeToken(token));
    this.authService.saveToken(token).subscribe(res => {
      this.nav.setRoot(this.main_page.component);
    }, err => {
      this.gs.simpleAlert('COMMON_ERROR');
    })
  }

  doLogin() {
    let form = this.login.value;
    this.authService.login(form.email, form.password).subscribe(res => {
      this.handleToken(res['data']);
    }, err => {
      err = err.json();
      this.gs.simpleAlert(err.error);
    });
    // this.nav.setRoot(this.main_page.component);
  }

  doFacebookLogin() {
    this.loading = this.loadingCtrl.create();

    // Here we will check if the user is already logged in because we don't want to ask users to log in each time they open the app
    let env = this;
    console.log('doFacebookLogin');
    this.facebookLoginService.getFacebookUser()
      .then(function (data) {
        console.log('getFacebookUser', JSON.stringify(data));
        // user is previously logged with FB and we have his data we will let him access the app
        env.authService.loginSocial('fb', data).subscribe(res => {
          console.log('loginSocial', JSON.stringify(res));
          this.handleToken(res['data']);

        }, err => {
          err = err.json();
          console.log('loginSocial', JSON.stringify(err));
          this.gs.simpleAlert(err.error);
        });
        // env.nav.setRoot(env.main_page.component);
      }, function (error) {
        //we don't have the user data so we will ask him to log in
        env.facebookLoginService.doFacebookLogin()
          .then(function (res) {
            console.log('doFacebookLogin', JSON.stringify(res));
            env.authService.loginSocial('fb', res).subscribe(res => {
              console.log('loginSocial', JSON.stringify(res));
              this.handleToken(res['data']);
            }, err => {
              
              err = err.json();
              console.log('loginSocial', JSON.stringify(err));
              this.gs.simpleAlert(err.error);
            });
            // env.authService.loginSocial()
            env.loading.dismiss();
            // env.nav.setRoot(env.main_page.component);
          }, function (err) {
            console.log("Facebook Login error", err);
          });
      });
  }

  doGoogleLogin() {
    this.loading = this.loadingCtrl.create();

    // Here we will check if the user is already logged in because we don't want to ask users to log in each time they open the app
    let env = this;

    this.googleLoginService.trySilentLogin()
      .then(function (data) {
        // user is previously logged with Google and we have his data we will let him access the app
        env.authService.loginSocial('gp', data).subscribe(res => {
          this.handleToken(res['data']);
        }, err => {
          err = err.json();
          this.gs.simpleAlert(err.error);
        });
        // env.nav.setRoot(env.main_page.component);
      }, function (error) {
        //we don't have the user data so we will ask him to log in
        env.googleLoginService.doGoogleLogin()
          .then(function (res) {
            env.loading.dismiss();
            env.authService.loginSocial('gp', res).subscribe(res => {
              this.handleToken(res['data']);
            }, err => {
              err = err.json();
              this.gs.simpleAlert(err.error);
            });
            // env.nav.setRoot(env.main_page.component);
          }, function (err) {
            console.log("Google Login error", err);
          });
      });
  }


  goToSignup() {
    this.nav.push(SignupPage);
  }

  goToForgotPassword() {
    this.nav.push(ForgotPasswordPage);
  }

}
