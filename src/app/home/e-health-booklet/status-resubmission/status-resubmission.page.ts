import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import * as _ from 'lodash';
import { AppDataService } from 'src/app/services/app-data.service';
import { FirebaseService } from 'src/app/services/firebase.service';
import { ResubmissionModalPage } from './resubmission-modal/resubmission-modal.page';
@Component({
  selector: 'app-status-resubmission',
  templateUrl: './status-resubmission.page.html',
  styleUrls: ['./status-resubmission.page.scss'],
})
export class StatusResubmissionPage implements OnInit {
  public caseStatus: any = {};
  public ehealth: any = {};
  public caseData: any = {};
  public loggedInUser;
  public disableResubmission = false;
  public internetCheckFlag = false;
  public reloadAgain = true;
  // tslint:disable-next-line: max-line-length
  constructor(private dataservice: AppDataService, private firebase: FirebaseService, private modalCtrl: ModalController, private router: Router) { }
  public ionViewDidEnter() {
    this.dataservice.present().then((loader) => {
      loader.present();
      this.loggedInUser = this.dataservice.getUserData();
      this.caseData = this.dataservice.getSelectedCase();
      // this.firebase.getEhealth(this.caseData.id).subscribe((resp) => {
      //   resp.docs.forEach((temp) => {
      //     this.ehealth = temp.data();
      //     this.ehealth.id = temp.id;
      this.ehealth = this.dataservice.getEhealthData();
      if (!this.ehealth.caseResubmission || _.isEmpty(this.ehealth.caseResubmission)) {
        this.ehealth.caseResubmission = {
          date: '',
          comments: '',
        };
      }
      // });
      this.dataservice.dismiss();
      if (this.caseData.caseStatus.length > 0) {
        const lastCaseStatus = this.caseData.caseStatus[this.caseData.caseStatus.length - 1];
        // if (this.caseData.currentStatus === 'Temporary Approval' || this.caseData.currentStatus === 'Rejected') {
        this.caseStatus.date = this.dataservice.formatDateAndMonth(lastCaseStatus.date).split('/')[0];
        // this.caseStatus.status = lastCaseStatus.currentStatus;
        this.caseStatus.status = lastCaseStatus.status;
        this.caseStatus.amendmentSection = lastCaseStatus.amendmentSection;
        this.caseStatus.comments = lastCaseStatus.comments;
        // } else {
        //   this.caseStatus.date = this.changeDateFormat(lastCaseStatus.date);
        //   this.caseStatus.status = lastCaseStatus.status;
        // this.caseStatus.amendmentSection = '-';
        if (this.caseStatus.status === 'Approved') {
          this.caseStatus.comments = this.caseStatus.comments || 'Case approved';
          this.ehealth.caseResubmission.date = '-';
          this.ehealth.caseResubmission.comments = '-';
          this.disableResubmission = true;
        } else if (this.caseStatus.status === 'Resubmitted for approval') {
          this.disableResubmission = true;
        } else if (this.caseStatus.status === 'Pending Approval') {
          this.caseStatus.amendmentSection = [];
          this.caseStatus.comments = '-';
          this.disableResubmission = true;
        } else if (this.caseStatus.status !== 'Temporary Approval' &&
          this.caseStatus.status !== 'Rejected' &&
          this.caseStatus.status !== 'Pending' &&
          this.caseStatus.status !== 'Resubmitted for approval' &&
          this.caseStatus.status !== 'Pending Approval' &&
          this.caseStatus.status !== 'Submitted for approval') {
          this.caseStatus.status = 'Approved';
          this.caseStatus.comments = 'Case approved';
          // ? get date on which case was approved
          const approvalDateArr = _.filter(this.caseData.caseStatus, (o) => {
            if (o.status === 'Approved') {
              return o;
            }
          });
          if (approvalDateArr.length > 0) {
            this.caseStatus.date = this.dataservice.formatDateAndMonth(approvalDateArr[0].date).split('/')[0];
            this.caseStatus.amendmentSection = [];
            this.disableResubmission = true;
            this.ehealth.caseResubmission.date = '-';
            this.ehealth.caseResubmission.comments = '-';
          } else {
            this.disableResubmission = false;
          }
        }
      } else {
        this.caseStatus.status = 'Pending Submission';
        this.caseStatus.amendmentSection = [];
        this.caseStatus.comments = '-';
        this.caseStatus.date = '-';
        this.disableResubmission = true;
      }
      // }
      // }, (err) => {
      //   
      //   this.dataservice.dismiss();
      // });
    });
  }
  public ngOnInit() {
    this.dataservice.mySubscription = this.dataservice.createOnline$().subscribe(async (isOnline) => {
      if (isOnline === false) {
        this.internetCheckFlag = true;
        this.dataservice.toastPresent('Internet disconnected');
        if (!this.reloadAgain) {
          this.dataservice.dismiss();
          this.dataservice.presentAlert('Please check your internet connection!');
        }
      } else if (isOnline === true && this.internetCheckFlag) {
        this.router.routeReuseStrategy.shouldReuseRoute = () => {
          return false;
        };
        if (this.reloadAgain) {
          this.ionViewDidEnter();
        }
        this.dataservice.toastPresent('Internet Connected');
        this.internetCheckFlag = false;
      }
    });
  }
  // tslint:disable-next-line: use-lifecycle-interface
  public ngOnDestroy() {
    if (this.dataservice.mySubscription) {
      this.dataservice.mySubscription.unsubscribe();
    }
  }
  public changeDateFormat(statusDate) {
    // let date;
    // if (statusDate && statusDate.seconds)
    //   date = new Date(statusDate.seconds).toISOString().split('T')[0];
    // else
    //   date = new Date(statusDate).toISOString().split('T')[0];
    // let splittedDate = date.split('-');
    // return splittedDate[2] + '/' + splittedDate[1] + '/' + splittedDate[0];
    let month;
    month = new Date(statusDate).getMonth() + 1 < 10 ? '0' + (new Date(statusDate).getMonth() + 1) : (new Date(statusDate).getMonth() + 1);
    const splittedDate = statusDate.split(' ');
    return splittedDate[2] + '/' + month + '/' + splittedDate[3];
  }
  public openResubmissionModal() {
    const newCaseResubmission = _.cloneDeep(this.ehealth.caseResubmission);
    this.modalCtrl.create({
      component: ResubmissionModalPage,
      componentProps: {
        newCaseResubmission: newCaseResubmission,
      },
      cssClass: 'resubmission-modal',
    }).then((modalEl) => {
      modalEl.present();
      modalEl.onDidDismiss().then((resp) => {
        // 
        // if (resp && resp.data && resp.data.data && resp.data.data !== '') {
        if (resp && resp.role === 'save') {
          this.reloadAgain = false;
          this.dataservice.present().then((loader) => {
            loader.present();
            if (!this.internetCheckFlag) {
              this.firebase.editEhealth(this.ehealth).then(() => {
                let date;
                date = new Date().toString();
                this.caseData.currentStatus = 'Resubmitted for approval';
                const caseStatus: any = {};
                caseStatus.userType = this.loggedInUser.type;
                caseStatus.userId = this.loggedInUser.id;
                caseStatus.date = date;
                caseStatus.status = 'Resubmitted for approval';
                // caseStatus.comments = 'Resubmitted for Approval';
                this.ehealth.caseResubmission.comments = resp.data.comments;
                this.ehealth.caseResubmission.date = this.dataservice.formatMonth(caseStatus.date).split('/')[0];
                caseStatus.comments = this.ehealth.caseResubmission.comments;
                caseStatus.amendmentSection = [];
                caseStatus.signature = '';
                caseStatus.signedBy = '';
                this.caseData.caseStatus.push(caseStatus);
                this.caseData.lastUpdateTimestamp = new Date(date).getTime();
                this.firebase.editCase(this.caseData).then(() => {
                  this.dataservice.setSelectedCase(this.caseData);
                  // ? update this case status in timeline
                  this.updateTimeline(caseStatus.date);
                  this.reloadAgain = true;
                  const heading = 'Success';
                  const text = 'Case Resubmitted Successfully !!';
                  this.dataservice.setEhealthData(this.ehealth);
                  this.dataservice.dismiss();
                  this.dataservice.presentAlert(text);
                });
              }).catch(() => {
                const heading = 'Error';
                const text = 'Case not Resubmitted. Try again !';
                this.dataservice.presentAlertMessage(heading, text);
                this.dataservice.dismiss();
              });
            } else {
              this.dataservice.dismiss();
              this.dataservice.presentAlert('Please check your internet connection!');
            }
          });
        }
      });
    });
  }
  public updateTimeline(date) {
    const timelineStatus: any = {
      date,
      activity: 'Case resubmitted for approval',
      userType: this.loggedInUser.type,
      userId: this.loggedInUser.id,
      caseId: this.caseData.id,
    };
    this.dataservice.updateTimelineData(timelineStatus, this.caseData.clientId);
    // this.firebase.editClientDetails(this.clientTimelineDetails, this.clientTimelineId);
  }
}
