import { JwtHelper } from 'angular2-jwt';
import { GlobalService } from './../../common/global.service';
import { AuthService } from './../../common/auth.service';
import { Component } from '@angular/core';
import { NavController, ModalController, LoadingController } from 'ionic-angular';
import { Validators, FormGroup, FormControl } from '@angular/forms';

import { TermsOfServicePage } from '../terms-of-service/terms-of-service';
import { PrivacyPolicyPage } from '../privacy-policy/privacy-policy';

import { TabsNavigationPage } from '../tabs-navigation/tabs-navigation';

import { FacebookLoginService } from '../facebook-login/facebook-login.service';
import { GoogleLoginService } from '../google-login/google-login.service';

@Component({
  selector: 'signup-page',
  templateUrl: 'signup.html'
})
export class SignupPage {
  signup: FormGroup;
  main_page: { component: any };
  loading: any;

  constructor(
    public nav: NavController,
    public modal: ModalController,
    public facebookLoginService: FacebookLoginService,
    public googleLoginService: GoogleLoginService,
    public loadingCtrl: LoadingController,
    public authService: AuthService,
    public gs: GlobalService,
    public jwt: JwtHelper
  ) {
    this.main_page = { component: TabsNavigationPage };

    this.signup = new FormGroup({
      email: new FormControl('', Validators.required),
      password: new FormControl('test', Validators.required),
      confirm_password: new FormControl('test', Validators.required)
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

  // doSignup(){
  //   this.authService
  //   this.nav.setRoot(this.main_page.component);
  // }

  doSignup() {
    let form = this.signup.value;
    this.authService.register(form['email'], form['password']).subscribe(res => {
      this.handleToken(res['data']);
    }, err => {
      err = err.json();
      this.gs.simpleAlert(err.error);
    });
    // this.nav.setRoot(this.main_page.component);
  }

  doFacebookSignup() {
    this.loading = this.loadingCtrl.create();
    // Here we will check if the user is already logged in
    // because we don't want to ask users to log in each time they open the app
    let env = this;

    this.facebookLoginService.getFacebookUser()
      .then(function (data) {
        // user is previously logged with FB and we have his data we will let him access the app
        env.authService.loginSocial('fb', data).subscribe(res => {
          this.handleToken(res['data']);
        }, err => {
          err = err.json();
          this.gs.simpleAlert(err.error);
        });
      }, function (error) {
        //we don't have the user data so we will ask him to log in
        env.facebookLoginService.doFacebookLogin()
          .then(function (res) {
            env.loading.dismiss();
            env.authService.loginSocial('fb', res).subscribe(res => {
              this.handleToken(res['data']);
            }, err => {
              err = err.json();
              this.gs.simpleAlert(err.error);
            });
          }, function (err) {
            console.log("Facebook Login error", err);
            env.loading.dismiss();
          });
      });
  }

  doGoogleSignup() {
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
          }, function (err) {
            console.log("Google Login error", err);
            env.loading.dismiss();
          });
      });
  }

  showTermsModal() {
    let modal = this.modal.create(TermsOfServicePage);
    modal.present();
  }

  showPrivacyModal() {
    let modal = this.modal.create(PrivacyPolicyPage);
    modal.present();
  }

}
