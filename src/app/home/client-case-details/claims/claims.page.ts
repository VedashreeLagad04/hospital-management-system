/* eslint-disable max-len */
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AlertController, LoadingController, ModalController } from '@ionic/angular';
import * as _ from 'lodash';
import { AppDataService } from 'src/app/services/app-data.service';
import { AwsService } from 'src/app/services/aws.service';
import { FirebaseService } from 'src/app/services/firebase.service';
import { environment } from 'src/environments/environment';
import { EditDocumentFileNamesPage } from '../../edit-document-file-names/edit-document-file-names.page';
@Component({
  selector: 'app-claims',
  templateUrl: './claims.page.html',
  styleUrls: ['./claims.page.scss'],
})
export class ClaimsPage implements OnInit {
  nameToSearch = '';
  public mode = 'preview';
  public allClaimsStatus = [];
  public allZeroizedTypes = [];
  public admission;
  public noOfDaysSinceDischarge;
  public ehealthPolicy = [];
  // ? clientId is required for file upload in modal
  public clientId = '';
  public fileToUpload = [];
  public uploadProgress: any = 0;
  public uploadPercent = 0;
  public loader: any;
  public clientInitials: any;
  public policyName;
  public insurerDetails = [];
  public caseData: any;
  @ViewChild('uploadBtn', { static: false }) public uploadBtn: ElementRef;
  constructor(public dataService: AppDataService,
    private firebaseService: FirebaseService,
    private modalController: ModalController,
    private awsService: AwsService,
    private alertCtrl: AlertController,
    private loadingCtrl: LoadingController) { }
  // tslint:disable-next-line: use-lifecycle-interface
  public ngAfterViewInit() {
    this.dataService.present().then((loader) => {
      loader.present();
      // ? publish the header title you want to display in header
      const obj = {
        title: 'Case Details',
        backPage: '/client-case-profile',
      };
      this.dataService.setHeaderTitle(obj);
      this.caseData = this.dataService.getSelectedCase();
      this.clientId = this.caseData.clientId;
      const clientData = this.dataService.getPatientData();
      this.clientInitials = this.dataService.getClientNameInitials(clientData.name);
      this.admission = this.dataService.getAdmissionData();
      if (this.admission.policy.length > this.admission.claims.length) {
        // tslint:disable-next-line: prefer-for-of
        for (let i = this.admission.claims.length; i < this.admission.policy.length; i++) {
          this.admission.claims.push({
            policyType: this.admission.policy[i].nameOfPolicy,
            policyName: '',
            claimLastDate: '',
            amountMedisave: '',
            amountInsurer: '',
            amountCash: '',
            claimsStatus: '',
            zeroized: '',
            approveAmount: '',
            approvedDate: '',
            zeroizedDate: '',
            remarks: '',
            totalHospitalBill: this.admission.revenue.hospitalBill,
            toUploadFile: false,
          });
        }
      }
      // }
      // tslint:disable-next-line: prefer-for-of
      for (let i = 0; i < this.admission.claims.length; i++) {
        if ((!this.admission.policy[i].nameOfBasic || this.admission.policy[i].nameOfBasic === '') && (!this.admission.policy[i].nameOfRider || this.admission.policy[i].nameOfRider === '-')) {
          this.admission.claims[i].policyName = '-';
        } else if (this.admission.policy[i].nameOfBasic !== '' && (!this.admission.policy[i].nameOfRider || this.admission.policy[i].nameOfRider === '-')) {
          this.admission.claims[i].policyName = this.admission.policy[i].nameOfBasic;
        } else if (this.admission.policy[i].nameOfBasic !== '' && (this.admission.policy[i].nameOfRider && this.admission.policy[i].nameOfRider !== '-')) {
          this.admission.claims[i].policyName = this.admission.policy[i].nameOfBasic + ' + ' + this.admission.policy[i].nameOfRider;
        }
        // ? policy type is not added in old claims
        // ? hence check and add here
        this.admission.claims[i].policyType = _.size(this.admission.claims[i].policyType) === 0 ? this.admission.policy[i].nameOfPolicy : this.admission.claims[i].policyType;
        this.admission.claims[i].claimsStatus = _.size(this.admission.claims[i].claimsStatus) > 0 ? this.admission.claims[i].claimsStatus : 'Pending';
        this.admission.claims[i].showStatusDropdown = false;
        if (this.admission.claims[i].zeroized !== undefined) {
          this.admission.claims[i].zeroized = _.size(this.admission.claims[i].zeroized) > 0 ? this.admission.claims[i].zeroized : 'Pending';
          this.admission.claims[i].zeroizedDate = (_.size(this.admission.claims[i].zeroizedDate) === 0 && this.admission.claims[i].zeroized === 'Full') ?
            this.dataService.formatDateAndMonth(new Date()).split('/')[0] : this.admission.claims[i].zeroizedDate;
          this.admission.claims[i].showZeroizedDropdown = false;
        }
        if (this.admission.claims[i].fileUploadKey) {
        }
      }
      this.admission.claims[0].totalHospitalBill = this.admission.revenue.hospitalBill;
      if (this.admission.case.dischargeDate &&
        this.admission.case.dischargeDate !== '' &&
        (new Date(this.admission.case.dischargeDate + ' ' + this.admission.case.dischargeTime) < (new Date()))) {
        this.getNumberOfDaysSinceDischarge();
      } else {
        this.noOfDaysSinceDischarge = '-';
      }
      this.getDropdownValues();
      this.getInsurerDetails();
      this.dataService.dismiss();
    });
  }
  getDropdownValues() {
    this.firebaseService.getClaimsStatus().subscribe((resp: any) => {
      this.allClaimsStatus = [];
      if (resp.size > 0) {
        _.forEach(resp.docs, (doc) => {
          this.allClaimsStatus.push({ status: doc.data().status, show: true });
        });
      } else {
        this.allClaimsStatus = [
          {
            status: 'Pending',
            show: true
          },
          {
            status: 'Partial Approval',
            show: true
          },
          {
            status: 'Approved',
            show: true
          },
          {
            status: 'Close with partial approval',
            show: true
          },
        ];
      }
    });
    this.firebaseService.getClaimsZeroized().subscribe((resp: any) => {
      this.allZeroizedTypes = [];
      if (resp.size > 0) {
        _.forEach(resp.docs, (doc) => {
          this.allZeroizedTypes.push({ status: doc.data().status, show: true });
        });
      } else {
        this.allZeroizedTypes = [
          {
            status: 'Pending',
            show: true
          },
          {
            status: 'Partial',
            show: true
          },
          {
            status: 'Full',
            show: true
          }
        ];
      }
    });
  }
  public ngOnInit() {
  }
  public getNumberOfDaysSinceDischarge() {
    let dischargeDate = this.admission.case.dischargeDate;
    let dischargeTime = this.admission.case.dischargeTime;
    dischargeDate = new Date(dischargeDate + ' ' + dischargeTime);
    let today;
    today = new Date();
    const oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
    this.noOfDaysSinceDischarge = Math.round(Math.abs((dischargeDate - today) / oneDay));
    return;
  }
  public changeMode() {
    this.mode = (this.mode === 'preview') ? 'edit' : 'preview';
  }
  public openDropdown(policy, type) {
    this.nameToSearch = '';
    this.allClaimsStatus = this.dataService.searchFromDropdownList(this.allClaimsStatus, this.nameToSearch, 'status');
    this.allZeroizedTypes = this.dataService.searchFromDropdownList(this.allZeroizedTypes, this.nameToSearch, 'status');
    if (type === 'claim-status') {
      policy.showStatusDropdown = !policy.showStatusDropdown;
    } else if (type === 'zeroized') {
      policy.showZeroizedDropdown = !policy.showZeroizedDropdown;
    }
  }
  public selectFromDropdown(policy, value, type) {
    if (type === 'claim-status') {
      if (value === 'Approved' || value === 'Partial Approval' || value === 'Close with partial approval') {
        // tslint:disable-next-line: one-variable-per-declaration
        let date: Date, approvedDate;
        date = new Date();
        const today = this.dataService.formatDateAndMonth(date);
        approvedDate = today.split('/')[0];
        policy.approvedDate = approvedDate;
      } else {
        policy.approvedDate = '';
      }
      policy.claimsStatus = value;
      policy.showStatusDropdown = false;
    } else if (type === 'zeroized') {
      policy.zeroized = value;
      if (value === 'Full') {
        // tslint:disable-next-line: one-variable-per-declaration
        let date: Date, zeroizedDate;
        date = new Date();
        const today = this.dataService.formatDateAndMonth(date);
        zeroizedDate = today.split('/')[0];
        policy.zeroizedDate = zeroizedDate;
      } else {
        policy.zeroizedDate = '';
      }
      policy.showZeroizedDropdown = false;
    }
  }
  public saveChanges() {
    this.dataService.present().then((loader) => {
      loader.present();
      const toUploadArr = _.filter(this.admission.claims, (claim) => {
        if (claim.toUploadFile && (!claim.fileUploadKey || claim.fileUploadKey === '')) {
          return claim.toUploadFile = true;
        }
      });
      if (toUploadArr.length > 0) {
        this.dataService.dismiss();
        // ? show prompt to upload file
        this.showUploadFileAlert();
      } else {
        this.addToFirebase();
      }
    });
  }
  public fileClick() {
    this.uploadBtn.nativeElement.value = '';
  }
  public showUploadFileAlert() {
    this.alertCtrl.create({
      header: 'Upload file',
      message: 'You can upload document now or skip to do it later',
      buttons: [
        {
          text: 'Upload now',
          handler: () => {
            this.uploadBtn.nativeElement.click();
          },
        }, {
          text: 'Cancel',
          role: 'cancel',
        },
      ],
    }).then((alertEl) => {
      alertEl.present();
    });
  }
  public addToFirebase() {
    // tslint:disable-next-line: prefer-for-of
    for (let i = 0; i < this.admission.claims.length; i++) {
      delete this.admission.claims[i].showStatusDropdown;
      if (this.admission.claims[i].zeroized) {
        delete this.admission.claims[i].showZeroizedDropdown;
      }
    }
    for (let i = 0; i < this.admission.policy.length; i++) {
      delete this.admission.policy[i].claimPeriodType;
      delete this.admission.policy[i].claimPeriod;
    }
    this.mode = 'preview';
    const msg = 'Claims information';
    this.dataService.saveAdmissionDataToFirebase(this.admission, msg);
  }
  public selectToUploadFile(event, policy) {
    policy.toUploadFile = event.target.checked;
  }
  public uploadFiles(event, index) {
    if (event.target.files.length > 0) {
      this.dataService.present().then((loader) => {
        loader.present();
        this.loader = loader;
        let date;
        date = new Date();
        const year = date.getFullYear();
        let month = date.getMonth();
        month = month + 1;
        if (month < 10) {
          month = '0' + month;
        }
        let day = date.getDate();
        if (day < 10) {
          day = '0' + day;
        }
        const M = date.toDateString().substr(4, 3);
        const filename = year + '' + month + '' + day + '_'
          + this.admission.claims[index].policyType.replace(/[!&\/\\#., +=^()$~%'":*?<>{}]/g, '_')
          + '_Manual_Claims_Form_Submission_'
          + this.clientInitials + '.pdf';
        const fileObjectToUpload = {
          body: '',
          name: '',
          size: 0,
          key: '',
          arrayBuffer: null,
        };
        fileObjectToUpload.body = event.target.files[0];
        fileObjectToUpload.name = event.target.files[0].name;
        fileObjectToUpload.size = event.target.files[0].size;
        fileObjectToUpload.key = environment.aws.bucketRootKey + '/'
          + this.clientId + '/'
          + this.admission.caseId + '/'
          + environment.aws.bucketClaimDocumentsPath + '/'
          + filename;
        fileObjectToUpload.arrayBuffer = event.target.files[0];
        this.fileToUpload.push(fileObjectToUpload);
        // ? when uploading multiple pdf for same policy
        // ? delete previous pdf and replace it with new pdf
        if (this.admission.claims[index].fileUploadKey && this.admission.claims[index].fileUploadKey !== '') {
          // ? delete here
          this.awsService.deleteFileAWS(this.admission.claims[index].fileUploadKey).then(() => {
            this.admission.claims[index].fileUploadKey = fileObjectToUpload.key;
            this.admission.claims[index].fileUploadDate = date.toString();
            this.admission.claims[index].showFileUploadDate = this.dataService.formatDateAndMonth(date).split('/')[0];
            this.uploadFilesToAWS(index);
          });
        } else {
          this.admission.claims[index].fileUploadKey = fileObjectToUpload.key;
          this.admission.claims[index].fileUploadDate = date.toString();
          this.admission.claims[index].showFileUploadDate = this.dataService.formatDateAndMonth(date).split('/')[0];
          this.uploadFilesToAWS(index);
        }
      });
    }
  }
  public uploadFilesToAWS(policyIndex) {
    this.awsService.uploadFilesAWS(this.fileToUpload, (data: any) => {
      this.fileToUpload = [];
      this.admission.claims[policyIndex].toUploadFile = true;
      this.caseData.caseFolders.claims = new Date().toString();
      this.firebaseService.editCase(this.caseData).then((resp) => {
        this.dataService.setSelectedCase(this.caseData);
        this.dataService.dismiss();
      });
    }, (err) => {
      this.dataService.dismiss();
    }, (progress) => {
      this.uploadPercent = Math.ceil(progress.uploadedPercent);
      this.uploadProgress = this.uploadPercent / 100;
      // tslint:disable-next-line: max-line-length
      const progressVal = '<span class="upload-percent">Uploading... ' + this.uploadPercent + ' %</span>';
      this.loader.message = progressVal;
    });
  }
  public openModal(docs: any, index) {
    this.modalController.create({
      component: EditDocumentFileNamesPage,
      cssClass: 'edit-doc-filename-modal-css',
      componentProps: {
        admission: this.admission,
        file: docs,
        index,
        clientId: this.clientId,
      },
    }).then((modal) => {
      modal.present();
      modal.onDidDismiss().then((response) => {
      });
    });
  }
  public calculateCash() {
    const totalHospitalBill = this.admission.claims[0].totalHospitalBill.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');
    let amountInsurer = this.admission.claims[0].amountInsurer.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');
    let amountMedisave = this.admission.claims[0].amountMedisave.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');
    amountInsurer = amountInsurer === '' ? '0' : amountInsurer;
    amountMedisave = amountMedisave === '' ? '0' : amountMedisave;
    const cashVal = ((parseFloat(totalHospitalBill) - parseFloat(amountInsurer)).toFixed(2));
    // tslint:disable-next-line: max-line-length
    const amountCash = (parseFloat(cashVal) - parseFloat(amountMedisave)).toFixed(2);
    this.admission.claims[0].amountCash = this.formatInput(amountCash);
  }
  public calculateApproveAmt() {
    // tslint:disable-next-line: max-line-length
    for (let i = 1; i < this.admission.claims.length; i++) {
      const amountMedisave = this.admission.claims[i].amountMedisave.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');
      const amountCash = this.admission.claims[i].amountCash.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');
      let approveAmount = this.admission.claims[i].approveAmount.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');
      if (amountMedisave && amountCash) {
        approveAmount = parseFloat(amountCash) + parseFloat(amountMedisave);
      } else if (amountMedisave && !amountCash) {
        approveAmount = amountMedisave;
      } else if (!amountMedisave && amountCash) {
        approveAmount = amountCash;
      } else {
        approveAmount = '';
      }
      approveAmount = approveAmount.toFixed(2);
      this.admission.claims[i].approveAmount = this.formatInput(approveAmount);
    }
  }
  public getInsurerDetails() {
    this.firebaseService.getInsurer().subscribe((resp) => {
      const data = [];
      if (resp.size !== 0) {
        resp.docs.forEach((element) => {
          const temp: any = element.data();
          temp.id = element.id;
          data.push(temp);
        });
        const insurerDetails = [];
        _.forEach(this.admission.policy, (policy) => {
          const insurerDoc = _.find(data, (o) => {
            if (policy.insurer === o.insurer && policy.typeOfPolicy === o.mainPlanName) {
              return o;
            }
          });
          if (_.size(insurerDoc) > 0) {
            policy.claimPeriod = insurerDoc.claimPeriod;
            policy.claimPeriodType = insurerDoc.claimPeriodType;
          }
        });
        this.insurerDetails = insurerDetails;
      }
      this.getLastClaimDates();
    });
  }
  public getLastClaimDates() {
    let noOfMonthsToAdd = 6;
    let noOfDaysToAdd;
    _.forEach(this.admission.policy, (policy, el) => {
      let date: any;
      if (this.admission.case.dischargeDate && this.admission.case.dischargeDate !== '') {
        date = new Date(this.admission.case.dischargeDate + ' ' + this.admission.case.dischargeTime);
      } else {
        date = new Date();
      }
      if (policy.claimPeriodType === 'days') {
        noOfDaysToAdd = policy.claimPeriod;
        if (noOfDaysToAdd !== 0) {
          date.setDate(date.getDate() + noOfDaysToAdd);
        } else {
          date.setMonth(date.getMonth() + + noOfMonthsToAdd);
        }
      } else {
        noOfMonthsToAdd = policy.claimPeriod || 6;
        date.setMonth(date.getMonth() + + noOfMonthsToAdd);
      }
      this.admission.claims[el].claimLastDate = this.dataService.formatDateAndMonth(date).split('/')[0];
    });
    return;
  }
  public trimInput() {
    for (let i = 0; i < this.admission.claims.length; i++) {
      if (this.admission.claims[i].amountCash !== '') {
        const temp = this.admission.claims[i].amountCash.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');
        const amount = parseFloat(temp).toFixed(2);
        this.admission.claims[i].amountCash = this.formatInput(amount);
      }
      if (this.admission.claims[i].amountInsurer !== '') {
        const temp = this.admission.claims[i].amountInsurer.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');
        const amount = parseFloat(temp).toFixed(2);
        this.admission.claims[i].amountInsurer = this.formatInput(amount);
      }
      if (this.admission.claims[i].amountMedisave !== '') {
        const temp = this.admission.claims[i].amountMedisave.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');
        const amount = parseFloat(temp).toFixed(2);
        this.admission.claims[i].amountMedisave = this.formatInput(amount);
      }
      if (this.admission.claims[i].approveAmount !== '') {
        const temp = this.admission.claims[i].approveAmount.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');
        const amount = parseFloat(temp).toFixed(2);
        this.admission.claims[i].approveAmount = this.formatInput(amount);
      }
    }
  }
  public formatInput(amt) {
    var parts = amt.toString().split(".");
    return parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") + (parts[1] ? "." + parts[1] : "");
  }
}
