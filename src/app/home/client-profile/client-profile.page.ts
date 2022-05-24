import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { AppDataService } from 'src/app/services/app-data.service';
import { FirebaseService } from 'src/app/services/firebase.service';
import { AssignedConsultantsModalPage } from './assigned-consultants-modal/assigned-consultants-modal.page';
@Component({
  selector: 'app-client-profile',
  templateUrl: './client-profile.page.html',
  styleUrls: ['./client-profile.page.scss'],
})
export class ClientProfilePage implements OnInit {
  public showDetails = true;
  public showTimeline = false;
  public clientId: string;
  public clientDetails: any = {
  };
  public clientName = '';
  public clientStatus = '';
  public loggedInUser: any;
  public clientDetailsData: any = {};
  public latestCase = {
    caseDetails: {
      name: '',
    },
    currentStatus: '',
  };
  public caseList: any = [];
  public internetCheckFlag = false;
  allowToCaselist = false;
  constructor(private activeRoute: ActivatedRoute, public dataService: AppDataService,
    private firebase: FirebaseService, private router: Router, private modalCtrl: ModalController) { }
  public ngOnInit() {
    this.dataService.mySubscription = this.dataService.createOnline$().subscribe(async (isOnline) => {
      if (isOnline === false) {
        this.internetCheckFlag = true;
        this.dataService.toastPresent('Internet disconnected');
      } else if (isOnline === true && this.internetCheckFlag) {
        this.router.routeReuseStrategy.shouldReuseRoute = () => {
          return false;
        };
        // add your code you want to perform on re-loading page here
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
    this.dataService.lastPage = 'details';
    this.dataService.present().then((a) => {
      a.present();
      this.loggedInUser = this.dataService.getUserData();
      const obj = {
        title: 'Client Profile',
        backPage: 'client-list/' + this.loggedInUser.id,
      };
      this.dataService.setHeaderTitle(obj);
      this.activeRoute.paramMap.subscribe((params) => {
        this.clientId = params.get('id');
        this.firebase.getUserDetails(this.clientId).subscribe((data) => {
          this.clientDetails = data.data();
          this.clientDetails.id = data.id;
          console.log('this.clientDetails: ', this.clientDetails);
          this.allowToCaselist = true;
          // ? check if loggedInUser is assigned to this.clientDetails;
          // ? if yes, then get all data; else dont
          if (this.loggedInUser.type === 'agent' && !this.clientDetails.assignedTo.includes(this.loggedInUser.id)) {
            this.allowToCaselist = false;
          }
          this.clientName = this.clientDetails.name;
          this.clientStatus = this.clientDetails.currentStatus;
          this.dataService.dismiss();
        }, (error) => {
          this.dataService.dismiss();
        });
      });
    });
  }
  // sortCases() {
  //   
  //   this.caseList = this.caseList.sort((a, b) => {
  //     const dateA = new Date(a.lastUpdateDate.seconds);
  //     
  //     const dateB = new Date(b.lastUpdateDate.seconds);
  //     if (dateA < dateB) {
  //       return 1;
  //     } else {
  //       return -1;
  //     }
  //   });
  //   
  //   this.latestCase = this.caseList[0];
  // }
  public openCaseDetails() {
    this.dataService.setSelectedCase(this.latestCase);
    this.router.navigate(['/client-case-home']);
  }
  public backButton() {
    this.dataService.routeChange('/client-list/' + this.loggedInUser.id);
  }
  public timeConverter24(time24) {
    let h, H, ts;
    ts = time24;
    H = +ts.substr(0, 2);
    h = (H % 12) || 12;
    h = (h < 10) ? ('0' + h) : h;  // leading 0 at the left for 1 digit hours
    const ampm = H < 12 ? ' AM' : ' PM';
    ts = h + ts.substr(2, 3) + ampm;
    return ts;
  }
  public toggleOnClick(tab) {
    if (tab === 'details') {
      this.showDetails = true;
      this.showTimeline = false;
    } else if (tab === 'timeline') {
      this.dataService.present().then((a) => {
        a.present();
        this.firebase.getclientDetails(this.clientId).subscribe((resp) => {
          resp.docs.forEach((temp) => {
            const data: any = temp.data();
            if (this.clientDetailsData.length !== 0) {
              this.clientDetailsData.timeline = data.timeline.sort().reverse();
              this.clientDetailsData.timeline.forEach((events) => {
                const dateNew = events.date.toDate();
                const newDate = dateNew.toString().split(' ');
                events.date = newDate[2];
                events.month = newDate[1];
                events.year = newDate[3];
                events.time = this.timeConverter24(newDate[4]);
              });
            }
          });
          this.dataService.dismiss();
        });
      });
      this.showDetails = false;
      this.showTimeline = true;
    }
  }
  public goToVerifyAccount() {
    if (this.loggedInUser.type === 'admin') {
      this.dataService.routeChange('/admin-verify-account/' + this.clientId);
    }
  }
  public redirectToCaseList() {
    if (this.clientDetails.currentStatus === 'Verified') {
      this.dataService.routeChange('client-case-list/' + this.clientId);
    } else if (this.clientDetails.currentStatus === 'Pending') {
      this.dataService.presentAlert('Your account is not verified!!');
    } else {
      this.dataService.presentAlert('Your account is Rejected!!');
    }
  }
  viewAssignedConsultants() {
    this.modalCtrl.create({
      component: AssignedConsultantsModalPage,
      componentProps: {
        patient:this.clientDetails
      },
      cssClass: 'assign-consultants-modal'
    }).then(modalEl1 => {
      modalEl1.present();
    });
  }
}
