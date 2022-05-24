import { Component } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { FileTransfer, FileTransferObject } from '@ionic-native/file-transfer/ngx';
// tslint:disable-next-line: ordered-imports
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { MenuController, Platform } from '@ionic/angular';
import { Storage } from '@ionic/storage';
import { filter } from 'rxjs/operators';
import { AppDataService } from './services/app-data.service';
import { AuthService } from './services/auth.service';
import { FirebaseService } from './services/firebase.service';
@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  public loggedInuser: any;
  public showHeader: boolean;
  public headerTitle = 'Client';
  public headerBackPage: any;
  public showLogout = false;
  public showLoaderCancelBtn = false;
  public changeInDataCount;
  public hideDirectNavButtons = false;
  userSnapshotSub: any;
  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private menu: MenuController,
    private router: Router,
    public dataService: AppDataService,
    private storage: Storage,
    private authService: AuthService,
    private firebase: FirebaseService,
  ) {
    // ? check if page is refreshed
    // this.router.events
    //   .pipe(filter((rs): rs is NavigationEnd => rs instanceof NavigationEnd))
    //   .subscribe(event => {
    //     if (
    //       event.id === 1 &&
    //       event.url === event.urlAfterRedirects
    //     ) {
    //       // ? check if logged in
    //       this.storage.get('userdata').then((user) => {
    //         if (user) {
    //           
    //           authService.interval();
    //         }
    //       });
    //     }
    //   });
    // ? subscribe publisher here and check for 'title'
    // ? if 'title' is 'sign-in', hide header
    dataService.subscribeHeaderTitle.subscribe((obj) => {
      this.showHeader = (obj.title === 'sign-in') ? false : true;
      this.headerTitle = (obj.title === 'sign-in') ? 'Client' : obj.title;
      this.headerBackPage = obj.backPage;
      if (this.headerTitle === 'Home'
        || this.headerTitle === 'Client'
        || this.headerTitle === 'Case Management'
        || this.headerTitle === 'Current Admission'
        || this.headerTitle === 'Claims Management'
        || this.headerTitle === 'Invoices'
        || this.headerTitle === 'ISP Calculation'
        || this.headerTitle === 'Privacy Policy'
        || this.headerTitle === 'New Client Info'
        || this.headerTitle === 'Verify Client Info'
        || this.headerTitle === 'Preview Client Info'
      ) {
        this.hideDirectNavButtons = true;
      } else {
        this.hideDirectNavButtons = false;
      }
      this.openFirst();
      // ? get 'userdata' from session and not ionic storage because issue occurs when
      // ? user is logged in with different credentials on different tabs; the latest login details is reflected on remaining tabs
      // this.storage.get('userdata').then((user) => {
      const user = dataService.getUserData();
      if (user) {
        // this.loggedInuser = JSON.parse(user);
        this.loggedInuser = user;
        if (this.loggedInuser.currentStatus === 'active') {
          this.changeInDataCount = 0;
          // ? did not unsubscribe this; because
          this.userSnapshotSub = this.firebase.getloggedInUserUpdate().subscribe((resp) => {
            const changeInUser = resp[0];
            if (changeInUser.id === this.loggedInuser.id) {
              if (changeInUser.currentStatus === 'suspend') {
                this.changeInDataCount++;
                if (this.changeInDataCount === 1) {
                  this.dataService.presentAlert('Sorry! Your account is suspended');
                  this.showHeader = false;
                  this.authService.logout();
                  this.dataService.clearUserData(true);
                  this.routePage('/sign-in', null);
                }
              } else {
                // this.dataService.storeUserData(changeInUser);
                this.dataService.setUserData(changeInUser);
              }
            }
          }, (err) => {
            this.showHeader = false;
            this.authService.logout();
            this.dataService.clearUserData(true);
            this.routePage('/sign-in', null);
          });
        }
      } else {
        this.showHeader = false;
        this.router.navigateByUrl('sign-in');
        this.splashScreen.hide();
      }
      // });
    });
    dataService.showCancelBtn.subscribe((resp) => {
      this.showLoaderCancelBtn = resp;
    });
    this.initializeApp();
  }
  public ngOnInit() {
  }
  public openFirst() {
    this.menu.enable(true, 'main');
    // this.menu.open('main');
  }
  public routePage(page, clientType) {
    if (page.includes('client-list')) {
      this.dataService.setAddOfflineClient(clientType);
    }
    this.router.navigate(['/' + page]);
  }
  public logout() {
    this.dataService.presentAlertConfirm('Confirm', 'Do you want to Sign Out ??').then((resp) => {
      if (resp === 'ok') {
        this.showHeader = false;
        if (this.userSnapshotSub)
          this.userSnapshotSub.unsubscribe();
        this.authService.logout();
        // this.dataService.clearUserData(true);
        this.routePage('/sign-in', null);
      }
    });
  }
  public initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.overlaysWebView(false);
      this.statusBar.backgroundColorByHexString('#3E3E3E');
      this.splashScreen.hide();
      // this.loggedInuser = this.dataService.getUserData();
      // this.storage.get('userdata').then((user) => {
      //   if (user) {
      //     this.loggedInuser = JSON.parse(user);
      //     
      //     // if (this.loggedInuser && this.loggedInuser.email) {
      //     //   sessionStorage.setItem('userdata', user);
      //     //   this.router.navigate(['user-home/' + this.loggedInuser.id]);
      //     //   this.splashScreen.hide();
      //     // } else {
      //     //   this.router.navigateByUrl('sign-in');
      //     //   this.splashScreen.hide();
      //     // }
      //   } else {
      //     this.router.navigateByUrl('sign-in');
      //     this.splashScreen.hide();
      //   }
      // });
    });
  }
  public goToHome() {
    this.menu.close('main');
    this.dataService.routeChange('user-home/' + this.loggedInuser.id);
  }
  public dismissLoader() {
    if (this.dataService.isLoading) {
      let msg = 'Go back and try loading this page again!';
      if (this.dataService.currentLoader === 'pdf') {
        msg = 'File generating will continue in background and prompt you when completed!';
      } else if (this.dataService.currentLoader === 'aws' || this.dataService.currentLoader === 'file') {
        msg = 'File upload will continue in background and prompt you when completed!';
      } else if (this.dataService.currentLoader === 'preview-pdf') {
        msg = 'File preview cancelled!';
        this.dataService.setLoaderCancel(true);
      }
      this.dataService.dismiss().then(() => {
        this.dataService.presentAlert(msg);
      });
    }
  }
  public directNavTo(page) {
    const client = this.dataService.getPatientData();
    this.router.navigateByUrl(page + '/' + client.id);
  }
}
