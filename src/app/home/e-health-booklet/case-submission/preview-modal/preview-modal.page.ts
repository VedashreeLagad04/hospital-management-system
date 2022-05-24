/* eslint-disable @typescript-eslint/prefer-for-of */
/* eslint-disable max-len */
import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ModalController } from '@ionic/angular';
import * as _ from 'lodash';
import { AppDataService } from 'src/app/services/app-data.service';
import { FirebaseService } from 'src/app/services/firebase.service';
import { environment } from 'src/environments/environment';
@Component({
  selector: 'app-signature-modal',
  templateUrl: './preview-modal.page.html',
  styleUrls: ['./preview-modal.page.scss'],
})
export class PreviewModalPage implements OnInit {
  @Input() uploadedFile;
  mode = 'list';
  fileList = [];
  public ehealth: any = {};
  public case;
  public clientId;
  public latestCaseSubmissionFile;
  public loader;
  constructor(private activeRoute: ActivatedRoute,
    private firebase: FirebaseService,
    private dataService: AppDataService,
    private modalCtrl: ModalController) { }
  public ionViewDidEnter() { }
  public ngOnInit() {
    this.case = this.dataService.getSelectedCase();
    this.ehealth = this.dataService.getEhealthData();
    this.fileList = [];
    // tslint:disable-next-line: max-line-length
    if (_.size(this.ehealth.caseSubmission) > 0 && this.ehealth.caseSubmission.pdfFiles && this.ehealth.caseSubmission.pdfFiles.length > 0) {
      this.fileList = _.cloneDeep(this.ehealth.caseSubmission.pdfFiles);
      for (let i = 0; i < this.fileList.length; i++) {
        const file = this.fileList[i];
        file.name = file.fileUploadKey.split('/')[4];
      }
      // const lastIndex = this.ehealth.caseSubmission.pdfFiles.length - 1;
      // this.latestCaseSubmissionFile = this.ehealth.caseSubmission.pdfFiles[lastIndex];
      // this.latestCaseSubmissionFile.src = this.getImageUrl(this.latestCaseSubmissionFile.fileUploadKey);
      // } else if (_.size(this.uploadedFile) > 0) {
      //   this.latestCaseSubmissionFile = this.uploadedFile;
      //   this.latestCaseSubmissionFile.src = this.getImageUrl(this.latestCaseSubmissionFile.fileUploadKey);
    }
    console.log('this.fileList: ', this.fileList);
  }
  showPreview(file) {
    this.mode = 'preview';
    if (this.latestCaseSubmissionFile !== file) {
      this.dataService.present().then((loader) => {
        loader.present();
        this.loader = _.cloneDeep(loader);
        this.latestCaseSubmissionFile = _.cloneDeep(file);
        this.latestCaseSubmissionFile.src = this.getImageUrl(this.latestCaseSubmissionFile.fileUploadKey);
      });
    }
  }
  showList() {
    this.mode = 'list';
  }
  public getImageUrl(src) {
    return environment.aws.bucketAccessRootPath + src;
  }
  public closePreviewModal() {
    this.modalCtrl.dismiss();
  }
  public onProgress(event) {
    let percentLoad = '0';
    percentLoad = ((event.loaded / event.total) * 100).toFixed(0);
    if (!percentLoad || percentLoad === 'NaN') {
      percentLoad = '0';
    }
    this.loader.message = '<span class="upload-percent">Loading... ' + percentLoad + ' %</span>';
  }
  public afterLoadComplete(event) {
    this.dataService.dismiss();
  }
  public onImgLoad() {
    this.dataService.dismiss();
  }
}
