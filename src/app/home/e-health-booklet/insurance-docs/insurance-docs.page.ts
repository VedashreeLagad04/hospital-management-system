import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
// import { ImagePicker, ImagePickerOptions } from '@ionic-native/image-picker/ngx';
import { ScreenOrientation } from '@ionic-native/screen-orientation/ngx';
import { AlertController, ModalController, Platform } from '@ionic/angular';
import { LoadingController } from '@ionic/angular';
import * as _ from 'lodash';
import { AppDataService } from 'src/app/services/app-data.service';
import { AwsService } from 'src/app/services/aws.service';
import { FirebaseService } from 'src/app/services/firebase.service';
import { SocialSharing } from '@ionic-native/social-sharing/ngx';
import { InsuranceDocsService } from 'src/app/services/insurance-docs.service';
import { environment } from 'src/environments/environment';
import { FileOpenerModalComponent } from './file-opener-modal/file-opener-modal.component';
@Component({
  selector: 'app-insurance-docs',
  templateUrl: './insurance-docs.page.html',
  styleUrls: ['./insurance-docs.page.scss'],
})
export class InsuranceDocsPage {
  public isWeb = environment.isWeb;
  public loader;
  public files: any = [];
  public loadingPercentage: any = 0;
  public showLoader = false;
  public imageResponse: any;
  public searchText: any;
  public showPdf = false;
  public showImage = false;
  public showDocx = false;
  public currentFile: any = '';
  public showCurrentFile: any = '';
  public selectedImages: any = [];
  public pdfContent: any = [];
  public case: any;
  public ehealth: any;
  public fileToUpload = [];
  public uploadPercent = 0;
  public uploadProgress;
  public loggedInUser;
  internetCheckFlag = false;
  public isOpenFileCancelled = false;
  @ViewChild('uploadFile', { static: false }) public inputFile: ElementRef;
  constructor(private socialSharing: SocialSharing, private modalController: ModalController,
    private insuranceDocsService: InsuranceDocsService,
    private loadingController: LoadingController,
    // private imagePicker: ImagePicker,
    private router: Router,
    private dataService: AppDataService,
    private screenOrientation: ScreenOrientation,
    private firebase: FirebaseService,
    private awsService: AwsService,
    private alertCtrl: AlertController,
  ) {
    dataService.subscribeLoaderCancel.subscribe((resp) => {
      this.isOpenFileCancelled = resp;
      if (resp) {
        // this.isFolderOpened = false;
        this.currentFile = null;
        this.showCurrentFile = null;
      }
    });
  }
  public ngOnInit() {
    this.dataService.mySubscription = this.dataService.createOnline$().subscribe(async (isOnline) => {
      if (isOnline === false) {
        this.internetCheckFlag = true;
        this.dataService.toastPresent('Internet disconnected');
      } else if (isOnline === true && this.internetCheckFlag) {
        this.router.routeReuseStrategy.shouldReuseRoute = () => {
          return false;
        };
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
  public ionViewWillEnter() {
    const prevCase = this.case;
    this.case = this.dataService.getSelectedCase();
    if (prevCase && prevCase.id && this.case.id !== prevCase.id) {
      this.showPdf = false;
      this.currentFile = '';
      this.showCurrentFile = '';
      this.files = [];
      this.searchText = '';
    }
  }
  ionViewDidLeave() {
    this.showPdf = false;
    this.currentFile = '';
    this.showCurrentFile = '';
    this.files = [];
    this.searchText = '';
  }
  public ionViewDidEnter() {
    this.getEhealthData();
  }
  public getEhealthData() {
    this.dataService.present().then((loader) => {
      loader.present();
      // this.case = this.dataService.getSelectedCase();
      this.loggedInUser = this.dataService.getUserData();
      // this.insuranceDocsService.getInsuranceDocs().subscribe((insuranceDocs: any) => {
      //   insuranceDocs.forEach((doc) => {
      //     const tempFiles = doc.data();
      //     // 
      //     tempFiles.id = doc.id;
      //     this.files.push(tempFiles);
      //   });
      //   loader.dismiss();
      // });
      // this.firebase.getEhealth(this.case.id).subscribe((resp) => {
      //   this.ehealth = resp.docs[0].data();
      //   this.ehealth.id = resp.docs[0].id;
      this.ehealth = this.dataService.getEhealthData();
      if (this.ehealth && this.ehealth.insuranceDocs && this.ehealth.insuranceDocs.length > 0) {
        this.getFilesFromEhealthData();
      } else {
        this.ehealth.insuranceDocs = [];
        this.files = [];
        this.currentFile = '';
        this.showCurrentFile = '';
      }
      this.dataService.dismiss();
      // });
    });
  }
  public getFilesFromEhealthData() {
    // this.files = this.sortFilenames();
    // this.files = this.dataService.sortFiles(this.ehealth.insuranceDocs);
    // ? sorting is done in dataService.getFileNamesFromFiles()
    this.files = this.dataService.getFileNamesFromFiles(this.ehealth.insuranceDocs, 'insurance-docs');
    console.log('this.ehealth.insuranceDocs: ', this.ehealth.insuranceDocs);
    console.log('this.files: ', this.files);
    return;
  }
  public openDeleteDropdown(event, file) {
    event.stopPropagation();
    this.closeDropdown();
    file.showDropdown = !file.showDropdown;
  }
  public uploadFiles(event: any) {
    // let url = URL.createObjectURL(event.target.files[0])
    // this.fileOpener.open(event.target.value,event.target.files[0].type);
    // this.openModal(event.target.files);
    if (event.target.files.length > 0) {
      this.dataService.present().then((loader) => {
        this.loader = loader;
        loader.present();
        this.dataService.enableCancelForLoader();
        this.dataService.currentLoader = 'file';
        let date;
        date = new Date().toString();
        // var year = date.getFullYear();
        // var month = date.getMonth();
        // month = month + 1;
        // if (month.toString.length == 1) {
        //   month = '0' + month;
        // }
        // var day = date.getDate();
        // if (day.toString.length == 1) {
        //   day = '0' + day;
        // }
        // const filename = year + ' ' + month + ' ' + day + ' '
        //   + this.admission.claims[index].policyName + ' ' + 'Manual Claims Form Submission';
        // 
        const fileObjectToUpload = {
          body: '',
          name: '',
          size: 0,
          key: '',
          arrayBuffer: null,
        };
        fileObjectToUpload.body = event.target.files[0];
        // const nameAlreadyPresentIndex = _.findIndex(this.files, (o: any) => {
        //   if (o.fileName === event.target.files[0].name) {
        //     return o;
        //   }
        // });
        // if (nameAlreadyPresentIndex > -1) {
        //   fileObjectToUpload.name = this.dataService.getNextFileName(event.target.files[0].name, null, null, null, 'name-wise', '');
        // } else {
        //   fileObjectToUpload.name = event.target.files[0].name;
        // }
        // const selectedFilename = event.target.files[0].name.replace(/ /g, '_');
        // const selectedFilename = event.target.files[0].name.split('.')[0];
        const splitArr = event.target.files[0].name.split('.');
        splitArr.splice(-1);
        const selectedFilename = splitArr.join('.');
        let splittedName = selectedFilename.replace(/[!&\/\\#., +=^()$~%'":*?<>{}]/g, '_');
        let splittedFileName;
        const fileCountArr = [];
        // const alreadyPresentName = _.find(this.files, (o) => {
        const alreadyPresentName = _.filter(this.files, (o) => {
          // const currFilename = o.fileName.replace(/\(/, '-').replace(/\)\./, '.');
          splittedFileName = o.actualFilename.split('/')[4].split('.')[0];
          if (_.includes(splittedFileName, splittedName)) {
            const filenumber = splittedFileName.split('-');
            const isnum = /^\d+$/.test(filenumber[filenumber.length - 1]);
            let concatFilename;
            concatFilename = filenumber[0];
            if (filenumber.length > 1) {
              for (let i = 1; i < filenumber.length - 1; i++) {
                concatFilename = concatFilename + '-' + filenumber[i];
              }
            }
            if (splittedFileName === splittedName) {
              fileCountArr.push(0);
              return o;
            } else if (isnum && concatFilename === splittedName) {
              let count = filenumber[filenumber.length - 1].split('.')[0];
              fileCountArr.push(parseInt(count));
              return o;
            }
          }
        });
        const extension = event.target.files[0].name.split('.')[event.target.files[0].name.split('.').length - 1];
        // if (nameAlreadyPresentIndex > -1) {
        // if (alreadyPresentName && alreadyPresentName !== '') {
        if (alreadyPresentName && alreadyPresentName.length > 0) {
          // fileObjectToUpload.name = event.target.files[0].name.split('.')[0] +
          // '(' + alreadyPresentName.length + ')' + '.' +
          // event.target.files[0].name.split('.')[1];
          // fileObjectToUpload.name = this.dataService.getNextFileName(alreadyPresentName.fileName, null, null, null, 'name-wise', '');
          const maxCount = _.max(fileCountArr);
          if (maxCount !== undefined) {
            fileObjectToUpload.name = splittedName +
              '-' + (maxCount + 1) + '.' + extension;
          } else {
            fileObjectToUpload.name = splittedName + '.' + extension;
          }
        } else {
          fileObjectToUpload.name = splittedName + '.' + extension;
        }
        fileObjectToUpload.size = event.target.files[0].size;
        fileObjectToUpload.key = environment.aws.bucketRootKey + '/'
          + this.case.clientId + '/'
          + this.case.id + '/'
          + environment.aws.bucketInsuranceDocumentsPath + '/'
          + fileObjectToUpload.name;
        fileObjectToUpload.arrayBuffer = event.target.files[0];
        this.fileToUpload.push(fileObjectToUpload);
        const obj = {
          fileUploadKey: fileObjectToUpload.key,
          fileUploadSize: this.formatBytes(event.target.files[0].size),
          fileUploadDate: date,
        };
        this.ehealth.insuranceDocs.push(obj);
        // loader.dismiss();
        if (!this.internetCheckFlag) {
          this.uploadFilesToAWS();
        } else {
          this.dataService.dismiss();
          this.dataService.presentAlert('Please check your internet connection!');
        }
      });
    }
  }
  public fileClick() {
    this.inputFile.nativeElement.value = '';
  }
  public uploadFilesToAWS() {
    // this.dataService.present().then((loader) => {
    //   loader.present();
    this.awsService.uploadFilesAWS(this.fileToUpload, (data: any) => {
      // this.showProgressBar = false;
      // if (this.ehealth.insuranceDocs.length > 1) {
      this.ehealth.checkboxValue.insuranceDocsTab = true;
      // tslint:disable-next-line: no-shadowed-variable
      const obj = {
        tabName: 'insurance-docs',
        value: true,
      };
      this.dataService.setCheckboxValue(obj);
      // }
      this.firebase.editEhealth(this.ehealth).then(() => {
        // this.files = this.sortFilenames();
        // this.files = this.dataService.sortFiles(this.ehealth.insuranceDocs);
        this.dataService.setEhealthData(this.ehealth);
        this.getFilesFromEhealthData();
        this.dataService.presentAlert('Insurance doc uploaded successfully!');
        this.dataService.dismiss();
      });
    }, (err) => {
      this.dataService.dismiss();
    }, (progress) => {
      this.dataService.currentLoader = 'aws';
      this.uploadPercent = Math.ceil(progress.uploadedPercent);
      this.uploadProgress = this.uploadPercent / 100;
      // tslint:disable-next-line: max-line-length
      // let progressVal = '<ion-progress-bar value="' + this.uploadProgress + '"></ion-progress-bar><span class="upload-percent">Uploading... ' + this.uploadPercent + ' %</span>';
      const progressVal = '<span class="upload-percent">Uploading... ' + this.uploadPercent + ' %</span>';
      this.loader.message = progressVal;
    });
    // });
  }
  public async openModal(docs: any) {
    const modal = await this.modalController.create({
      component: FileOpenerModalComponent,
      cssClass: 'my-custom-modal-css',
      componentProps: {
        File: docs,
        existingFiles: this.files,
        totalFiles: this.files.length,
      },
    });
    modal.onDidDismiss().then((response) => {
      const newFiles: any = response.data;
      if (newFiles !== undefined) {
        for (const file of this.files) {
          newFiles.push(file);
        }
        this.files = [];
        this.files = newFiles;
      }
    });
    return await modal.present();
  }
  public openFile(doc: any) {
    // doc.fileName = doc.fileName.replace(/ /g, '_');
    const fileName = doc.fileName.replace(/ /g, '_');
    if (doc && doc.fileSize === 0) {
      this.dataService.presentAlert('Cannot open ' + fileName + ' because it is corrupted!');
    } else {
      this.dataService.present().then((a) => {
        this.loader = a;
        this.loader.present();
        this.dataService.enableCancelForLoader();
        this.dataService.currentLoader = 'preview-pdf';
        let openFilename: any;
        if (this.currentFile !== undefined && !this.dataService.isCancelled) {
          // const openFilename = environment.aws.bucketAccessRootPath +
          //   environment.aws.bucketRootKey + '/'
          //   + this.case.clientId + '/'
          //   + this.case.id + '/'
          //   + environment.aws.bucketInsuranceDocumentsPath + '/'
          //   + fileName;
          openFilename = environment.aws.bucketAccessRootPath + doc.actualFilename;
          if (openFilename === this.currentFile) {
            this.dataService.dismiss();
            return;
          }
        }
        // if (doc.fileName.includes('pdf')){
        this.showPdf = true;
        // const filename = _.filter(this.ehealth.insuranceDocs, (insurancedoc) => {
        //   const fileKey = insurancedoc.fileUploadKey.replace(/ /g, '_');
        //   // if (fileKey.includes(doc.fileName)) {
        //   if (fileKey.includes(fileName)) {
        //     return insurancedoc;
        //   }
        // });
        // 
        // if (filename && filename.length > 0) {
        if (!this.internetCheckFlag) {
          // this.currentFile = environment.aws.bucketAccessRootPath + filename[0].fileUploadKey;
          this.currentFile = openFilename;
          this.showCurrentFile = doc.fileName;
        } else {
          this.dataService.dismiss();
          this.dataService.presentAlert('Please check your internet connection!');
        }
        // } else {
        //   this.dataService.dismiss();
        //   this.dataService.presentAlert('Could not open file!');
        // }
      });
    }
  }
  public formatBytes(bytes, decimals = 0) {
    if (bytes === 0) { return '0 Bytes'; }
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    // tslint:disable-next-line: radix
    return parseInt((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
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
  public afterLoadComplete(event: any) {
    this.dataService.dismiss();
  }
  public sortFilenames() {
    let allFilenames = [];
    allFilenames = this.ehealth.insuranceDocs.sort((a, b) => {
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
  public deleteFile(file, index) {
    this.alertCtrl.create({
      header: 'Delete',
      message: 'Are you sure you want to delete ' + file.fileName + ' ?',
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
            this.delete(file, index);
          },
        },
      ],
    }).then((alert) => {
      alert.present();
    });
  }
  public delete(file, index) {
    this.dataService.setShowLoaderCancel(false);
    this.dataService.present().then((loader) => {
      loader.present();
      const selectedFile = file.fileName.replace(/ /g, '_');
      const selectedFileIndex = _.findIndex(this.ehealth.insuranceDocs, (o: any) => {
        // if (o.fileUploadKey.split('/')[4] === file.fileName) {
        if (o.fileUploadKey.split('/')[4] === selectedFile) {
          return o;
        }
      });
      const fileUploadKey = this.ehealth.insuranceDocs[selectedFileIndex].fileUploadKey;
      if (!this.internetCheckFlag) {
        this.awsService.deleteFileAWS(fileUploadKey).then(() => {
          this.ehealth.insuranceDocs.splice(selectedFileIndex, 1);
          this.getFilesFromEhealthData();
          if (this.ehealth.insuranceDocs.length === 0) {
            this.ehealth.checkboxValue.insuranceDocsTab = false;
            // tslint:disable-next-line: no-shadowed-variable
            const obj = {
              tabName: 'insurance-docs',
              value: false,
            };
            this.dataService.setCheckboxValue(obj);
          }
          this.firebase.editEhealth(this.ehealth).then(() => {
            this.dataService.setEhealthData(this.ehealth);
            this.dataService.dismiss();
            this.dataService.presentAlert(file.fileName + ' deleted successfully');
            this.showPdf = false;
            this.currentFile = '';
            this.showCurrentFile = '';
          }).catch(() => {
            this.dataService.dismiss();
            this.dataService.presentAlert('Something went wrong while updating e-health data!');
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
  public closeDropdown() {
    for (let i = 0; i < this.files.length; i++) {
      const element = this.files[i];
      element.showDropdown = false;
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
      + environment.aws.bucketInsuranceDocumentsPath;
    this.dataService.setAwsBucketPath(awsPath);
    this.dataService.setDefectPhotosObj(oldObj);
    this.insuranceDocsService.setExistingFiles(this.files);
    this.router.navigateByUrl('client-case-folders/camera');
  }
  public downloadFile() {
    const link = document.createElement('a');
    link.href = this.currentFile;
    link.download = this.currentFile;
    link.click();
  }
  public shareToWhatsapp(filename) {
    this.dataService.present().then((loader) => {
      loader.present();
      const message = this.currentFile;
      const subject = this.currentFile;
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
}
