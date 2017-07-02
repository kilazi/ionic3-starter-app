import { WalkthroughPage } from './../pages/walkthrough/walkthrough';
import { AllDevicesPage } from './../pages/all-devices/all-devices';
import { GeolocationService } from './../common/geolocations.service';
import { NonamePipe } from './../common/noname.pipe';
import { JwtHelper } from 'angular2-jwt';
import { HttpService } from './../common/http.service';
import { GlobalService } from './../common/global.service';
import { AuthService } from './../common/auth.service';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { IonicApp, IonicModule } from 'ionic-angular';
import { MyApp } from './app.component';

import { LoginPage } from '../pages/login/login';

import { PreloadImage } from '../components/preload-image/preload-image';
import { BackgroundImage } from '../components/background-image/background-image';
import { ShowHideContainer } from '../components/show-hide-password/show-hide-container';
import { ShowHideInput } from '../components/show-hide-password/show-hide-input';
import { ColorRadio } from '../components/color-radio/color-radio';
import { CounterInput } from '../components/counter-input/counter-input';
import { Rating } from '../components/rating/rating';
import { GoogleMap } from '../components/google-map/google-map';

import { BrowserModule } from '@angular/platform-browser';
import { HttpModule } from '@angular/http';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { SocialSharing } from '@ionic-native/social-sharing';
import { NativeStorage } from '@ionic-native/native-storage';
import { InAppBrowser } from '@ionic-native/in-app-browser';
import { CallNumber } from '@ionic-native/call-number';
import { Facebook } from '@ionic-native/facebook';
import { GooglePlus } from '@ionic-native/google-plus';
import { Keyboard } from '@ionic-native/keyboard';
import { Geolocation } from '@ionic-native/geolocation';
import { EmailComposer } from '@ionic-native/email-composer';

// Functionalities
import { FacebookLoginPage } from '../pages/facebook-login/facebook-login';
import { GoogleLoginPage } from '../pages/google-login/google-login';

import { FacebookLoginService } from '../pages/facebook-login/facebook-login.service';
import { GoogleLoginService } from '../pages/google-login/google-login.service';

import { IonicStorageModule } from '@ionic/storage';

@NgModule({
  declarations: [
    MyApp,
    LoginPage,
    FacebookLoginPage,
    GoogleLoginPage,
    WalkthroughPage,
    PreloadImage,
    BackgroundImage,
    ShowHideContainer,
    ShowHideInput,
    ColorRadio,
    CounterInput,
    Rating,
    GoogleMap,
    NonamePipe,
    AllDevicesPage
  ],
  imports: [
    BrowserModule,
    HttpModule,
    IonicModule.forRoot(MyApp),
    IonicStorageModule.forRoot()
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    LoginPage,
    FacebookLoginPage,
    GoogleLoginPage,
    AllDevicesPage,
    WalkthroughPage
  ],
  providers: [
    FacebookLoginService,
    GoogleLoginService,
	  SplashScreen,
	  StatusBar,
    SocialSharing,
    NativeStorage,
    InAppBrowser,
    CallNumber,
    Facebook,
    GooglePlus,
    Keyboard,
    Geolocation,
    GeolocationService,
    EmailComposer,
    JwtHelper,
    AuthService,
    GlobalService,
    HttpService
  ],
  schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
})
export class AppModule {}
