/* eslint-disable max-len */
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { SocialSharing } from '@ionic-native/social-sharing/ngx';
import { AlertController, LoadingController } from '@ionic/angular';
import * as _ from 'lodash';
import { AppDataService } from 'src/app/services/app-data.service';
import { AwsService } from 'src/app/services/aws.service';
import { DownloadFileService } from 'src/app/services/download-file.service';
import { FirebaseService } from 'src/app/services/firebase.service';
import { InsuranceDocsService } from 'src/app/services/insurance-docs.service';
import { environment } from 'src/environments/environment';
@Component({
  selector: 'app-discharge-docs-checklist',
  templateUrl: './discharge-docs-checklist.page.html',
  styleUrls: ['./discharge-docs-checklist.page.scss'],
})
export class DischargeDocsChecklistPage implements OnInit {
  public isWeb = environment.isWeb;
  public nameToSearch;
  public fileNames;
  public clientId;
  public fileToUpload = [];
  public uploadPercent = 0;
  public allFiles = [];
  public uploadProgress;
  public isFolderSelected = false;
  public folderName;
  public bucketFolderName;
  public case: any;
  public isFileAlreadyUploaded = false;
  public currentFileObj;
  public loader;
  public internetCheckFlag = false;
  // eslint-disable-next-line @typescript-eslint/member-ordering
  @ViewChild('inputFile', { static: false }) public inputFile: ElementRef;
  public isOpenFileCancelled = false;
  dischargeFiles = [];
  interimBill: any;
  medicalReport: any;
  respFilesCount = 0;
  admSnapshotSubscriber: any;
  clientDetails: any;
  constructor(private dataService: AppDataService, private loadingController: LoadingController, private awsService: AwsService, private firebase: FirebaseService, private socialSharing: SocialSharing, private alertCtrl: AlertController, private insuranceDocsService: InsuranceDocsService, private router: Router, private downloadService: DownloadFileService) {
    dataService.subscribeLoaderCancel.subscribe((resp) => {
      this.isOpenFileCancelled = resp;
      if (resp) {
        this.currentFileObj = null;
      }
    });
  }
  public ionViewDidEnter() {
    this.dataService.present().then((loader) => {
      loader.present();
      const obj = {
        title: 'Discharge Docs Checklist',
        backPage: '/client-case-folders',
      };
      this.dataService.setHeaderTitle(obj);
      this.case = this.dataService.getSelectedCase();
      this.clientDetails = this.dataService.getPatientData();
      this.respFilesCount = 0;
      this.getAllFilesFromAllFolders();
      // ! get files only from 'discharge' folder
      // const foldername = 'root/' + this.case.clientId + '/' +
      //   this.case.id + '/' +
      //   environment.aws.bucketDischargeDocumentsPath;
      // this.awsService.getFiles(foldername).then((resp) => {
      //   const response: any = resp;
      //   if (response.length > 0) {
      //     this.allFiles = response;
      //     this.fileNames = this.dataService.getFileNamesFromFiles(response, 'discharge-docs-checklist');
      //     const newlyAddedFile = this.insuranceDocsService.getCurrentlyAddedFile();
      //     if (_.size(newlyAddedFile) > 0) {
      //       let selectedFolder;
      //       if (newlyAddedFile[0].fileUploadKey && newlyAddedFile[0].fileUploadKey.split('/')[4]) {
      //         const splittedFilename = newlyAddedFile[0].fileUploadKey.split('/')[4];
      //         if (_.includes(splittedFilename, '_Discharge_Summary')) {
      //           selectedFolder = 'discharge-summary';
      //         } else if (_.includes(splittedFilename, '_Interim_Bill')) {
      //           selectedFolder = 'interim-bill';
      //         } else if (_.includes(splittedFilename, '_Hospitalisation_Leave')) {
      //           selectedFolder = 'hospitalisation-leave';
      //         } else if (_.includes(splittedFilename, '_Medical_Report')) {
      //           selectedFolder = 'medical-report';
      //         }
      //         this.selectFolder(selectedFolder);
      //       }
      //     }
      //   }
      //   this.dataService.dismiss();
      // }).catch((err) => {
      //   this.dataService.dismiss();
      // });
    });
  }
  public ngOnInit() {
  }
  public getAllFilesFromAllFolders() {
    this.allFiles = [];
    const dischargeFoldername = 'root/' + this.case.clientId + '/' +
      this.case.id + '/' +
      environment.aws.bucketDischargeDocumentsPath;
    const interimBillFoldername = 'root/' + this.case.clientId + '/' +
      this.case.id + '/' +
      environment.aws.bucketInvoiceDocumentsPath;
    // ? hospitalisation leave file will be in discharge folder; hence it will be already fetched by dischargeFoldername;
    const medreportFoldername = 'root/' + this.case.clientId + '/' +
      this.case.id + '/' +
      environment.aws.bucketMedicalReportsPath;

    this.awsService.getFiles(dischargeFoldername).then((resp: any) => {
      this.dischargeFiles = resp;
      this.checkIfAllFilesFetched();
    }).catch((err) => {
      this.dataService.dismiss();
    });
    this.awsService.getFiles(interimBillFoldername).then((resp: any) => {
      this.interimBill = resp[0];
      this.checkIfAllFilesFetched();
    }).catch((err) => {
      this.dataService.dismiss();
    });
    this.awsService.getFiles(medreportFoldername).then((resp: any) => {
      this.medicalReport = resp[0];
      this.checkIfAllFilesFetched();
    }).catch((err) => {
      this.dataService.dismiss();
    });
  }
  public checkIfAllFilesFetched() {
    this.respFilesCount++;
    if (this.respFilesCount === 3) {
      if (this.dischargeFiles.length > 0)
        // this.allFiles.concat(this.dischargeFiles);
        {this.allFiles = [...this.allFiles, ...this.dischargeFiles];}
      if (this.interimBill)
        {this.allFiles.push(this.interimBill);}
      if (this.medicalReport)
        {this.allFiles.push(this.medicalReport);}
      this.changeFileFormat();
    }
  }
  changeFileFormat() {
    this.fileNames = this.dataService.getFileNamesFromFiles(this.allFiles, 'discharge-docs-checklist');

    const newlyAddedFile = this.insuranceDocsService.getCurrentlyAddedFile();
    if (_.size(newlyAddedFile) > 0) {
      let selectedFolder;
      if (newlyAddedFile[0].fileUploadKey && newlyAddedFile[0].fileUploadKey.split('/')[4]) {
        const splittedFilename = newlyAddedFile[0].fileUploadKey.split('/')[4];
        if (_.includes(splittedFilename, '_Discharge_Summary')) {
          selectedFolder = 'discharge-summary';
        } else if (_.includes(splittedFilename, '_Interim_Bill')) {
          selectedFolder = 'interim-bill';
        } else if (_.includes(splittedFilename, '_Hospitalisation_Leave')) {
          selectedFolder = 'hospitalisation-leave';
        } else if (_.includes(splittedFilename, '_Medical_Report')) {
          selectedFolder = 'medical-report';
        }
        this.selectFolder(selectedFolder);
      }
    }
    this.dataService.dismiss();
  }
  public goToAllFolders() {
    this.isFolderSelected = false;
  }
  public selectFolder(folderName) {
    this.currentFileObj = undefined;
    this.dataService.present().then((loader) => {
      this.loader = loader;
      loader.present();
      this.dataService.enableCancelForLoader();
      this.dataService.currentLoader = 'preview-pdf';
      this.isFolderSelected = true;
      if (folderName === 'discharge-summary') {
        this.folderName = 'Discharge Summary';
        this.isFileAlreadyUploaded = this.case.dischargeDocsChecklistCheckbox.dischargeSummary ? true : false;
        this.bucketFolderName = environment.aws.bucketDischargeDocumentsPath;
      } else if (folderName === 'interim-bill') {
        this.folderName = 'Interim Bill';
        this.isFileAlreadyUploaded = this.case.dischargeDocsChecklistCheckbox.interimBill ? true : false;
        this.bucketFolderName = environment.aws.bucketInvoiceDocumentsPath;
      } else if (folderName === 'hospitalisation-leave') {
        this.folderName = 'Hospitalisation Leave';
        this.isFileAlreadyUploaded = this.case.dischargeDocsChecklistCheckbox.hospitalisationLeave ? true : false;
        this.bucketFolderName = environment.aws.bucketDischargeDocumentsPath;
      } else if (folderName === 'medical-report') {
        this.folderName = 'Medical Report';
        this.isFileAlreadyUploaded = this.case.dischargeDocsChecklistCheckbox.medicalReport ? true : false;
        this.bucketFolderName = environment.aws.bucketMedicalReportsPath;
      }
      this.showPreviewOfFile();
    });
  }
  public showPreviewOfFile() {
    const element = document.getElementById('preview');
    if (element) {
      element.scrollTop = 0;
    }
    if (this.isFileAlreadyUploaded) {
      if (this.allFiles.length > 0) {
        let slashSplittedFilename = '';
        _.forEach(this.fileNames, (file) => {
          slashSplittedFilename = file.actualFilename.split('/')[4];
          if (_.includes(slashSplittedFilename, (this.folderName.replace(/ /g, '_')))) {
            this.currentFileObj = this.dataService.openFile(file, this.fileNames);
          }
        });
      }
    } else {
      this.dataService.dismiss();
    }
  }
  public fileClick() {
    this.inputFile.nativeElement.value = '';
  }
  public uploadFiles(event: any) {
    if (!this.internetCheckFlag) {
      if (event.target.files.length > 0) {
        if (event.target.files[0].type === 'application/pdf') {
          this.dataService.present().then((loader) => {
            loader.present();
            this.dataService.enableCancelForLoader();
            this.dataService.currentLoader = 'file';
            const dischargedStatus = _.find(this.case.caseStatus, (o) => {
              if (o.status === 'Discharge') {
                return o;
              }
            });
            if (dischargedStatus) {
              this.admSnapshotSubscriber = this.firebase.getAdmission(this.case.id).subscribe((resp) => {
                if (resp && resp.length > 0) {
                  const admission = resp[0];
                  this.dataService.setAdmissionData(admission);
                  this.firebase.getUserDetails(this.case.clientId).subscribe((response) => {
                    const patient = response.data();
                    const patientInitials = this.dataService.getClientNameInitials(patient.name);
                    const date = new Date();
                    const year = date.getFullYear();
                    let month: any = date.getMonth();
                    month = month + 1;
                    if (month < 10) {
                      month = '0' + month;
                    }
                    let day: any = date.getDate();
                    if (day < 10) {
                      day = '0' + day;
                    }
                    const M = date.toDateString().substr(4, 3);
                    const extension = event.target.files[0].name.split('.')[event.target.files[0].name.split('.').length - 1];
                    // eslint-disable-next-line no-underscore-dangle
                    const _foldername = this.folderName.replace(/ /g, '_');
                    const filename = year + '' + month + '' + day + '_'
                      + admission.case.facilities.replace(/[!&\/\\#., +=^()$~%'":*?<>{}-]/g, '_') + '_'
                      + _foldername + '_'
                      + patientInitials + '.' + extension;
                    const fileObjectToUpload = {
                      body: '',
                      name: '',
                      size: 0,
                      key: '',
                      arrayBuffer: null,
                    };
                    fileObjectToUpload.body = event.target.files[0];
                    fileObjectToUpload.name = filename;
                    fileObjectToUpload.size = event.target.files[0].size;
                    fileObjectToUpload.key = environment.aws.bucketRootKey + '/'
                      + this.case.clientId + '/'
                      + this.case.id + '/'
                      // + environment.aws.bucketDischargeDocumentsPath + '/'
                      + this.bucketFolderName + '/'
                      + fileObjectToUpload.name;
                    fileObjectToUpload.arrayBuffer = event.target.files[0];
                    this.fileToUpload.push(fileObjectToUpload);
                    const obj = {
                      fileUploadKey: fileObjectToUpload.key,
                      fileUploadSize: this.formatBytes(event.target.files[0].size),
                      fileUploadDate: date,
                    };
                    this.dataService.dismiss();
                    this.uploadFilesToAWS(obj);
                  });
                } else {
                  this.dataService.dismiss();
                  this.dataService.presentAlert('Cannot upload document since admission details are not filled completely!');
                }
              });
            } else {
              this.dataService.dismiss();
              this.dataService.presentAlert('Cannot upload document since the patient is not discharged!');
            }
          });
        } else {
          this.dataService.presentAlert('Please select a pdf file only!');
        }
      }
    } else {
      this.dataService.presentAlert('Please check your internet connection!');
    }
  }
  public uploadFilesToAWS(newFileObj) {
    this.loadingController.create({
      spinner: 'bubbles',
      keyboardClose: true,
      cssClass: 'progress-bar-loader',
      message: '<span class="upload - percent">Uploading... ' + this.uploadPercent + ' %</span>',
    }).then((loader) => {
      loader.present();
      this.dataService.enableCancelForLoader();
      this.dataService.currentLoader = 'pdf';
      this.awsService.uploadFilesAWS(this.fileToUpload, (data: any) => {
        if (this.folderName === 'Discharge Summary') {
          this.case.dischargeDocsChecklistCheckbox.dischargeSummary = true;
        } else if (this.folderName === 'Interim Bill') {
          this.case.dischargeDocsChecklistCheckbox.interimBill = true;
        } else if (this.folderName === 'Hospitalisation Leave') {
          this.case.dischargeDocsChecklistCheckbox.hospitalisationLeave = true;
        } else if (this.folderName === 'Medical Report') {
          this.case.dischargeDocsChecklistCheckbox.medicalReport = true;
        }
        const date = new Date().toString();
        this.case.caseFolders.discharge = date;
        this.firebase.editCase(this.case).then(() => {
          this.dataService.setSelectedCase(this.case);
          this.allFiles.push(newFileObj);
          this.fileNames = [];
          this.fileNames = this.dataService.getFileNamesFromFiles(this.allFiles, 'discharge-docs-checklist');
          loader.dismiss().then(() => {
            this.dataService.showCancelLoader = false;
            this.alertCtrl.create({
              header: this.folderName + ' uploaded successfully!',
              cssClass: 'alertDiv',
              message: '',
              buttons: [
                {
                  text: 'Ok',
                  handler: () => {
                    this.isFolderSelected = true;
                    this.isFileAlreadyUploaded = true;
                    this.selectFolder(this.folderName);
                  },
                },
              ],
            }).then((alertEl) => {
              alertEl.present();
            });
          });
        });
      }, (err) => {
        this.dataService.dismiss();
      }, (progress) => {
        this.dataService.currentLoader = 'aws';
        this.uploadPercent = Math.ceil(progress.uploadedPercent);
        this.uploadProgress = this.uploadPercent / 100;
        const progressVal = '<span class="upload-percent">Uploading... ' + this.uploadPercent + ' %</span>';
        loader.message = progressVal;
      });
    });
  }
  public formatBytes(bytes, decimals = 0) {
    if (bytes === 0) { return '0 Bytes'; }
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    // eslint-disable-next-line radix
    return parseInt((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }
  public servicesSearchTextFocusOut() {
    if (this.nameToSearch !== '') {
      this.nameToSearch = '';
    }
  }
  public servicesSearchTextChanged() {
    if (this.nameToSearch !== '') {
      this.nameToSearch = '';
    }
  }
  public searchPdf() {
    this.nameToSearch = this.nameToSearch.trim().replace(/\s\s+/g, ' ');
    this.fileNames.forEach((c) => {
      if (c.fileName.toLowerCase().includes(this.nameToSearch.toLowerCase()) || this.nameToSearch === '') {
        c.show = true;
      } else {
        c.show = false;
      }
    });
  }
  public sortFilenames() {
    let allFilenames = [];
    allFilenames = this.allFiles.sort((a, b) => {
      const dateA = new Date(a.fileUploadDate);
      const dateB = new Date(b.fileUploadDate);
      if (dateA < dateB) {
        return 1;
      } else {
        return -1;
      }
    });
    return allFilenames;
  }
  public shareToWhatsapp(filename) {
    this.dataService.present().then((loader) => {
      loader.present();
      const message = this.folderName;
      const subject = this.folderName;
      if (!this.internetCheckFlag) {
        this.socialSharing.share(message, subject, filename, null)
          .then(() => {
            this.dataService.dismiss();
          })
          .catch(() => {
            this.dataService.dismiss();
          });
      } else {
        this.dataService.dismiss();
        this.dataService.presentAlert('Please check your internet connection!');
      }
    });
  }
  public onProgress(event) {
    if (!this.isOpenFileCancelled) {
      let percentLoad = '0';
      percentLoad = ((event.loaded / event.total) * 100).toFixed(0);
      if (!percentLoad || percentLoad === 'NaN') {
        percentLoad = '0';
      }
      this.loader.message = '<span class="upload-percent">Loading... ' + percentLoad + ' %</span>';
    }
  }
  public afterLoadComplete(event) {
    this.dataService.dismiss();
  }
  public goToCaseProfile() {
    this.dataService.routeChange('/client-case-profile');
  }
  public delete(file) {
    this.alertCtrl.create({
      header: 'Delete',
      message: 'Are you sure you want to delete ' + file.showFileName + ' ?',
      cssClass: 'alertDiv',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
            file.showDropdown = false;
          },
        },
        {
          text: 'Yes, delete',
          handler: () => {
            this.deleteFile(file);
          },
        },
      ],
    }).then((alert) => {
      alert.present();
    });
  }
  public deleteFile(file) {
    this.dataService.setShowLoaderCancel(false);
    this.dataService.present().then((loader) => {
      loader.present();
      if (!this.internetCheckFlag) {
        this.awsService.deleteFileAWS(file.fileName).then(() => {
          this.currentFileObj = null;
          this.isFolderSelected = true;
          if (this.folderName === 'Discharge Summary') {
            this.case.dischargeDocsChecklistCheckbox.dischargeSummary = false;
            this.isFileAlreadyUploaded = false;
          } else if (this.folderName === 'Interim Bill') {
            this.case.dischargeDocsChecklistCheckbox.interimBill = false;
            this.isFileAlreadyUploaded = false;
          } else if (this.folderName === 'Hospitalisation Leave') {
            this.case.dischargeDocsChecklistCheckbox.hospitalisationLeave = false;
            this.isFileAlreadyUploaded = false;
          } else if (this.folderName === 'Medical Report') {
            this.case.dischargeDocsChecklistCheckbox.medicalReport = false;
            this.isFileAlreadyUploaded = false;
          }
          this.firebase.editCase(this.case).then(() => {
            this.dataService.setSelectedCase(this.case);
            this.dataService.dismiss();
            this.dataService.presentAlert(file.showFileName + ' deleted successfully!');
          });
        }).catch(() => {
          this.dataService.dismiss();
          this.dataService.presentAlert('Something went wrong while deleting file!');
        });
      } else {
        this.dataService.dismiss();
        this.dataService.presentAlert('Please check your internet connection!');
      }
    });
  }
  public ionViewDidLeave() {
    this.currentFileObj = null;
    this.folderName = '';
    if (this.admSnapshotSubscriber) {
      this.admSnapshotSubscriber.unsubscribe();
    }
  }
  public downloadFile() {
    if (environment.isWeb) {
      const link = document.createElement('a');
      link.href = this.currentFileObj.fileName;
      link.download = this.currentFileObj.showFileName;
      link.click();
    } else {
      const fileUrl = this.currentFileObj.fileName;
      console.log('fileUrl: ', fileUrl);
      const filename = this.currentFileObj.showFileName;
      console.log('filename: ', filename);
      let fileDir: string;
      const filePath = filename;
      // const clientDetails = this.dataService.getPatientData();
      if (this.case.name) {
        // filePath = 'Premium Care/' + this.clientDetails.name + '/' + this.case.name + '/' + filename;
        fileDir = 'Premium Care/' + this.clientDetails.name + '/' + this.case.name;
      } else {
        fileDir = 'Premium Care/' + this.clientDetails.name;
      }
      const file = {
        fileName: filePath,
        filePath: fileUrl,
        fileDir
      };
      this.downloadService.downloadFile(file);
    }
  }
  public openCamera() {
    let oldObj = this.dataService.getDefectPhotosObj();
    // todo find lodash alternative or use ternary operator
    if (oldObj) {
      oldObj.mode = 'capture';
    } else {
      oldObj = {
        mode: 'capture',
      };
    }
    const awsPath = environment.aws.bucketRootKey + '/'
      + this.case.clientId + '/'
      + this.case.id + '/'
      + environment.aws.bucketDischargeDocumentsPath;
    this.dataService.setAwsBucketPath(awsPath);
    this.dataService.setDefectPhotosObj(oldObj);
    this.dataService.setFolderName(this.folderName);
    this.insuranceDocsService.setExistingFiles(this.fileNames);
    this.dataService.present().then(loader => {
      loader.present();
      this.admSnapshotSubscriber = this.firebase.getAdmission(this.case.id).subscribe((resp) => {
        if (resp && resp.length > 0) {
          const admission = resp[0];
          this.dataService.setAdmissionData(admission);
          this.dataService.dismiss();
          this.router.navigateByUrl('client-case-folders/camera');
        }
      }, (err) => {
        this.dataService.dismiss();
      });
    });
  }
}
