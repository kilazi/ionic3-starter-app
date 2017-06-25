import { MyDevicesPage } from './../pages/my-devices/my-devices';
import { AllDevicesPage } from './../pages/all-devices/all-devices';
import { MapsPage } from './../pages/maps/maps';
import { BTService } from './../common/bluetooth.service';
import { LoginPage } from './../pages/login/login';
import { HttpService } from './../common/http.service';
import { ListingPage } from './../pages/listing/listing';
import { AuthService } from './../common/auth.service';
import { Component, ViewChild } from '@angular/core';
import { Platform, MenuController, Nav, App } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { baseUrl } from '../common/environment';
import { WalkthroughPage } from '../pages/walkthrough/walkthrough';
import { SettingsPage } from '../pages/settings/settings';


@Component({
  selector: 'app-root',
  templateUrl: 'app.html'
})
export class MyApp {

  @ViewChild(Nav) nav: Nav;

  // make WalkthroughPage the root (or first) page
  rootPage: any = WalkthroughPage;
  // rootPage: any = TabsNavigationPage;


  pages: Array<{title: string, icon: string, component: any}>;
  pushPages: Array<{title: string, icon: string, component: any}>;

  constructor(
    public platform: Platform,
    public menu: MenuController,
    public app: App,
    public splashScreen: SplashScreen,
    public statusBar: StatusBar,
    public authService: AuthService,
    public http: HttpService,
    public auth: AuthService,
    public bt: BTService
  ) {
    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      this.splashScreen.hide();
      this.statusBar.styleDefault();
    });

    this.pages = [
      { title: 'Devices', icon: 'create', component: MyDevicesPage },
      // { title: 'My Devices', icon: 'home', component: FormsPage },
      // { title: 'Functionalities', icon: 'code', component: FunctionalitiesPage }
    ];

    this.pushPages = [
      // { title: 'Layouts', icon: 'grid', component: LayoutsPage },
      { title: 'Maps', icon: 'grid', component: MapsPage },
      { title: 'Settings', icon: 'settings', component: SettingsPage }
    ];
 
    // this.bt.showMyDevices().subscribe(res => {
    //   res['connectedMapping'].forEach(id => this.bt.connectBLE(id)) 
    // })

    
    

    this.authService.checkToken().subscribe(() => {
      console.log('token recognised');
      // setTimeout(() => 
      this.nav.setRoot(MyDevicesPage), 300
      // );
    }, () => {
      
    })


   
  }

  openPage(page) {
    // close the menu when clicking a link from the menu
    this.menu.close();
    // navigate to the new page if it is not the current page
    this.nav.setRoot(page.component);
  }

  pushPage(page) {
    // close the menu when clicking a link from the menu
    this.menu.close();
    // rootNav is now deprecated (since beta 11) (https://forum.ionicframework.com/t/cant-access-rootnav-after-upgrade-to-beta-11/59889)
    this.app.getRootNav().push(page.component);
  }

  logout(){
    this.auth.logout().subscribe(res => {
      this.nav.setRoot(LoginPage);
    })
  }
}
