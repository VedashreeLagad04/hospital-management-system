import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AlertController, ModalController } from '@ionic/angular';
import * as _ from 'lodash';
import { AppDataService } from 'src/app/services/app-data.service';
import { FirebaseService } from 'src/app/services/firebase.service';
import { environment } from 'src/environments/environment';
import { PreviewModalPage } from '../case-submission/preview-modal/preview-modal.page';
@Component({
  selector: 'app-approval-preview',
  templateUrl: './approval-preview.page.html',
  styleUrls: ['./approval-preview.page.scss'],
})
export class ApprovalPreviewPage implements OnInit {
  public loader;
  public clientId;
  public click = 'no';
  public case;
  public age;
  public mode = 'preview';
  public pdfFileName;
  public ehealth: any = {};
  public signature;
  public pdfFilename;
  public latestCaseSubmissionFile;
  public MedicalConditions: any = {};
  public pdf: any = {};
  ehealthSnapshotSub: any;
  constructor(private activeRoute: ActivatedRoute,
    private firebase: FirebaseService,
    private dataService: AppDataService,
    private modalCtrl: ModalController,
    private alertCtrl: AlertController) { }
  public ngOnInit() { }
  public ionViewDidEnter() {
    this.dataService.present().then(async (a) => {
      a.present();
      this.loader = a;
      this.mode = 'preview';
      this.click = 'no';
      this.activeRoute.paramMap.subscribe((params) => {
        this.clientId = params.get('id');
        this.case = this.dataService.getSelectedCase();
        console.log('this.case: ', this.case);
        this.firebase.getMedicalId(this.case.id).subscribe((resp) => {
          resp.docs.forEach((temp) => {
            this.MedicalConditions = temp.data();
            this.MedicalConditions.id = temp.id;
          });
        });
        // this.firebase.getEhealth(this.case.id).subscribe((resp) => {
        //   resp.docs.forEach((temp) => {
        //     this.ehealth = temp.data();
        //     this.ehealth.id = temp.id;
        //     
        //   });
        this.ehealth = this.dataService.getEhealthData();
        const date = new Date(this.ehealth.profile.dateOfBirth);
        this.calculateAge(date);
        if (!this.ehealth) {
          this.ehealthSnapshotSub = this.firebase.getEhealth(this.case.id).subscribe((resp) => {
            const tempEhealth = resp;
            this.ehealth = tempEhealth[0];
            this.dataService.setEhealthData(this.ehealth);
            this.getAllData();
            this.dataService.dismiss();
          });
        } else {
          this.getAllData();
          this.dataService.dismiss();
        }
      });
      await this.dataService.getLatestCase(this.clientId);
    });
    // });
  }
  public getAllData() {
    if (this.ehealth.caseSubmission.pdfFiles && this.ehealth.caseSubmission.pdfFiles.length > 0) {
      const lastIndex = this.ehealth.caseSubmission.pdfFiles.length - 1;
      this.latestCaseSubmissionFile = this.ehealth.caseSubmission.pdfFiles[lastIndex];
      this.latestCaseSubmissionFile.src = this.getImageUrl(this.latestCaseSubmissionFile.fileUploadKey);
    } else {
      this.dataService.dismiss();
    }
    // tslint:disable-next-line: max-line-length
    if (this.ehealth && this.ehealth.preview && this.ehealth.preview.activePolicies && this.ehealth.preview.activePolicies.length > 0) {
      // tslint:disable-next-line: prefer-for-of
      for (let i = 0; i < this.ehealth.preview.activePolicies.length; i++) {
        if (this.ehealth.preview.activePolicies[i].mainInceptionDate !== '') {
          // tslint:disable-next-line: max-line-length
          this.ehealth.preview.activePolicies[i].mainInceptionDate = this.dataService.formatMonth(this.ehealth.preview.activePolicies[i].mainInceptionDate);
        }
        if (this.ehealth.preview.activePolicies[i].mainPaidDate !== '') {
          // tslint:disable-next-line: max-line-length
          this.ehealth.preview.activePolicies[i].mainPaidDate = this.dataService.formatMonth(this.ehealth.preview.activePolicies[i].mainPaidDate);
        }
        // tslint:disable-next-line: max-line-length
        if (this.ehealth.preview.activePolicies[i].riderInceptionDate && this.ehealth.preview.activePolicies[i].riderInceptionDate !== '') {
          // tslint:disable-next-line: max-line-length
          this.ehealth.preview.activePolicies[i].riderInceptionDate = this.dataService.formatMonth(this.ehealth.preview.activePolicies[i].riderInceptionDate);
        }
        if (this.ehealth.preview.activePolicies[i].riderPaidDate && this.ehealth.preview.activePolicies[i].riderPaidDate !== '') {
          // tslint:disable-next-line: max-line-length
          this.ehealth.preview.activePolicies[i].riderPaidDate = this.dataService.formatMonth(this.ehealth.preview.activePolicies[i].riderPaidDate);
        }
      }
    }
    // tslint:disable-next-line: max-line-length
    if (this.ehealth && this.ehealth.preview && this.ehealth.preview.preExistingCondition && this.ehealth.preview.preExistingCondition.length > 0) {
      // tslint:disable-next-line: prefer-for-of
      for (let i = 0; i < this.ehealth.preview.preExistingCondition.length; i++) {
        if (this.ehealth.preview.preExistingCondition[i].pregnantDate !== '') {
          // tslint:disable-next-line: max-line-length
          this.ehealth.preview.preExistingCondition[i].pregnantDate = this.dataService.formatMonth(this.ehealth.preview.preExistingCondition[i].pregnantDate);
        }
        if (this.ehealth.preview.preExistingCondition[i].date !== '') {
          // tslint:disable-next-line: max-line-length
          this.ehealth.preview.preExistingCondition[i].date = this.dataService.formatMonth(this.ehealth.preview.preExistingCondition[i].date);
        }
      }
    }
    if (this.ehealth && this.ehealth.preview && this.ehealth.preview.pdfFiles && this.ehealth.preview.pdfFiles.length > 0) {
      const lastIndex = this.ehealth.preview.pdfFiles.length - 1;
      const dateTimeObj = this.dataService.getDateAndTimeOfPdfUpload(this.ehealth.preview.pdfFiles[lastIndex].date);
      this.pdf.date = dateTimeObj.date;
      // this.pdf.date = this.dataService.formatMonthForPreviewPage(this.ehealth.preview.pdfFiles[lastIndex].date);
      this.pdf.time = dateTimeObj.time;
      this.pdf.signature = this.ehealth.preview.pdfFiles[lastIndex].signature;
      this.pdf.name = this.ehealth.preview.pdfFiles[lastIndex].name;
      this.pdf.nric = this.ehealth.preview.pdfFiles[lastIndex].nric;
      // ! check filename, if filename already present add (1) to it
      // ? eg. 20200825 Travel Declaration PK.pdf is already present, make it 20200825 Travel Declaration PK(1).pdf
      this.pdfFileName = this.ehealth.preview.pdfFiles[lastIndex].fileKey;
    }
    return;
  }
  public generate() {
    this.mode = 'edit';
  }
  public onProgress(event) {
    let percentLoad = '0';
    percentLoad = ((event.loaded / event.total) * 100).toFixed(0);
    if (!percentLoad || percentLoad === 'NaN') {
      percentLoad = '0';
    }
    this.loader.message = '<span class="upload-percent">Loading... ' + percentLoad + ' %</span>';
}
public change() {
  this.dataService.present().then((a) => {
    a.present();
    this.loader = a;
    this.click = 'yes';
  });
}
public afterLoadComplete(event) {
  this.dataService.dismiss();
}
  public getImageUrl(src) {
    return environment.aws.bucketAccessRootPath + src;
  }
  public changeRoute() {
    this.dataService.routeChange('/e-health-booklet/pre-admission-checklist/' + this.case.clientId);
  }
  public ionViewWillLeave() {
    document.getElementById('approval-preview-container').scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'start' });
    if (this.ehealthSnapshotSub) {
      this.ehealthSnapshotSub.unsubscribe();
    }
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
  public openPreviewModal() {
    if (this.ehealth.caseSubmission.pdfFiles && this.ehealth.caseSubmission.pdfFiles.length > 0) {
      return new Promise(async (resolve) => {
        this.modalCtrl.create({
          component: PreviewModalPage,
          cssClass: 'preview-modal',
          componentProps: { uploadedFile: this.ehealth.caseSubmission.pdfFiles[this.ehealth.caseSubmission.pdfFiles.length - 1] },
        }).then((modal) => {
          modal.present();
        });
      });
      } else {
        this.dataService.presentAlert('No Document uploaded');
      }
    }
}
