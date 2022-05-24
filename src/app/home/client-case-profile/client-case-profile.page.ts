/* eslint-disable @angular-eslint/use-lifecycle-interface */
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { AppDataService } from 'src/app/services/app-data.service';
import { FirebaseService } from 'src/app/services/firebase.service';
import { CaseUpdateStatusPage } from './case-update-status/case-update-status.page';
@Component({
  selector: 'app-client-case-profile',
  templateUrl: './client-case-profile.page.html',
  styleUrls: ['./client-case-profile.page.scss'],
})
export class ClientCaseProfilePage implements OnInit {
  public caseData: any = {};
  public clientDetails: any = {};
  public loggedInUser: any = {};
  public internetCheckFlag = false;
  public activeRouteSubscriber;
  public isEhealthClicked = false;
  caseSnapshotSubscriber: any;
  admSnapshotSubscriber: any;
  ehealthSnapshotSub: any;
  constructor(private activatedRoute: ActivatedRoute, public dataService: AppDataService,
    private firebaseService: FirebaseService,
    private modalController: ModalController,
    private router: Router) {
  }
  public ngOnInit() {
    this.dataService.mySubscription = this.dataService.createOnline$().subscribe(async (isOnline) => {
      if (isOnline === false) {
        this.internetCheckFlag = true;
        this.dataService.toastPresent('Internet disconnected');
      } else if (isOnline === true && this.internetCheckFlag) {
        this.router.routeReuseStrategy.shouldReuseRoute = () => false;
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
    // ! ionViewDidEnter is not called when navigated from case-update-status
    // ? it is called when params is subscribed, hence subscribed params here
    this.activeRouteSubscriber = this.activatedRoute.params.subscribe((params) => {
      this.dataService.present().then((loader) => {
        loader.present();
        this.loggedInUser = this.dataService.getUserData();
        const data = this.dataService.getSelectedCase();
        console.log('data: ', data);
        this.caseSnapshotSubscriber = this.firebaseService.getOneCase(data.id).subscribe((resp) => {
          if (data.id === resp.id) {
            this.caseData = resp;
            // tslint:disable-next-line: no-shadowed-variable
            // eslint-disable-next-line @typescript-eslint/no-shadow
            this.firebaseService.getUserDetails(this.caseData.clientId).subscribe((data) => {
              this.dataService.dismiss();
              const temp = data.data();
              temp.id = data.id;
              this.clientDetails = temp;
              // ? set patient data to sessionStorage
              this.dataService.setPatientData(this.clientDetails);
            });
          } else {
            this.caseData = data;
          }
          this.dataService.setSelectedCase(this.caseData);
          // ? publish the header title you want to display in header
          const obj = {
            title: 'Case Profile',
            backPage: 'client-case-list/' + this.caseData.clientId,
          };
          this.dataService.setHeaderTitle(obj);
        });
      });
    });
  }
  public changeRoute(nextPage) {
    if (nextPage === 'details') {
      let isCaseDetailsClicked = true;
      // eslint-disable-next-line max-len
      if ((this.loggedInUser.type === 'Claims User' || this.loggedInUser.type === 'Finance User' || this.loggedInUser.type === 'Management' || this.loggedInUser.type === 'agent') || (this.caseData.currentStatus === 'Admitted'
        || this.caseData.currentStatus === 'Discharge'
        || this.caseData.currentStatus === 'Pending Follow Up'
        || this.caseData.currentStatus === 'Open Date')) {
        this.dataService.present().then((loader) => {
          loader.present();
          let admission: any;
          this.admSnapshotSubscriber = this.firebaseService.getAdmission(this.caseData.id).subscribe((resp) => {
            if (isCaseDetailsClicked) {
              admission = resp[0];
              if (!admission) {
                admission = {
                  caseId: this.caseData.id,
                  case: {
                    admissionNumber: '',
                    hospitalCaseName: '',
                    diagnosis: '',
                    facilities: '',
                    surgicalCodes: [{ code: '-' }],
                    patientType: '',
                    admissionDate: '',
                    admissionTime: '',
                    dischargeDate: '',
                    dischargeTime: '',
                    wardNumber: '',
                  },
                  policy: [
                    {
                      nameOfPolicy: '',
                      insurer: '',
                      basicInceptionDate: '',
                      nameOfRider: '',
                      riderInceptionDate: '',
                      paymentMode: [],
                    },
                  ],
                  revenue: {
                    individualBill: [{
                      type: 'Hospital',
                      code: '-',
                      hospitalBill: '',
                      revenue: '',
                      pcareAmount: '',
                      tolAmount: '',
                      totalAmount: '',
                      tranche: '',
                    },
                    {
                      type: 'Doctor',
                      code: '-',
                      hospitalBill: '',
                      revenue: '',
                      pcareAmount: '',
                      tolAmount: '',
                      totalAmount: '',
                      tranche: '',
                    }],
                    totalHospitalBill: '',
                    totalRevenue: '',
                    totalAmt: '',
                    totalPcareAmount: '',
                    totalTolAmount: '',
                    hospitalBill: '',
                    lockRevenue: false,
                    referrerFee: '',
                  },
                  claims: [],
                };
              }
              this.dataService.setAdmissionData(admission);
              this.dataService.dismiss();
              isCaseDetailsClicked = false;
              this.dataService.routeChange('/client-case-details/case');
            }
          });
        });
      } else {
        this.dataService.presentAlertMessage('Not Allowed', 'You can not proceed as your case is not admitted!');
      }
    } else if (nextPage === 'information') {
      this.dataService.routeChange('/client-case-add/' + this.caseData.clientId + '/' + this.caseData.id);
    } else if (nextPage === 'appointment') {
      // eslint-disable-next-line max-len
      // if (this.caseData.currentStatus === 'Pending Approval' || this.caseData.currentStatus === 'Pending' || this.caseData.currentStatus === 'Rejected') {
      //   this.dataService.presentAlertMessage('Not Allowed', 'You can not proceed as your case is not approved!');
      // } else {
      this.dataService.routeChange('/client-case-appointments/' + this.caseData.id);
      // }
    } else if (nextPage === 'e-health-booklet') {
      this.isEhealthClicked = true;
      // ? get ehealth document and set it to service
      this.ehealthSnapshotSub = this.firebaseService.getEhealth(this.caseData.id).subscribe((resp) => {
        const ehealth = resp[0];
        this.dataService.setEhealthData(ehealth);
        this.dataService.dismiss();
        if (this.isEhealthClicked) {
          this.isEhealthClicked = false;
          this.dataService.routeChange('e-health-booklet/case/' + this.caseData.clientId + '');
        }
      });
    } else if (nextPage === 'folders') {
      this.dataService.routeChange('client-case-folders');
    }
  }
  public updateCaseStatus() {
    if (this.loggedInUser.type === 'admin' || (this.loggedInUser.type === 'agent' && (this.caseData.currentStatus !== 'Rejected'
      && this.caseData.currentStatus !== 'Pending Approval'))) {
      this.dataService.routeChange('/case-update-status');
    }
  }
  public goBack() {
    this.dataService.routeChange('client-case-list/' + this.clientDetails.id);
  }
  public async openUpadteStatusModal(status) {
    if (this.loggedInUser.type === 'admin') {
      this.dataService.routeChange('case-update-status');
    } else {
      if (status === 'Drop off before consultation' || status === 'Drop off after consultation') {
        this.dataService.presentAlertMessage('Case Dropped Off!', 'Create a new case');
      } else if (status === 'Submitted') {
        this.dataService.presentAlertMessage('Approval is pending!', 'Wait for approval of your pending Case');
      } else if (status === 'Rejected') {
        this.dataService.presentAlertMessage('Not Allowed!', 'Your Case is rejected. You can not update status for this case!');
      } else {
        //
        const modalPage = await this.modalController.create({
          component: CaseUpdateStatusPage,
          backdropDismiss: false,
          cssClass: 'updateCaseStatus-modal',
          componentProps: {
            case: this.caseData,
            // previous: prevData
            // ? data you want to send to modal
          },
        });
        modalPage.onDidDismiss().then((resp) => {
          if (resp.data.data === true) {
            if (this.caseData.currentStatus !== 'Admitted' || this.caseData.currentStatus !== 'Discharge') {
              this.dataService.presentAlert('Case status updated successfully!');
            }
          } else {
            this.caseData.currentStatus = status;
          }
        });
        modalPage.present();
      }
    }
  }
  public submitByAgent() {
    const caseStatus: any = {};
    const today = new Date();
    caseStatus.userType = this.loggedInUser.type;
    caseStatus.userId = this.loggedInUser.id;
    caseStatus.signature = '';
    caseStatus.status = 'Pending Approval';
    caseStatus.date = today.toString();
    this.caseData.currentStatus = caseStatus.status;
    this.caseData.lastUpdateTimestamp = new Date(today).getTime();
    this.caseData.caseStatus.push(caseStatus);
    // ? update case status in case collection
    this.firebaseService.editCase(this.caseData).then(() => {
      this.firebaseService.getclientDetails(this.caseData.clientId).subscribe((data) => {
        let clientData;
        data.docs.forEach((resp) => {
          clientData = resp.data();
          clientData.id = resp.id;
        });
        const timelineStatus: any = {
          date: today.toString(),
          activity: 'Case Submitted for Approval',
          userType: this.loggedInUser.type,
          userId: this.loggedInUser.id,
          caseId: this.caseData.id,
        };
        clientData.timeline.push(timelineStatus);
        this.firebaseService.editClientDetails(clientData, clientData.id).then(() => {
          this.dataService.presentAlert('Case submitted for approval successfully!');
        });
      });
      this.dataService.setSelectedCase(this.caseData);
      // ? update this case status in timeline
    });
  }
  public ionViewWillLeave() {
    if (this.activeRouteSubscriber) {
      this.activeRouteSubscriber.unsubscribe();
    }
    if (this.caseSnapshotSubscriber) {
      this.caseSnapshotSubscriber.unsubscribe();
    }
    if (this.admSnapshotSubscriber) {
      this.admSnapshotSubscriber.unsubscribe();
    }
    if (this.ehealthSnapshotSub) {
      this.ehealthSnapshotSub.unsubscribe();
    }
  }
}
