/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/prefer-for-of */
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController, ModalController } from '@ionic/angular';
import * as _ from 'lodash';
import { AppDataService } from 'src/app/services/app-data.service';
import { FirebaseService } from 'src/app/services/firebase.service';
import { environment } from 'src/environments/environment';
// tslint:disable-next-line: max-line-length
import { ClientRegistrationTermsModalPage } from '../../client-registration/client-registration-terms-modal/client-registration-terms-modal.page';
import { SignatureModalPage } from '../../signature-modal/signature-modal.page';
@Component({
  selector: 'app-preview',
  templateUrl: './preview.page.html',
  styleUrls: ['./preview.page.scss'],
})
export class PreviewPage implements OnInit {
  public clientId;
  public case;
  public age;
  public mode = 'preview';
  public loggedInuser;
  public ehealth: any = {};
  public signature;
  public pdfFilename;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  public MedicalConditions: any = {};
  public pdf: any = {
    name: '',
    nric: '',
    signature: '',
    date: '',
    time: '',
  };
  public pdfFileName;
  public pdfFileDate;
  public activeRouteSubscriber;
  public internetCheckFlag = false;
  public reloadAgain = true;
  clientType = 'new';
  constructor(private activeRoute: ActivatedRoute,
    private firebase: FirebaseService,
    private dataService: AppDataService,
    private modalCtrl: ModalController,
    private alertCtrl: AlertController, private router: Router, private changedetect: ChangeDetectorRef) { }
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
        document.getElementById('preview-container').scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'start' });
        this.clientId = params.get('id');
        this.case = this.dataService.getSelectedCase();
        this.clientType = this.dataService.getAddOfflineClient();
        this.firebase.getMedicalId(this.case.id).subscribe((resp) => {
          resp.docs.forEach((temp) => {
            this.MedicalConditions = temp.data();
            this.MedicalConditions.id = temp.id;
          });
        });
        this.loggedInuser = this.dataService.getUserData();
        // this.firebase.getEhealth(this.case.id).subscribe((resp) => {
        //   resp.docs.forEach((temp) => {
        //     this.ehealth = temp.data();
        //     this.ehealth.id = temp.id;
        //
        //   });
        this.ehealth = this.dataService.getEhealthData();
        const date = new Date(this.ehealth.profile.dateOfBirth);
        this.calculateAge(date);
        if (_.size(this.ehealth.preview) === 0) {
          this.ehealth.preview = {
            signatureFlag: false,
            profile: this.ehealth.profile,
            case: this.ehealth.case,
            activePolicies: this.ehealth.activePolicies,
            preExistingCondition: this.ehealth.preExistingCondition,
            // eslint-disable-next-line @typescript-eslint/naming-convention
            MedicalConditions: {
              orthopaedic: this.MedicalConditions.orthopaedic,
              gastroenterology: this.MedicalConditions.gastroenterology,
              cardiology: this.MedicalConditions.cardiology,
              gynaecology: this.MedicalConditions.gynaecology,
              urology: this.MedicalConditions.urology,
              ent: this.MedicalConditions.ent,
              general: this.MedicalConditions.general,
              respiratory: this.MedicalConditions.respiratory,
            },
            pdfFiles: [],
          };
        }
        if (this.ehealth.preview.pdfFiles && this.ehealth.preview.pdfFiles.length > 0) {
          const lastIndex = this.ehealth.preview.pdfFiles.length - 1;
          if (this.ehealth.preview.signatureFlag === true) {
            this.pdf = {
              signature: '',
              date: '',
              time: '',
            };
          } else {
            const dateTimeObj = this.dataService.getDateAndTimeOfPdfUpload(this.ehealth.preview.pdfFiles[lastIndex].date);
            this.pdf.date = dateTimeObj.date;
            this.pdf.time = dateTimeObj.time;
            this.pdf.signature = this.ehealth.preview.pdfFiles[lastIndex].signature;
            this.pdf.name = this.ehealth.preview.pdfFiles[lastIndex].name;
            this.pdf.nric = this.ehealth.preview.pdfFiles[lastIndex].nric;
            this.pdf.guardian = this.ehealth.profile.guardian;
          }
          // ! check filename, if filename already present add (1) to it
          // ? eg. 20200825 Travel Declaration PK.pdf is already present, make it 20200825 Travel Declaration PK(1).pdf
          this.pdfFileName = this.ehealth.preview.pdfFiles[lastIndex].fileKey;
          this.pdfFileDate = this.ehealth.preview.pdfFiles[lastIndex].date;
        }
        // ! get all pdfs with 'preview' in its name from aws;
        // ! and then pass it to exportPdf()
        for (let i = 0; i < this.ehealth.preview.activePolicies.length; i++) {
          if (this.ehealth.preview.activePolicies[i].mainInceptionDate !== '') {
            this.ehealth.preview.activePolicies[i].mainInceptionDate = this.dataService.formatMonth(this.ehealth.preview.activePolicies[i].mainInceptionDate);
          }
          if (this.ehealth.preview.activePolicies[i].mainPaidDate !== '') {
            this.ehealth.preview.activePolicies[i].mainPaidDate = this.dataService.formatMonth(this.ehealth.preview.activePolicies[i].mainPaidDate);
          }
          if (this.ehealth.preview.activePolicies[i].riderInceptionDate && this.ehealth.preview.activePolicies[i].riderInceptionDate !== '') {
            this.ehealth.preview.activePolicies[i].riderInceptionDate = this.dataService.formatMonth(this.ehealth.preview.activePolicies[i].riderInceptionDate);
          }
          if (this.ehealth.preview.activePolicies[i].riderPaidDate && this.ehealth.preview.activePolicies[i].riderPaidDate !== '') {
            this.ehealth.preview.activePolicies[i].riderPaidDate = this.dataService.formatMonth(this.ehealth.preview.activePolicies[i].riderPaidDate);
          }
        }
        for (let i = 0; i < this.ehealth.preview.preExistingCondition.length; i++) {
          if (this.ehealth.preview.preExistingCondition[i].pregnantDate !== '') {
            this.ehealth.preview.preExistingCondition[i].pregnantDate = this.dataService.formatMonth(this.ehealth.preview.preExistingCondition[i].pregnantDate);
          }
          if (this.ehealth.preview.preExistingCondition[i].date !== '') {
            this.ehealth.preview.preExistingCondition[i].date = this.dataService.formatMonth(this.ehealth.preview.preExistingCondition[i].date);
          }
        }
        this.dataService.dismiss();
        // });
      });
    });
  }
  public generate() {
    this.mode = 'edit';
  }
  public signDocument(mode) {
    this.alertCtrl.create({
      header: 'Sign Preview Document',
      message: 'Please ensure all of the information is true and correct.',
      cssClass: 'alertDiv',
      buttons: [
        {
          text: 'No',
          role: 'cancel',
        }, {
          text: 'Yes',
          handler: () => {
            // this.openSignatureModal();
            if (mode === 'save') {
              this.exportPdf();
            } else {
              this.takeConsent();
            }
          },
        },
      ],
    }).then((alert) => {
      alert.present();
    });
  }
  public getImageUrl(src) {
    return environment.aws.bucketAccessRootPath + src;
  }
  public saveChanges() {
    // tslint:disable-next-line: prefer-for-of
    this.ehealth.checkboxValue.previewTab = true;
    this.firebase.editEhealth(this.ehealth).then(() => {
      const obj = {
        tabName: 'preview',
        value: true,
      };
      this.reloadAgain = true;
      this.dataService.setEhealthData(this.ehealth);
      this.dataService.presentAlert('Preview updated successfully!');
      this.dataService.setCheckboxValue(obj);
    });
  }
  public exportPdf() {
    this.mode = 'preview';
    // ? generate pdf
    const pageName = 'Preview';
    this.reloadAgain = false;
    if (!this.internetCheckFlag) {
      // eslint-disable-next-line max-len
      this.dataService.exportPdf('preview-pdf-wrap', this.ehealth.profile.name, environment.aws.bucketAdmissionDocumentsPath, pageName, this.clientId, this.ehealth.caseId, this.pdfFileName, this.pdfFileDate).then((resp) => {
        const response: any = resp;
        if (response.status === 'success') {
          let date;
          // eslint-disable-next-line prefer-const
          date = new Date();
          this.ehealth.preview.pdfFiles.push({
            fileKey: response.awsFileName,
            awsFileName: response.awsFileName,
            date: date.toString(),
            signature: this.pdf.signature,
            name: this.pdf.name || '',
            nric: this.pdf.nric || '',
          });
          this.pdfFileName = response.awsFileName;
          this.pdfFileDate = date.toString();
          this.saveChanges();
        } else {
          this.dataService.presentAlert('Couldn\'t create pdf. Try again!');
        }
      }).catch((err) => {
        this.dataService.presentAlert('Couldn\'t create pdf. Try again!');
      });
    } else {
      this.dataService.presentAlert('Please check your internet connection!');
    }
  }
  public openSignatureModal() {
    this.dataService.signatureModal(this.pdf.signature).then((resp) => {
      const response: any = resp;
      if (response.status === 'success') {
        this.pdf.signature = response.signature;
        let date;
        // eslint-disable-next-line prefer-const
        date = new Date();
        const today = this.dataService.formatDateAndMonth(date);
        this.pdf.date = today.split('/')[0];
        this.pdf.time = today.split('/')[1];
        this.ehealth.preview.signatureFlag = false;
        this.changedetect.detectChanges();
        this.exportPdf();
      }
      else {
        this.pdf.signature = '';
      }
    });
  }
  public async takeConsent() {
    let consentDetails: any = {
      name: '',
      relation: '',
      nric: '',
    };
    if (!this.ehealth.preview.profile.guardian) {
      consentDetails.name = this.ehealth.preview.profile.name;
      consentDetails.relation = 'self';
      this.pdf.name = '';
      this.pdf.nric = '';
      this.openSignatureModal();
    } else {
      if (this.ehealth.preview.profile.name !== undefined || this.ehealth.preview.profile.nric !== undefined) {
        const modalPage = await this.modalCtrl.create({
          component: ClientRegistrationTermsModalPage,
          backdropDismiss: false,
          cssClass: 'termsNconditions-modal',
          componentProps: {
            user: this.ehealth.preview.profile,
            mode: 'consent',
          },
        });
        modalPage.onDidDismiss().then((data) => {
          if (data.data.data) {
            consentDetails = data.data.data;
            this.pdf.name = consentDetails.name;
            this.pdf.nric = consentDetails.nric;
            this.openSignatureModal();
          }
        });
        modalPage.present();
      }
    }
  }
  public ionViewWillLeave() {
    this.activeRouteSubscriber.unsubscribe();
    this.pdf = {
      signature: '',
      date: '',
      time: '',
    };
    this.pdfFileName = undefined;
    this.pdfFileDate = undefined;
    // document.getElementById('preview-container').scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'start' });
  }
  public calculateAge(date) {
    const timeDiff = Math.abs(Date.now() - date);
    const years = Math.floor((timeDiff / (1000 * 3600 * 24)) / 365);
    const remaining = Math.floor(timeDiff % (365.25 * 24 * 60 * 60 * 1000));
    const months = Math.floor(remaining / ((365.25 / 12) * 24 * 60 * 60 * 1000));
    const remainingDays = Math.floor(remaining % ((365.25 / 12) * 24 * 60 * 60 * 1000));
    const days = Math.floor(remainingDays / (24 * 60 * 60 * 1000));
    if (years === 0 && months === 0) {
      this.age = days + ' ' + 'days';
    } else if (years === 0) {
      this.age = months + ' ' + 'months';
    } else {
      this.age = years + ' ' + 'years';
    }
  }
}
