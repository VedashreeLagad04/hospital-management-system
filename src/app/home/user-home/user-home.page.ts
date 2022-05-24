/* eslint-disable @typescript-eslint/prefer-for-of */
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController, Platform } from '@ionic/angular';
import { AppDataService } from 'src/app/services/app-data.service';
import { FirebaseService } from 'src/app/services/firebase.service';
@Component({
  selector: 'app-user-home',
  templateUrl: './user-home.page.html',
  styleUrls: ['./user-home.page.scss'],
})
export class UserHomePage implements OnInit {
  public user;
  public isAdmin = false;
  public loggedInUser: any;
  public agentId: string;
  public backButtonSubscription: any;
  public askedBackedConfirmation = true;
  public internetCheckFlag = false;
  constructor(private dataService: AppDataService, private activeRoute: ActivatedRoute,
    private platform: Platform,
    public alertController: AlertController,
    public router: Router,
    private firebase: FirebaseService) { }
  public ngOnInit() {
    this.dataService.mySubscription = this.dataService.createOnline$().subscribe(async (isOnline) => {
      if (isOnline === false) {
        this.internetCheckFlag = true;
        this.dataService.toastPresent('Internet disconnected');
      } else if (isOnline === true && this.internetCheckFlag) {
        this.router.routeReuseStrategy.shouldReuseRoute = () => {
          return false;
        };
        this.user = this.dataService.getUserData();
        if (this.user.type === 'admin') {
          this.isAdmin = true;
        }
        // add your code here you want to perform on re-loading page here
        this.ionViewDidEnter();
        this.dataService.toastPresent('Internet Connected');
        this.internetCheckFlag = false;
      }
    });
  }
  // tslint:disable-next-line: use-lifecycle-interface
  public ngOnDestroy() {
    if (this.dataService.mySubscription) {
      this.dataService.mySubscription.unsubscribe();
    }
  }
  public ionViewDidEnter() {
    this.dataService.present().then((loader) => {
      loader.present();
      this.platform.ready().then(() => {
        this.activeRoute.paramMap.subscribe((params) => {
          this.agentId = params.get('id');
          this.loggedInUser = this.dataService.getUserData();
          if (this.agentId !== undefined && this.loggedInUser != null) {
            const obj = {
              title: 'Home',
              backPage: '',
            };
            this.dataService.setHeaderTitle(obj);
          }
        });
        this.backButtonSubscription = this.platform.backButton.subscribeWithPriority(
          9999,
          () => {
            if (this.askedBackedConfirmation) {
              this.askedBackedConfirmation = false;
              this.presentAlertConfirm();
            }
          },
        );
      });
      this.dataService.dismiss();
      // this.getAllPatients();
      // this.getIsDeletedMissingPatients();
      // this.addAssignedToArrInClientDoc();
      // this.editAssignedToArrInClientDoc();
    });
  }
  getAllPatients() {        // ? get duplicate patients
    const obj = {};
    this.firebase.getAllPatients().subscribe((resp: any) => {
      console.log('Resp: ', resp.docs.length);
      for (let i = 0; i < resp.docs.length; i++) {
        const element: any = resp.docs[i];
        const user = element.data();
        // const userNric = element.data().nric;
        const nric = user.nric !== '' ? user.nric : user.foreignId;
        if (obj[nric] === undefined) {
          // obj[userNric] = 1;
          obj[nric] = [user];
        } else {
          // obj[userNric] = obj[userNric] + 1;
          obj[nric].push(user);
        }
      }
      console.log(obj);
    });
  }
  getIsDeletedMissingPatients() {           // ? get patients in which 'isDeleted' flag is missing
    const userArr = [];
    this.firebase.getAllPatients().subscribe((resp: any) => {
      for (let i = 0; i < resp.docs.length; i++) {
        const element: any = resp.docs[i].data();
        element.id = resp.docs[i].id;
        if (element.isDeleted === undefined) {
          userArr.push(element);
          element.isDeleted = false;
          this.firebase.editUser(element).then(() => {
            console.log('isDeleted flag added in ', element.name);
          });
        }
      }
      console.log('userArr: ', userArr);
    });
  }
  addAssignedToArrInClientDoc() {         // ? change access from case level to client level
    // this.firebase.getUserByEmail('minor@gmail.com').subscribe((resp: any) => {
    this.firebase.getAllPatients().subscribe((resp: any) => {
      for (let i = 0; i < resp.docs.length; i++) {
        const user: any = resp.docs[i].data();
        user.id = resp.docs[i].id;
        if (!user.assignedTo) {
          user.assignedTo = [];
          this.firebase.getCase(user.id).subscribe((cases) => {
            cases.docs.forEach((doc) => {
              const casedata: any = doc.data();
              casedata.id = doc.id;
              if (casedata.primaryConsultant && !user.assignedTo.includes(casedata.primaryConsultant)) {
                user.assignedTo.push(casedata.primaryConsultant);
              }
              for (let j = 0; j < casedata.assignTo.length; j++) {
                const agent = casedata.assignTo[j];
                if (!user.assignedTo.includes(agent)) {
                  user.assignedTo.push(agent);
                }
              }
            });
            console.log(' user.assignedTo: ', user.assignedTo);
            this.firebase.editUser(user).then(() => {
              console.log('agent ids added to user');
            });
          });
        }
      }
    });
  }
  editAssignedToArrInClientDoc() {         // ? change access from case level to client level
    // this.firebase.getUserByEmail('minor@gmail.com').subscribe((resp: any) => {
    this.firebase.getAllPatients().subscribe((resp: any) => {
      for (let i = 0; i < resp.docs.length; i++) {
        const user: any = resp.docs[i].data();
        user.id = resp.docs[i].id;
        if (!user.assignedTo || user.assignedTo.includes(undefined)) {
          console.log('user: ', user);
          user.assignedTo = [];
          this.firebase.getCase(user.id).subscribe((cases) => {
            cases.docs.forEach((doc) => {
              const casedata: any = doc.data();
              casedata.id = doc.id;
              if (casedata.primaryConsultant && !user.assignedTo.includes(casedata.primaryConsultant)) {
                user.assignedTo.push(casedata.primaryConsultant);
              }
              for (let j = 0; j < casedata.assignTo.length; j++) {
                const agent = casedata.assignTo[j];
                if (!user.assignedTo.includes(agent)) {
                  user.assignedTo.push(agent);
                }
              }
            });
            console.log(' user.assignedTo: ', user.assignedTo);
            this.firebase.editUser(user).then(() => {
              console.log('agent ids added to user');
            });
          });
        }
      }
    });
  }
  public async presentAlertConfirm() {
    const alert = await this.alertController.create({
      // header: 'Confirm!',
      message: 'Are you sure you want to exit the app?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
          handler: (blah) => {
            this.askedBackedConfirmation = true;
          },
        }, {
          text: 'Exit',
          handler: () => {
            navigator['app'].exitApp();
          },
        },
      ],
    });
    await alert.present();
  }
  public changeRoute(type, mode) {
    if (type === 'client') {
      this.dataService.setAddOfflineClient(mode);
      this.dataService.routeChange('client-list/' + this.loggedInUser.id);
    } else if (type === 'claims-management') {
      this.dataService.routeChange('claims-management');
    } else if (type === 'current-admission') {
      this.dataService.routeChange('current-admission');
    } else if (type === 'isp-calculations') {
      this.dataService.routeChange('isp-calculation');
    } else if (type === 'case-management') {
      this.dataService.routeChange('case-management');
    } else if (type === 'generate-report') {
      this.dataService.routeChange('generate-report');
    } else if (type === 'invoices') {
      this.dataService.routeChange('invoices');
    } else if (type === 'insurance-calculator') {
      this.dataService.routeChange('insurance-calculator');
    }
  }
  public logout() {
    this.dataService.presentAlertConfirm('Confirm', 'Do you want to Sign Out ??').then((resp) => {
      if (resp === 'ok') {
        this.dataService.clearUserData(true);
        this.dataService.routeChange('/sign-in');
      }
    });
  }
}
