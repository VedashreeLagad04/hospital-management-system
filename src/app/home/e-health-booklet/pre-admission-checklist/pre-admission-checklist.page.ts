/* eslint-disable max-len */
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import * as _ from 'lodash';
import { AppDataService } from 'src/app/services/app-data.service';
import { FirebaseService } from 'src/app/services/firebase.service';
import { environment } from 'src/environments/environment';
@Component({
  selector: 'app-pre-admission-checklist',
  templateUrl: './pre-admission-checklist.page.html',
  styleUrls: ['./pre-admission-checklist.page.scss'],
})
export class PreAdmissionChecklistPage implements OnInit {
  public mode = 'preview';
  public clientId;
  public case;
  public ehealth: any = [];
  public history: any = {};
  public signature = '';
  public latestPreAdmChecklist: any = {};
  public newPreAdmChecklist: any = {};
  public pdfFileName;
  public pdfFileDate;
  public loggedInuser: any;
  public internetCheckFlag = false;
  public activeRouteSubscriber: any;
  clientType = 'new';
  public reloadAgain = true; constructor(private activeRoute: ActivatedRoute,
    private firebase: FirebaseService,
    private dataService: AppDataService,
    private alertCtrl: AlertController,
    private router: Router,
  ) { }
  public ngOnInit() {
    this.dataService.mySubscription = this.dataService.createOnline$().subscribe(async (isOnline) => {
      if (isOnline === false) {
        this.internetCheckFlag = true;
        this.dataService.toastPresent('Internet disconnected');
        if (!this.reloadAgain) {
          this.dataService.dismiss();
          this.dataService.presentAlert('Please check your internet connection!');
        }
      } else if (isOnline === true && this.internetCheckFlag) {
        this.router.routeReuseStrategy.shouldReuseRoute = () => false;
        if (this.reloadAgain) {
          this.ionViewDidEnter();
        }
        this.dataService.toastPresent('Internet Connected');
        this.internetCheckFlag = false;
      }
    });
  }
  // eslint-disable-next-line @angular-eslint/use-lifecycle-interface
  public ngOnDestroy() {
    if (this.dataService.mySubscription) {
      this.dataService.mySubscription.unsubscribe();
    }
  }
  public ionViewDidEnter() {
    this.dataService.present().then((a) => {
      a.present();
      this.mode = 'preview';
      this.activeRouteSubscriber = this.activeRoute.paramMap.subscribe((params) => {
        this.clientId = params.get('id');
        this.loggedInuser = this.dataService.getUserData();
        this.ehealth = this.dataService.getEhealthData();
        const prevCase = this.case;
        this.case = this.dataService.getSelectedCase();
        this.clientType = this.dataService.getAddOfflineClient();
        //
        // this.firebase.getEhealth(this.case.id).subscribe((resp) => {
        //   resp.docs.forEach((temp) => {
        //     this.ehealth = temp.data();
        //     this.ehealth.id = temp.id;
        //
        //   });
        // this.ehealth = this.dataService.getEhealthData();
        console.log('this.ehealth.preAdmissionChecklist: ', this.ehealth.preAdmissionChecklist);
        if (this.ehealth.preAdmissionChecklist && this.ehealth.preAdmissionChecklist.length > 0) {
          const lastIndex = this.ehealth.preAdmissionChecklist.length - 1;
          // this.latestPreAdmChecklist =  JSON.parse((JSON.stringify(this.ehealth.preAdmissionChecklist[lastIndex])));
          this.latestPreAdmChecklist = _.cloneDeep(this.ehealth.preAdmissionChecklist[lastIndex]);
          console.log('this.latestPreAdmChecklist: ', this.latestPreAdmChecklist);
        }
        // else {
        //   this.latestPreAdmChecklist.signature = '';
        //   this.latestPreAdmChecklist.date = '';
        //   this.latestPreAdmChecklist.time = '';
        //   this.latestPreAdmCheckFlist.fileUploadKey = '';
        // }
        // this.dataService.present().then((a) => {
        //   a.present();
        this.firebase.getUserDetails(this.clientId).subscribe((data) => {
          this.history = data.data();
          this.history.id = data.id;
          this.dataService.dismiss();
        }, (err) => {
          this.dataService.dismiss();
        });
      });
    });
    // });
  }
  public submit() {
    this.mode = 'preview';
    if (this.ehealth.profile.consentDetails.nric !== undefined) {
      this.ehealth.profile.consentDetails.nric = this.ehealth.profile.consentDetails.nric.toUpperCase();
    }
    // this.ehealth.profile.consentDetails = this.history.consentDetails;
    this.exportPdf();
  }
  public signForm() {
    // ? if any pre-adm checklist form is previously signed, show below alert
    // ? if pre-adm checklist is not signed, directly open modal
    if (this.ehealth.preAdmissionChecklist && this.ehealth.preAdmissionChecklist.length !== 0) {
      this.dataService.presentReSignFormAlert('Pre-admission checklist').then((resp: any) => {
        this.mode = resp;
        if (resp === 'edit') {
          this.newPreAdmChecklist.signature = '';
          this.latestPreAdmChecklist.signature = '';
          this.newPreAdmChecklist.date = '';
          this.newPreAdmChecklist.time = '';
          this.newPreAdmChecklist.fileUploadKey = '';
          this.newPreAdmChecklist.awsFileName = '';
        }
      });
    } else {
      this.mode = 'edit';
      this.newPreAdmChecklist.signature = '';
      this.newPreAdmChecklist.date = '';
      this.newPreAdmChecklist.time = '';
      this.newPreAdmChecklist.fileUploadKey = '';
      this.newPreAdmChecklist.awsFileName = '';
    }
  }
  public openSignatureModal() {
    if (this.mode === 'edit') {
      // if (_.size(this.latestPreAdmChecklist) === 0) {
      //   this.latestPreAdmChecklist = {
      //     signature: '',
      //     date: '',
      //     time: '',
      //     fileUploadKey: '',
      //   };
      // }
      this.dataService.signatureModal(this.latestPreAdmChecklist.signature).then((resp) => {
        const response: any = resp;
        if (response.status === 'success') {
          const date = new Date();
          const today = this.dataService.formatDateAndMonth(date);
          this.newPreAdmChecklist.signature = response.signature;
          this.newPreAdmChecklist.date = today.split('/')[0];
          this.newPreAdmChecklist.time = today.split('/')[1];
        } else {
          this.newPreAdmChecklist.signature = '';
        }
        const tempPreAdmChecklist = _.cloneDeep(this.newPreAdmChecklist);
        tempPreAdmChecklist.fileUploadKey = this.latestPreAdmChecklist.fileUploadKey;
        tempPreAdmChecklist.awsFileName = this.latestPreAdmChecklist.awsFileName;
        this.pdfFileDate = this.latestPreAdmChecklist.date;
        this.latestPreAdmChecklist = _.cloneDeep(tempPreAdmChecklist);
      });
    }
  }
  public exportPdf() {
    // tslint:disable-next-line: prefer-const
    const pageName = 'Pre_Admission_Checklist';
    this.reloadAgain = false;
    if (!this.internetCheckFlag) {
      // tslint:disable-next-line: max-line-length
      this.dataService.exportPdf('pre-adm-pdf-wrap', this.ehealth.profile.name, environment.aws.bucketAdmissionDocumentsPath, pageName, this.clientId, this.ehealth.caseId, this.latestPreAdmChecklist.fileUploadKey, this.pdfFileDate).then((resp) => {
        const response: any = resp;
        if (response.status === 'success') {
          this.dataService.present().then((loader) => {
            loader.present();
            let date;
            // eslint-disable-next-line prefer-const
            date = new Date();
            const today = this.dataService.formatDateAndMonth(date);
            this.newPreAdmChecklist.fileUploadKey = response.awsFileName;
            this.newPreAdmChecklist.awsFileName = response.awsFileName;
            this.newPreAdmChecklist.date = today.split('/')[0];
            this.latestPreAdmChecklist.fileUploadKey = response.awsFileName;
            this.latestPreAdmChecklist.awsFileName = response.awsFileName;
            this.pdfFileDate = today.split('/')[0];
            this.ehealth.preAdmissionChecklist.push(this.newPreAdmChecklist);
            this.ehealth.checkboxValue.preAdmChecklistTab = true;
            const obj = {
              tabName: 'pre-admission-checklist',
              value: true,
            };
            this.firebase.editEhealth(this.ehealth).then(() => {
              this.dataService.setCheckboxValue(obj);
              this.reloadAgain = true;
              this.dataService.setEhealthData(this.ehealth);
              this.newPreAdmChecklist = {};
              this.dataService.dismiss();
              this.dataService.presentAlert('Pre-admission checklist signed successfully!');
            }).catch(() => {
              this.dataService.dismiss();
            });
          });
        } else {
          this.dataService.presentAlert('Something went wrong while generating pdf');
        }
      });
    } else {
      // loader.dismiss();
      this.dataService.presentAlert('Please check your internet connection!');
    }
  }
  public validateNRIC(str) {
    if (str.length !== 9) {
      return false;
    }
    str = str.toUpperCase();
    let i;
    const icArray = [];
    for (i = 0; i < 9; i++) {
      icArray[i] = str.charAt(i);
    }
    icArray[1] = parseInt(icArray[1], 10) * 2;
    icArray[2] = parseInt(icArray[2], 10) * 7;
    icArray[3] = parseInt(icArray[3], 10) * 6;
    icArray[4] = parseInt(icArray[4], 10) * 5;
    icArray[5] = parseInt(icArray[5], 10) * 4;
    icArray[6] = parseInt(icArray[6], 10) * 3;
    icArray[7] = parseInt(icArray[7], 10) * 2;
    let weight = 0;
    for (i = 1; i < 8; i++) {
      weight += icArray[i];
    }
    const offset = (icArray[0] === 'T' || icArray[0] === 'G') ? 4 : 0;
    const temp = (offset + weight) % 11;
    const st = ['J', 'Z', 'I', 'H', 'G', 'F', 'E', 'D', 'C', 'B', 'A'];
    const fg = ['X', 'W', 'U', 'T', 'R', 'Q', 'P', 'N', 'M', 'L', 'K'];
    let theAlpha;
    if (icArray[0] === 'S' || icArray[0] === 'T') {
      theAlpha = st[temp];
    } else if (icArray[0] === 'F' || icArray[0] === 'G') {
      theAlpha = fg[temp];
    }
    return (icArray[8] === theAlpha);
  }
  public validateNric() {
    // this.validateFlag.Nric = 0;
    let checkIsValid;
    // ? valid nric for demo S6729913B;
    if (this.history.consentDetails.nric !== undefined && this.history.consentDetails.nric.length !== 0) {
      // checkIsValid = this.validateNRIC(this.history.consentDetails.nric);
      // if (!checkIsValid) {
      //   this.dataService.presentAlert('Please enter valid NRIC/FIN');
      // } else {
      this.dataService.presentOnlyLoader().then(a => {
        a.present();
        this.history.consentDetails.nric = this.history.consentDetails.nric.toUpperCase();
        this.firebase.editUser(this.history).then(() => {
          a.dismiss();
          this.exportPdf();
        });
      });
      // }
    } else {
      this.dataService.presentAlert('Please enter NRIC/FIN/Foreign ID');
    }
  }
  public ionViewWillLeave() {
    this.latestPreAdmChecklist.signature = '';
    this.latestPreAdmChecklist.date = '';
    this.latestPreAdmChecklist.time = '';
    this.latestPreAdmChecklist.fileUploadKey = '';
    this.latestPreAdmChecklist.awsFileName = '';
    this.pdfFileDate = '';
  }
  public ionViewDidLeave() {
    this.activeRouteSubscriber.unsubscribe();
  }
}
