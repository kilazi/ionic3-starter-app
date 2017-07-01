import { SafeHeavenService } from './../common/safeheaven.service';
import { SafeHeavenDetailPage } from './../pages/safe-heaven/safe-heaven.detail/safe-heaven.detail';
import { SafeHeavenCreatePage } from './../pages/safe-heaven/safe-heaven.create/safe-heaven.create';
import { SafeHeavenPage } from './../pages/safe-heaven/safe-heaven';
import { MyDevicesPage } from './../pages/my-devices/my-devices';
import { AllDevicesPage } from './../pages/all-devices/all-devices';
import { GeolocationService } from './../common/geolocations.service';
import { DevicePage } from './../pages/device/device';
import { LocalNotifications } from '@ionic-native/local-notifications';
import { AlertService } from './../common/alert.service';
import { TimePipe } from './../common/time.pipe';
import { BTService } from './../common/bluetooth.service';
import { NonamePipe } from './../common/noname.pipe';
import { BLE } from '@ionic-native/ble';
import { JwtHelper } from 'angular2-jwt';
import { HttpService } from './../common/http.service';
import { GlobalService } from './../common/global.service';
import { AuthService } from './../common/auth.service';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { IonicApp, IonicModule } from 'ionic-angular';
import { MyApp } from './app.component';

import { ListingPage } from '../pages/listing/listing';
import { LoginPage } from '../pages/login/login';
import { NotificationsPage } from '../pages/notifications/notifications';
import { WalkthroughPage } from '../pages/walkthrough/walkthrough';
import { SettingsPage } from '../pages/settings/settings';
import { SignupPage } from '../pages/signup/signup';
import { ForgotPasswordPage } from '../pages/forgot-password/forgot-password';

import { PreloadImage } from '../components/preload-image/preload-image';
import { BackgroundImage } from '../components/background-image/background-image';
import { ShowHideContainer } from '../components/show-hide-password/show-hide-container';
import { ShowHideInput } from '../components/show-hide-password/show-hide-input';
import { ColorRadio } from '../components/color-radio/color-radio';
import { CounterInput } from '../components/counter-input/counter-input';
import { Rating } from '../components/rating/rating';
import { GoogleMap } from '../components/google-map/google-map';

import { NotificationsService } from '../pages/notifications/notifications.service';
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
import { MapsPage } from '../pages/maps/maps';
import { FacebookLoginPage } from '../pages/facebook-login/facebook-login';
import { GoogleLoginPage } from '../pages/google-login/google-login';

import { FacebookLoginService } from '../pages/facebook-login/facebook-login.service';
import { GoogleLoginService } from '../pages/google-login/google-login.service';
import { GoogleMapsService } from '../pages/maps/maps.service';

import { IonicStorageModule } from '@ionic/storage';

import { BackgroundMode } from '@ionic-native/background-mode';

@NgModule({
  declarations: [
    MyApp,
    ListingPage,
    LoginPage,
    NotificationsPage,
    WalkthroughPage,
    SettingsPage,
    SignupPage,
    ForgotPasswordPage,
    MapsPage,
    FacebookLoginPage,
    GoogleLoginPage,

    PreloadImage,
    BackgroundImage,
    ShowHideContainer,
    ShowHideInput,
    ColorRadio,
    CounterInput,
    Rating,
    GoogleMap,
    NonamePipe,
    TimePipe,
    DevicePage,
    AllDevicesPage,
    MyDevicesPage,
    SafeHeavenPage,
    SafeHeavenCreatePage,
    SafeHeavenDetailPage
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
    ListingPage,
    LoginPage,
    NotificationsPage,
    WalkthroughPage,
    SettingsPage,
    ForgotPasswordPage,
    SignupPage,
    MapsPage,
    FacebookLoginPage,
    GoogleLoginPage,
    DevicePage,
    AllDevicesPage,
    MyDevicesPage,
    SafeHeavenPage,
    SafeHeavenCreatePage,
    SafeHeavenDetailPage
  ],
  providers: [
    NotificationsService,

    FacebookLoginService,
    GoogleLoginService,
    GoogleMapsService,

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
    EmailComposer,
    JwtHelper,
    BLE,
    AuthService,
    GlobalService,
    HttpService,
    BTService,
    AlertService,
    LocalNotifications,
    GeolocationService,
    SafeHeavenService,

    BackgroundMode
  ],
  schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
})
export class AppModule {}
