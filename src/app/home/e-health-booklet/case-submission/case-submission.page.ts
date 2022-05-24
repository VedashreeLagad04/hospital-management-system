/* eslint-disable @typescript-eslint/prefer-for-of */
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LoadingController, ModalController } from '@ionic/angular';
import * as _ from 'lodash';
import { AppDataService } from 'src/app/services/app-data.service';
import { AwsService } from 'src/app/services/aws.service';
import { FirebaseService } from 'src/app/services/firebase.service';
import { environment } from 'src/environments/environment';
import { PreviewModalPage } from './preview-modal/preview-modal.page';
@Component({
  selector: 'app-case-submission',
  templateUrl: './case-submission.page.html',
  styleUrls: ['./case-submission.page.scss'],
})
export class CaseSubmissionPage implements OnInit {
  public clientId;
  public case;
  public isSaved = false;
  public saveButton = 'enabled';
  public isCcExclaimOpen = false;
  public isMcExclaimOpen = false;
  public isAolExclaimOpen = false;
  public isAoqExclaimOpen = false;
  public ehealth: any = {
    pdfFiles: [],
    cc: [
      {
        CC: '',
      },
    ],
    mc: [
      {
        MC: '',
      },
    ],
    aol: [
      {
        AOL: '',
      },
    ],
    aoq: [
      {
        AOQ: '',
      },
    ],
    plan: '',
  };
  public fileToUpload = [];
  public uploadProgress: any = 0;
  public uploadPercent = 0;
  @ViewChild('uploadFile', { static: false }) public inputFile: ElementRef;
  public loggedInUser;
  public internetCheckFlag = false;
  public reloadAgain = true;
  public loader: any;
  constructor(private activeRoute: ActivatedRoute, private firebase: FirebaseService, private dataService: AppDataService, private awsService: AwsService, private loadingCtrl: LoadingController, private modalCtrl: ModalController, private router: Router) { }
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
        this.router.routeReuseStrategy.shouldReuseRoute = () => {
          return false;
        };
        if (this.reloadAgain) {
          this.ionViewDidEnter();
        }
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
    this.dataService.present().then((a) => {
      a.present();
      this.activeRoute.paramMap.subscribe((params) => {
        this.loggedInUser = this.dataService.getUserData();
        this.clientId = params.get('id');
        this.case = this.dataService.getSelectedCase();
        console.log('this.case: ', this.case);
        const textareas = document.getElementsByTagName('textarea');
        // tslint:disable-next-line: prefer-for-of
        for (let i = 0; i < textareas.length; i++) {
          const element = textareas[i];
          element.scrollTop = 0;
        }
        // ? client issue - cannot update this tab when currentStatus is 'Pending Follow-up'
        if (this.case.currentStatus === 'Pending') {
          // this.case.currentStatus === 'Submitted for approval' ||
          // this.case.currentStatus === 'Temporary Approval' ||
          // this.case.currentStatus === 'Pending Approval' ||
          // this.case.currentStatus === 'Rejected' ||
          // this.case.currentStatus === 'Resubmission for temporary approval' ||
          // this.case.currentStatus === 'Resubmitted for Approval' ||
          // this.case.currentStatus === 'Approved') {
          this.saveButton = 'enabled';
        } else {
          this.saveButton = 'disabled';
        }
        // this.firebase.getEhealth(this.case.id).subscribe((resp) => {
        //   resp.docs.forEach((temp) => {
        //     this.ehealth = temp.data();
        //     this.ehealth.id = temp.id;
        //     
        //   });
        this.ehealth = this.dataService.getEhealthData();
        if (_.isEmpty(this.ehealth.caseSubmission)) {
          this.ehealth.caseSubmission = {
            pdfFiles: [],
            cc: [
              {
                CC: '',
              },
            ],
            mc: [
              {
                MC: '',
              },
            ],
            aol: [
              {
                AOL: '',
              },
            ],
            aoq: [
              {
                AOQ: '',
              },
            ],
            plan: '',
          };
        }
        this.dataService.dismiss();
      });
    });
    // });
  }
  public saveChanges() {
    // if (this.saveButton === 'disabled') {
    //   this.dataService.presentAlert('Cannot save changes as the case is already ' + this.case.currentStatus);
    // } else {
    for (let i = 1; i < this.ehealth.caseSubmission.cc.length; i++) {
      if (this.ehealth.caseSubmission.cc[i].CC === '') {
        this.ehealth.caseSubmission.cc.splice(i, 1);
      }
    }
    for (let i = 1; i < this.ehealth.caseSubmission.mc.length; i++) {
      if (this.ehealth.caseSubmission.mc[i].MC === '') {
        this.ehealth.caseSubmission.mc.splice(i, 1);
      }
    }
    for (let i = this.ehealth.caseSubmission.aol.length - 1; i >= 0; i--) {
      if (this.ehealth.caseSubmission.aol[i].AOL === '') {
        this.ehealth.caseSubmission.aol.splice(i, 1);
      }
    }
    if (this.ehealth.caseSubmission.aol.length === 0) {
      this.ehealth.caseSubmission.aol.push({ AOL: '' });
    }
    for (let i = this.ehealth.caseSubmission.aoq.length - 1; i >= 0; i--) {
      if (this.ehealth.caseSubmission.aoq[i].AOQ === '') {
        this.ehealth.caseSubmission.aoq.splice(i, 1);
      }
    }
    if (this.ehealth.caseSubmission.aoq.length === 0) {
      this.ehealth.caseSubmission.aoq.push({ AOQ: '' });
    }
    this.dataService.present().then((loader) => {
      loader.present();
      this.ehealth.checkboxValue.caseSubmissionTab = true;
      this.ehealth.preview.caseSubmission = this.ehealth.caseSubmission;
      this.firebase.editEhealth(this.ehealth).then(() => {
        this.isSaved = true;
        const obj = {
          tabName: 'case-submission',
          value: true,
        };
        this.dataService.setCheckboxValue(obj);
        this.dataService.setEhealthData(this.ehealth);
        this.dataService.dismiss();
        this.dataService.presentAlert('Case Submission updated successfully!');
      }).catch((err) => {
        this.dataService.dismiss();
      });
    });
    // }
  }
  public submitForApproval() {
    if (this.saveButton === 'disabled') {
      this.dataService.presentAlert('Cannot submit for approval as the case is already ' + this.case.currentStatus);
    } else {
      this.dataService.present().then((loader) => {
        loader.present();
        this.reloadAgain = false;
        this.case.currentStatus = 'Pending Approval';
        const caseStatus: any = {};
        caseStatus.userType = this.loggedInUser.type;
        caseStatus.userId = this.loggedInUser.id;
        caseStatus.date = new Date().toString();
        caseStatus.status = 'Pending Approval';
        caseStatus.signature = '';
        this.case.caseStatus.push(caseStatus);
        this.case.lastUpdateTimestamp = new Date().getTime();
        if (this.isSaved) {
          if (!this.internetCheckFlag) {
            this.firebase.editCase(this.case).then(() => {
              this.reloadAgain = true;
              this.dataService.setSelectedCase(this.case);
              this.dataService.presentAlertMessage('Case Submitted', 'Case has been successfully submitted to management.');
              // ? update this case status in timeline
              this.updateTimeline(caseStatus.date);
            });
          } else {
            this.dataService.dismiss();
            this.dataService.presentAlert('Please check your internet connection!');
          }
        } else {
          if (!this.internetCheckFlag) {
            this.ehealth.checkboxValue.caseSubmissionTab = true;
            this.ehealth.preview.caseSubmission = this.ehealth.caseSubmission;
            this.firebase.editEhealth(this.ehealth).then(() => {
              // this.dataService.presentAlert('case-submission upadated sucessfully!');
              this.firebase.editCase(this.case).then(() => {
                this.dataService.setSelectedCase(this.case);
                this.reloadAgain = true;
                this.isSaved = true;
                const obj = {
                  tabName: 'case-submission',
                  value: true,
                };
                this.dataService.setCheckboxValue(obj);
                this.dataService.setEhealthData(this.ehealth);
                this.dataService.dismiss();
                this.dataService.presentAlertMessage('Case Submitted', 'Case has been successfully submitted to management.');
                // ? update this case status in timeline
                this.updateTimeline(caseStatus.date);
              });
            });
          } else {
            this.dataService.dismiss();
            this.dataService.presentAlert('Please check your internet connection!');
          }
        }
      });
    }
  }
  public updateTimeline(date) {
    const timelineStatus: any = {
      date,
      activity: 'Case submitted for approval',
      userType: this.loggedInUser.type,
      userId: this.loggedInUser.id,
      caseId: this.case.id,
    };
    this.dataService.dismiss();
    this.dataService.updateTimelineData(timelineStatus, this.case.clientId);
  }
  public addCC() {
    this.ehealth.caseSubmission.cc.push(
      {
        CC: '',
      },
    );
  }
  public addMC() {
    this.ehealth.caseSubmission.mc.push(
      {
        MC: '',
      },
    );
  }
  public addAOQ() {
    this.ehealth.caseSubmission.aoq.push(
      {
        AOQ: '',
      },
    );
  }
  public addAOL() {
    this.ehealth.caseSubmission.aol.push(
      {
        AOL: '',
      },
    );
  }
  public removeCC(index) {
    this.ehealth.caseSubmission.cc.splice(index, 1);
  }
  public removeMC(index) {
    this.ehealth.caseSubmission.mc.splice(index, 1);
  }
  public removeAOL(index) {
    this.ehealth.caseSubmission.aol.splice(index, 1);
  }
  public removeAOQ(index) {
    this.ehealth.caseSubmission.aoq.splice(index, 1);
  }
  public openPopover(event, caseName) {
    event.stopPropagation();
    if (caseName === 'CC') {
      this.isCcExclaimOpen = !this.isCcExclaimOpen;
      this.isMcExclaimOpen = false;
      this.isAolExclaimOpen = false;
      this.isAoqExclaimOpen = false;
    } else if (caseName === 'MC') {
      this.isMcExclaimOpen = !this.isMcExclaimOpen;
      this.isCcExclaimOpen = false;
      this.isAolExclaimOpen = false;
      this.isAoqExclaimOpen = false;
    } else if (caseName === 'AOL') {
      this.isAolExclaimOpen = !this.isAolExclaimOpen;
      this.isCcExclaimOpen = false;
      this.isMcExclaimOpen = false;
      this.isAoqExclaimOpen = false;
    } else if (caseName === 'AOQ') {
      this.isAoqExclaimOpen = !this.isAoqExclaimOpen;
      this.isCcExclaimOpen = false;
      this.isAolExclaimOpen = false;
      this.isMcExclaimOpen = false;
    }
  }
  public close() {
    this.isCcExclaimOpen = false;
    this.isMcExclaimOpen = false;
    this.isAolExclaimOpen = false;
    this.isAoqExclaimOpen = false;
  }
  public openFileExplorer() {
    // if (this.saveButton === 'disabled') {
    //   this.dataService.presentAlert('Cannot upload calculation as the case is already ' + this.case.currentStatus);
    // } else {
    this.inputFile.nativeElement.click();
    // }
  }
  public fileClick() {
    this.inputFile.nativeElement.value = '';
  }
  public uploadFiles(event) {
    if (!this.internetCheckFlag) {
      // this.openModal(event.target.files, index);
      if (event.target.files.length > 0) {
        this.dataService.present().then((loader) => {
          this.loader = loader;
          loader.present();
          let date;
          date = new Date();
          // const year = date.getFullYear();
          // let month = date.getMonth();
          // month = month + 1;
          // if (month.toString.length === 1) {
          //   month = '0' + month;
          // }
          // let day = date.getDate();
          // if (day.toString.length === 1) {
          //   day = '0' + day;
          // }
          // tslint:disable-next-line: prefer-for-of
          for (let i = 0; i < event.target.files.length; i++) {
            const fileObjectToUpload = {
              body: '',
              name: '',
              size: 0,
              key: '',
              type: '',
              arrayBuffer: null,
            };
            fileObjectToUpload.body = event.target.files[i];
            // fileObjectToUpload.name = event.target.files[i].name;
            // const selectedFilename = event.target.files[0].name.replace(/ /g, '_');
            // const splittedName = selectedFilename.split('.')[0];
            // const selectedFilename = event.target.files[i].name.split('.')[0];
            const splitArr = event.target.files[i].name.split('.');
            splitArr.splice(-1);
            const selectedFilename = splitArr.join('.');
            let splittedName = selectedFilename.replace(/[!&\/\\#., +=^()$~%'":*?<>{}]/g, '_');
            let splittedFileName;
            const fileCountArr = [];
            const alreadyPresentName = _.filter(this.ehealth.caseSubmission.pdfFiles, (o) => {
              // const currFilename = o.fileName.replace(/\(/, '-').replace(/\)\./, '.');
              const currFilename = o.fileUploadKey.split('/')[4];
              splittedFileName = currFilename.split('.')[0];
              if (_.includes(splittedFileName, splittedName)) {
                const filenumber = splittedFileName.split('-');
                const isnum = /^\d+$/.test(filenumber[filenumber.length - 1]);
                let concatFilename;
                concatFilename = filenumber[0];
                if (filenumber.length > 1) {
                  for (let j = 1; j < filenumber.length - 1; j++) {
                    concatFilename = concatFilename + '-' + filenumber[j];
                  }
                }
                if (splittedFileName === splittedName) {
                  // ? when there is 'sample.pdf' present and currently uploading 'sample.pdf' to become 'sample-1.pdf'
                  fileCountArr.push(0);
                  return o;
                } else if (isnum && concatFilename === splittedName) {
                  let count = filenumber[filenumber.length - 1].split('.')[0];
                  fileCountArr.push(parseInt(count));
                  return o;
                }
              }
            });
            const extension = event.target.files[i].name.split('.')[event.target.files[i].name.split('.').length - 1];
            if (alreadyPresentName && alreadyPresentName.length > 0) {
              const maxCount = _.max(fileCountArr);
              if (maxCount !== undefined) {
                // fileObjectToUpload.name = selectedFilename.split('.')[0] +
                //   '-' + (maxCount + 1) + '.'
                //   + event.target.files[i].name.split('.')[1];
                fileObjectToUpload.name = selectedFilename.split('.')[0] +
                  '-' + (maxCount + 1) + '.'
                  + extension;
              } else {
                // fileObjectToUpload.name = selectedFilename + '.' + event.target.files[i].name.split('.')[1];
                fileObjectToUpload.name = selectedFilename + '.' + extension;
              }
            } else {
              // fileObjectToUpload.name = selectedFilename + '.' + event.target.files[i].name.split('.')[1];
              fileObjectToUpload.name = selectedFilename + '.' + extension;
            }
            fileObjectToUpload.size = event.target.files[i].size;
            fileObjectToUpload.type = event.target.files[i].type;
            fileObjectToUpload.key = environment.aws.bucketRootKey + '/'
              + this.clientId + '/'
              + this.ehealth.caseId + '/'
              + environment.aws.bucketClaimDocumentsPath + '/'      // ? client change - pdf must be save in claims folder
              // + environment.aws.bucketCaseSubmissionFilePath + '/'
              + fileObjectToUpload.name;
            fileObjectToUpload.arrayBuffer = event.target.files[i];
            this.fileToUpload.push(fileObjectToUpload);

          }
          this.uploadFilesToAWS();
          // this.dataService.dismiss();
        });
      }
    } else {
      this.dataService.presentAlert('Please check your internet connection!');
    }
  }
  public uploadFilesToAWS() {
    const date = new Date();
    this.awsService.uploadFilesAWS(this.fileToUpload, () => {
      for (let i = 0; i < this.fileToUpload.length; i++) {
        const obj = {
          fileUploadKey: this.fileToUpload[i].key,
          fileUploadDate: date.toString(),
          fileUploadType: this.fileToUpload[i].type,
        };
        this.ehealth.caseSubmission.pdfFiles.push(obj);
      }
      this.fileToUpload = [];
      this.dataService.dismiss();
      this.dataService.presentAlert('Click on \'Save Changes\' button to save uploaded file!');
    }, (err) => {
      this.dataService.dismiss();
    }, (progress) => {
      this.uploadPercent = Math.ceil(progress.uploadedPercent);
      this.uploadProgress = this.uploadPercent / 100;
      const progressVal = '<span class="upload-percent">Uploading... ' + this.uploadPercent + ' %</span>';
      this.loader.message = progressVal;
    });
  }
  public openPreviewModal() {
    this.dataService.setEhealthData(this.ehealth);
    return new Promise(async (resolve) => {
      this.modalCtrl.create({
        component: PreviewModalPage,
        cssClass: 'preview-modal',
        // componentProps: { uploadedFile: this.ehealth.caseSubmission.pdfFiles[this.ehealth.caseSubmission.pdfFiles.length - 1] },
      }).then((modal) => {
        modal.present();
      });
    });
  }
  public closePopover() {
    this.isCcExclaimOpen = false;
    this.isMcExclaimOpen = false;
    this.isAolExclaimOpen = false;
    this.isAoqExclaimOpen = false;
  }
}
