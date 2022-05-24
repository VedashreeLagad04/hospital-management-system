import { Component, Input, OnInit } from '@angular/core';
import { AlertController, ModalController } from '@ionic/angular';
import * as _ from 'lodash';
import { AppDataService } from 'src/app/services/app-data.service';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UploadFormModalPage } from '../upload-form-modal/upload-form-modal.page';
@Component({
  selector: 'app-case-update-status',
  templateUrl: './case-update-status.page.html',
  styleUrls: ['./case-update-status.page.scss'],
})
export class CaseUpdateStatusPage implements OnInit {
  @Input() public case: any;
  public status = [
    { value: 'Pending Consultation', allow: true },
    { value: 'Drop off before consultation', allow: false },
    { value: 'Pending Admission', allow: true },
    { value: 'Drop off after consultation', allow: false },
    { value: 'Admitted', allow: false },
    { value: 'Discharge', allow: false },
    { value: 'Pending Follow Up', allow: false },
    { value: 'Open Date', allow: false },
    { value: 'Outpatient', allow: true },
  ];
  public newStatus = '';
  public changeStatusFlag = false;
  public selectedStatus = 'Select';
  public showStatusDropdown: boolean;
  public showRejectReasonDropdown: boolean;
  public isClientRejected: boolean;
  public selectedReason: any;
  public loggedInUser: any;
  public date: any;
  public caseStatus: any = {
    date: '',
    status: '',
    userType: '',
    userId: '',
  };
  public clientTimelineId: string;
  public isStatusSelected: boolean;
  public admissionDateTime: any = {};
  public check = false;
  // public statusDate = '';
  admissionSnapshotSub: any;
  dropOffReason = '';
  constructor(private modalCtrl: ModalController,
    private dataService: AppDataService,
    private firebase: FirebaseService,
    private alertController: AlertController) {
  }
  public ngOnInit() {
    this.loggedInUser = this.dataService.getUserData();
    const index = this.case.caseStatus.length - 1;
    this.caseStatus.status = this.case.caseStatus[index].status;
    this.date = new Date().toString();
    // ! 10/11/2020 is not a valid format for ion-datetime
    // ? 10-11-2020 is a valid date, hence used this format.
    // ? to display this date as 10/11/2020; use displayFormat attribute of ion-datetime
    // this.statusDate = this.date.split(' ')[2] + '/' + this.date.split(' ')[1] + '/' + this.date.split(' ')[3];
    this.admissionDateTime.date = this.date.split(' ')[2] + '-' + this.date.split(' ')[1] + '-' + this.date.split(' ')[3];
    this.admissionDateTime.time = this.date.toLocaleString('en-SG', { hour: 'numeric', minute: 'numeric', hour12: true }).split(' ')[4];
    // this.admissionDateTime.time = this.date.toLocaleString('en-IN', { hour: 'numeric', minute: 'numeric', hour12: true });
    // this.caseStatus.comment = this.case.caseStatus[index].comment;
    if (this.case.currentStatus === 'Approved') {
      this.caseStatus.status = 'Pending Appointment';
      this.newStatus = this.case.currentStatus;
    } else {
      const find = _.find(this.status, ['value', this.case.currentStatus]);
      this.agentSelectStatus(find);
      this.changeAllow(find);
      // if (this.case.currentStatus === 'Approved') {
      //   this.caseStatus.status = 'Pending Appointment';
      this.admissionSnapshotSub = this.firebase.getAdmission(this.case.id).subscribe((resp) => {
        let data;
        if (resp && resp.length !== 0) {
          data = resp[0];
          if (this.case.currentStatus === 'Admitted') {
            this.admissionDateTime.date = data.case.admissionDate;
            this.admissionDateTime.time = data.case.admissionTime;
          }
        } else if (this.case.currentStatus === 'Discharged') {
          this.admissionDateTime.date = data.case.dischargeDate;
          this.admissionDateTime.time = data.case.dischargeTime;
        }
      });
    }
  }
  public dismiss(status) {
    this.modalCtrl.dismiss({
      data: status,
    });
  }
  // ?this.signature = this.signaturePad.toDataURL();
  // *use above code to store sign
  public openStatusDropdown() {
    this.showStatusDropdown = !this.showStatusDropdown;
  }
  public openRejectReasonDropdown() {
    this.showRejectReasonDropdown = !this.showRejectReasonDropdown;
  }
  public agentSelectStatus(status) {
    this.newStatus = status.value;
    if (this.newStatus !== this.case.currentStatus) {
      this.changeStatusFlag = true;
      this.case.currentStatus = status.value;
      this.caseStatus.status = status.value;
      this.showStatusDropdown = false;
      this.isStatusSelected = true;
      this.isClientRejected = false;
      // this.selectedReason = '';
      this.caseStatus.rejectionReason = '';
    } else {
      this.changeStatusFlag = false;
    }
    this.date = new Date().toString();
    // ! 10/11/2020 is not a valid format for ion-datetime
    // ? 10-11-2020 is a valid date, hence used this format.
    // ? to display this date as 10/11/2020; use displayFormat attribute of ion-datetime
    // this.statusDate = this.date.split(' ')[2] + '/' + this.date.split(' ')[1] + '/' + this.date.split(' ')[3];
    this.admissionDateTime.date = this.date.split(' ')[2] + '-' + this.date.split(' ')[1] + '-' + this.date.split(' ')[3];
    this.admissionDateTime.time = this.date.toLocaleString('en-SG', { hour: 'numeric', minute: 'numeric', hour12: true }).split(' ')[4];
  }
  public changeAllow(status) {
    if (status.value === 'Admitted') {
      this.status[0].allow = false;
      this.status[1].allow = false;
      this.status[2].allow = false;
      this.status[3].allow = false;
      this.status[5].allow = true;
    } else if (status.value === 'Discharge') {
      this.status[0].allow = false;
      this.status[1].allow = false;
      this.status[2].allow = false;
      this.status[3].allow = false;
      this.status[4].allow = false;
      this.status[5].allow = true;
      this.status[6].allow = true;
    } else if (status.value === 'Pending Follow Up') {
      this.status[7].allow = true;
      this.status[6].allow = true;
      this.status[5].allow = true;
    } else if (status.value === 'Pending Consultation') {
      this.status[1].allow = true;
    } else if (status.value === 'Pending Admission') {
      this.status[1].allow = true;
      this.status[3].allow = true;
      this.status[4].allow = true;
    }
  }
  public selectReason(reason) {
    this.selectedReason = reason;
    this.showRejectReasonDropdown = false;
  }
  public updateStatus() {
    this.dataService.present().then((loader) => {
      loader.present();
      if (this.changeStatusFlag) {
        if (this.newStatus === 'Drop off before consultation' || this.newStatus === 'Drop off after consultation') {
          if (this.dropOffReason === '') {
            this.dataService.presentAlert('Please enter drop off reason');
            this.dataService.dismiss();
          } else {
            this.case.dropOffReason = this.dropOffReason;
            this.updateByAgent();
          }
        } else {
          this.updateByAgent();
        }
      } else {
        this.dataService.dismiss();
        this.dismiss(false);
      }
    });
  }
  public async updateByAgent() {
    this.caseStatus.userType = this.loggedInUser.type;
    this.caseStatus.userId = this.loggedInUser.id;
    this.caseStatus.date = this.date;
    this.case.lastUpdateTimestamp = new Date(this.date).getTime();
    this.case.currentStatus = this.caseStatus.status;
    this.case.caseStatus.push(this.caseStatus);
    // ? update case status in case collection
    this.firebase.editCase(this.case).then(() => {
      this.dataService.setSelectedCase(this.case);
      // ? update this case status in timeline
      this.updateTimeline();
      if (this.case.currentStatus === 'Admitted') {
        this.dataService.dismiss();
        this.presentAlertUpload();
      } else if (this.case.currentStatus === 'Discharge') {
        this.dataService.dismiss();
        this.dismiss(true);
        this.checkAdmissionArray(this.admissionDateTime.date, this.admissionDateTime.time, 'discharge');
        // this.dataService.routeChange('client-case-folders/discharge-docs-checklist');
      } else {
        this.dataService.dismiss();
        this.dismiss(true);
      }
    });
  }
  public async presentAlertUpload() {
    return new Promise(async (resolve) => {
      const alert = await this.alertController.create({
        header: 'Case Status Updated',
        message: 'You can upload document now or skip to do it later',
        cssClass: 'alertDiv',
        buttons: [
          {
            text: 'Upload',
            role: 'ok',
            cssClass: 'secondary',
            handler: (ok) => {
              this.uploadModal();
              resolve('ok');
              // this.dismiss(true);
              //
            },
          }, {
            text: 'Skip',
            handler: (skip) => {
              if (this.check) {
                this.checkAdmissionArray(this.admissionDateTime.date, this.admissionDateTime.time, 'admission');
              } else {
                this.checkAdmissionArray('', '', 'admission');
              }
              // this.dismiss(true);
              resolve(skip);
            },
          },
        ],
      });
      await alert.present();
    });
  }
  public checkAdmissionArray(date, time, type) {
    let isCaseDetailsClicked = true;
    let admission: any;
    let dateChange = '';
    const newtime = '';
    let newDate: any;
    if (date.length !== 0) {
      newDate = new Date(date).toString();
      dateChange = newDate.split(' ')[2] + ' ' + newDate.split(' ')[1] + ' ' + newDate.split(' ')[3];
    } else {
      newDate = new Date().toString();
      dateChange = newDate.split(' ')[2] + ' ' + newDate.split(' ')[1] + ' ' + newDate.split(' ')[3];
      // time = newDate.split(' ')[4];
      time = newDate.toLocaleString('en-SG', { hour: 'numeric', minute: 'numeric', hour12: true }).split(' ')[4];
    }
    /*if (time.length !== 0) {
      const hh = time.split(':')[0];
      let h; let dd = 'AM';
      if (hh >= 12) {
        h = hh - 12;
        dd = 'PM';
      }
      if (h === 0) {
        h = 12;
      }
      newtime = h + ':' + time.split(':')[1] + dd;
    } else {
      newtime = '';
    }*/
    this.firebase.getAdmissionOnce(this.case.id).subscribe((resp) => {
      if (resp.docs && resp.docs.length > 0) {
        admission = resp.docs[0].data();
        admission.admissionId = resp.docs[0].id;
        // if (resp && resp.length) {
        //   admission = resp[0];
        if (type === 'admission') {
          admission.case.admissionDate = dateChange;
          admission.case.admissionDateTimestamp = new Date(newDate).getTime();
          admission.case.admissionTime = time;
        } else {
          admission.case.dischargeDate = dateChange;
          admission.case.dischargeTime = time;
        }
      }
      if (!admission) {
        admission = {
          caseId: this.case.id,
          case: {
            // admissionInfo: [
            //   {
            admissionNumber: '',
            hospitalCaseName: '',
            diagnosis: '',
            facilities: '',
            surgicalCodes: [{ code: '-' }],
            //   }
            // ],
            patientType: '',
            admissionDate: dateChange,
            admissionTime: time,
            admissionDateTimestamp: new Date(newDate).getTime(),
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
        // if (admission.case.admissionNumber && admission.case.admissionNumber === '') {
        if (admission.case.admissionNumber === '') {
          if (isCaseDetailsClicked) {
            isCaseDetailsClicked = false;
            this.firebase.getLastAdmissionId().then((response) => {
              admission.case.admissionNumber = response;
              this.firebase.addAdmission(admission).then((res) => {
                if (res.id) {
                  admission.admissionId = res.id;
                  this.dataService.setAdmissionData(admission);
                  // if (isCaseDetailsClicked) {
                  this.dismiss(true);
                  this.dataService.routeChange('/client-case-details/case');
                }
              });
            });
          } else {
          }
        }
      } else {
        this.firebase.editAdmission(admission).then(() => {
          sessionStorage.setItem('admissionData', JSON.stringify(admission));
          this.dismiss(true);
          if (isCaseDetailsClicked) {
            isCaseDetailsClicked = false;
            if (type === 'admission') {
              this.dataService.routeChange('/client-case-details/case');
            }
            if (type === 'discharge') {
              this.dataService.routeChange('client-case-folders/discharge-docs-checklist');
            }
          }
        }).catch((err) => {
          this.dismiss(true);
        });
      }
    });
  }
  public changeDateFormat(date) {
    /* const newdate = new Date (date);
    const dateToString = newdate.toString();
    this.admissionDateTime.date = dateToString.split(' ')[2] + ' ' + dateToString.split(' ')[1] + ', ' +
      dateToString.split(' ')[3]; */
  }
  async uploadModal() {
    const modalUploadPage = await this.modalCtrl.create({
      component: UploadFormModalPage,
      backdropDismiss: false,
      cssClass: 'updateForm-modal',
      componentProps: {
        case: this.case,
        // previous: prevData
        // ? data you want to send to modal
      },
    });
    modalUploadPage.onDidDismiss().then((resp) => {
      if (resp.data.data) {
        // this.dataService.dismiss();
        if (this.check) {
          this.checkAdmissionArray(this.admissionDateTime.date, this.admissionDateTime.time, 'admission');
          // this.dataService.routeChange('client-case-details/case');
        } else {
          this.checkAdmissionArray('', '', 'admission');
          // this.dataService.routeChange('client-case-details/case');
        }
      }
    });
    modalUploadPage.present();
  }
  public updateTimeline() {
    if (!this.case.caseId) {
      this.case.caseId = this.case.id;
    }
    const timelineStatus: any = {
      date: this.date,
      activity: 'Case Status ' + this.case.currentStatus,
      userType: this.loggedInUser.type,
      userId: this.loggedInUser.id,
      caseId: this.case.caseId,
    };
    this.dataService.updateTimelineData(timelineStatus, this.case.clientId);
    // this.firebase.editClientDetails(this.clientTimelineDetails, this.clientTimelineId);
  }
  ionViewWillLeave() {
    if (this.admissionSnapshotSub) {
      this.admissionSnapshotSub.unsubscribe();
    }
  }
}
