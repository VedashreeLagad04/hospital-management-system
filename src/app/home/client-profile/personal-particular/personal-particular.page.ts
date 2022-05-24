import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LoadingController } from '@ionic/angular';
import * as _ from 'lodash';
import { AppDataService } from 'src/app/services/app-data.service';
import { AwsService } from 'src/app/services/aws.service';
import { environment } from 'src/environments/environment';
import { SocialSharing } from '@ionic-native/social-sharing/ngx';
import { DownloadFileService } from 'src/app/services/download-file.service';
@Component({
  selector: 'app-personal-particular',
  templateUrl: './personal-particular.page.html',
  styleUrls: ['./personal-particular.page.scss'],
})
export class PersonalParticularPage implements OnInit {
  public isWeb = environment.isWeb;
  public nameToSearch;
  public isPdfOpen = false;
  public loggedInUser;
  public allFiles = [];
  public fileNames = [];
  public clientId;
  public fileToUpload = [];
  public uploadPercent = 0;
  public uploadProgress;
  public currentFileObj: any;
  public internetCheckFlag = false;
  public loader;
  @ViewChild('file', { static: false }) public inputFile: ElementRef;
  // tslint:disable-next-line: max-line-length
  constructor(private socialSharing: SocialSharing, public dataService: AppDataService, private awsService: AwsService, private activeRoute: ActivatedRoute, private loadingController: LoadingController,
    private router: Router, private downloadService: DownloadFileService) { }
  public ionViewDidEnter() {
    this.activeRoute.params.subscribe((params) => {
      this.clientId = params.id;
      this.dataService.present().then((loader) => {
        loader.present();
        // ! delete function not needed in app
        // ? when you need to delete file from aws, use this function
        // this.awsService.deleteFileAWS("root/Bedz7usHDJ5iY8Z8MGfo/personal-particulars/20201020 Pre-Admission Checklist AM.pdf");
        this.loggedInUser = this.dataService.getUserData();
        const obj = {
          title: 'Personal Particular',
          backPage: 'client-profile/' + this.clientId,
        };
        this.dataService.setHeaderTitle(obj);
        const folderName = 'root/' + this.clientId + '/' + environment.aws.bucketPersonalParticularsPath;
        // const folderName = 'root/' + this.clientId;
        this.awsService.getFiles(folderName).then((resp) => {
          let response: any = resp;
          if (response.length > 0) {
            this.allFiles = response;
            // response = this.sortFilenames();
            // ? sorting is done in dataService.getFileNamesFromFiles()
            this.fileNames = this.dataService.getFileNamesFromFiles(response, 'personal-particular');
          }
          this.dataService.dismiss();
        }).catch((err) => {
          this.dataService.dismiss();
        });
      });
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
        // add your code you want to perform on re-loading page here
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
  public openFile(file) {
    if (file && file.fileSize === 0) {
      this.dataService.presentAlert('Cannot open ' + file.fileName + ' because it is corrupted!');
    } else {
      this.isPdfOpen = true;
      if (this.currentFileObj && this.currentFileObj.showFileName && this.currentFileObj.showFileName === file.fileName) {
        // this.dataService.dismiss();
      } else {
        this.dataService.present().then((a) => {
          this.loader = a;
          this.loader.present();
          this.dataService.currentLoader = 'preview-pdf';
          this.currentFileObj = this.dataService.openFile(file, this.allFiles);
          if (this.currentFileObj && this.currentFileObj.fileName === '') {
            this.isPdfOpen = false;
            this.dataService.dismiss();
            this.dataService.presentAlert('Could not open file. Try again!');
          }
        });
      }
    }
  }
  public onProgress(event) {
    let percentLoad = '0';
    percentLoad = ((event.loaded / event.total) * 100).toFixed(0);
    if (!percentLoad || percentLoad === 'NaN') {
      percentLoad = '0';
    }
    this.loader.message = '<span class="upload-percent">Loading... ' + percentLoad + ' %</span>';
  }
  public afterLoadComplete() {
    this.dataService.dismiss();
  }
  public fileClick() {
    this.inputFile.nativeElement.value = '';
  }
  public uploadFiles(event: any) {
    if (event.target.files.length > 0) {
      this.dataService.present().then((loader) => {
        loader.present();
        this.dataService.enableCancelForLoader();
        this.dataService.currentLoader = 'file';
        let date;
        date = new Date();
        const fileObjectToUpload = {
          body: '',
          name: '',
          size: 0,
          key: '',
          arrayBuffer: null,
        };
        fileObjectToUpload.body = event.target.files[0];
        // const nameAlreadyPresentIndex = _.findIndex(this.fileNames, (o) => {
        //   if (o.fileName === event.target.files[0].name) {
        //     return o;
        //   }
        // });
        // const splittedFilename = event.target.files[0].name.split('.')[0];
        // const alreadyPresentNames = _.filter(this.fileNames, (o) => {
        //   if (_.includes(o.fileName, splittedFilename)) {
        //     return o;
        //   }
        // });
        // // if (nameAlreadyPresentIndex > -1) {
        // 
        // if (alreadyPresentNames.length > 0) {
        //   // fileObjectToUpload.name = this.dataService.getNextFileName(event.target.files[0].name, null, null, null, 'name-wise', '');
        //   fileObjectToUpload.name = event.target.files[0].name.split('.')[0] +
        //     '(' + alreadyPresentNames.length + ')' + '.' +
        //     event.target.files[0].name.split('.')[1];
        // } else {
        //   fileObjectToUpload.name = event.target.files[0].name;
        // }
        // const selectedFilename = event.target.files[0].name.split('.')[0];
        const splitArr = event.target.files[0].name.split('.');
        splitArr.splice(-1);
        const selectedFilename = splitArr.join('.');
        const splittedName = selectedFilename.replace(/[!&\/\\#., +=^()$~%'":*?<>{}]/g, '_');
        let splittedFileName;
        const fileCountArr = [];
        // const alreadyPresentName = _.find(this.files, (o) => {
        const alreadyPresentName = _.filter(this.fileNames, (o) => {
          splittedFileName = o.fileName.split('.')[0].replace(/ /g, '_');
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
            // fileObjectToUpload.name = selectedFilename.split('.')[0] +
            fileObjectToUpload.name = splittedName +
              '-' + (maxCount + 1) + '.'
              + extension;
          } else {
            fileObjectToUpload.name = splittedName + '.' + extension;
          }
        } else {
          fileObjectToUpload.name = splittedName + '.' + extension;
        }
        fileObjectToUpload.size = event.target.files[0].size;
        fileObjectToUpload.key = environment.aws.bucketRootKey + '/'
          + this.clientId + '/'
          + environment.aws.bucketPersonalParticularsPath + '/'
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
    }
  }
  public uploadFilesToAWS(newFileObj) {
    this.loadingController.create({
      // spinner: null,
      spinner: 'bubbles',
      keyboardClose: true,
      cssClass: 'progress-bar-loader',
      // tslint:disable-next-line: max-line-length
      // message: '<ion-progress-bar color="primary" value="0.4"></ion-progress-bar><span class="upload - percent">Uploading... ' + this.uploadPercent + ' %</span>'
      message: '<span class="upload - percent">Uploading... ' + this.uploadPercent + ' %</span>',
    }).then((loader) => {
      loader.present();
      this.dataService.enableCancelForLoader();
      this.dataService.currentLoader = 'aws';
      this.awsService.uploadFilesAWS(this.fileToUpload, (data: any) => {
        this.allFiles.unshift(newFileObj);
        this.fileNames = [];
        // this.allFiles = this.sortFilenames();
        // ? sorting is done in dataService.getFileNamesFromFiles()
        this.fileNames = this.dataService.getFileNamesFromFiles(this.allFiles, 'personal-particular');
        this.dataService.dismiss();
      }, (err) => {
        this.dataService.dismiss();
      }, (progress) => {
        this.dataService.currentLoader = 'aws';
        this.uploadPercent = Math.ceil(progress.uploadedPercent);
        this.uploadProgress = this.uploadPercent / 100;
        // tslint:disable-next-line: max-line-length
        // let progressVal = '<ion-progress-bar value="' + this.uploadProgress + '"></ion-progress-bar><span class="upload-percent">Uploading... ' + this.uploadPercent + ' %</span>';
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
    // tslint:disable-next-line: radix
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
      const clientDetails = this.dataService.getPatientData();
      const caseData = this.dataService.getSelectedCase();
      if (caseData.name) {
        // filePath = 'Premium Care/' + this.clientDetails.name + '/' + this.case.name + '/' + filename;
        fileDir = 'Premium Care/' + clientDetails.name + '/' + caseData.name;
      } else {
        fileDir = 'Premium Care/' + clientDetails.name;
      }
      const file = {
        fileName: filePath,
        filePath: fileUrl,
        fileDir
      };
      this.downloadService.downloadFile(file);
    }
  }
  public shareToWhatsapp(filename) {
    this.dataService.present().then((loader) => {
      loader.present();
      const message = this.currentFileObj.fileName;
      const subject = this.currentFileObj.fileName;
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
