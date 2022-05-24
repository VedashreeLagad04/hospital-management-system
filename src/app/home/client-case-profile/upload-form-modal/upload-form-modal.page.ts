import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { LoadingController, ModalController } from '@ionic/angular';
import * as _ from 'lodash';
import { AppDataService } from 'src/app/services/app-data.service';
import { AwsService } from 'src/app/services/aws.service';
import { FirebaseService } from 'src/app/services/firebase.service';
import { environment } from 'src/environments/environment';
@Component({
  selector: 'app-upload-form-modal',
  templateUrl: './upload-form-modal.page.html',
  styleUrls: ['./upload-form-modal.page.scss'],
})
export class UploadFormModalPage implements OnInit {
  @Input() public case: any;
  public loader: HTMLIonLoadingElement;
  public isPdfOpen: boolean;
  public currentFileObj: { fileName: string; fileType: string; };
  public clientId: string;
  public fileToUpload = [];
  public uploadPercent = 0;
  public uploadProgress: number;
  public allFiles = [];
  public fileNames = [];
  @ViewChild('file', { static: false }) public inputFile: ElementRef;
  constructor (private modalCtrl: ModalController,
    private dataService: AppDataService,
    private awsService: AwsService,
    private activeRoute: ActivatedRoute,
    private loadingController: LoadingController,
    private firebase: FirebaseService) { }
  public ngOnInit() {
    this.clientId = this.case.clientId;
    this.getAllFiles();
  }
  public dismiss(status) {
    this.modalCtrl.dismiss({
      data: status,
    });
  }
  getAllFiles() {
    const folderName = 'root/' + this.clientId + '/' + this.case.id + '/' + environment.aws.bucketAdmissionDocumentsPath;
    this.awsService.getFiles(folderName).then((resp) => {
      let response: any = resp;
      if (response.length > 0) {
        this.allFiles = response;
        // ? sorting is done in dataService.getFileNamesFromFiles()
        // response = this.sortFilenames();
        this.fileNames = this.dataService.getFileNamesFromFiles(response, 'admission');
      }
    }).catch((err) => {
    });
  }
  public openFile(file) {
    this.dataService.present().then((a) => {
      this.loader = a;
      this.loader.present();
      this.isPdfOpen = true;
      this.currentFileObj = this.dataService.openFile(file, this.allFiles);
    });
  }
  public onProgress(event) {
    let percentLoad = ((event.loaded / event.total) * 100).toFixed(0);
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
        fileObjectToUpload.body = event.target.files[0];
        const selectedFilename = event.target.files[0].name.replace(/ /g, '_');
        const splittedName = selectedFilename.split('.')[0];
        let splittedFileName;
        const fileCountArr = [];
        // const alreadyPresentName = _.find(this.files, (o) => {
        const alreadyPresentName = _.filter(this.allFiles, (o) => {
          const filenameInArr = o.fileUploadKey.split('/')[4];
          const currFilename = filenameInArr.replace(/\(/, '-').replace(/\)\./, '.');
          splittedFileName = currFilename.split('.')[0];
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
        // if (nameAlreadyPresentIndex > -1) {
        // if (alreadyPresentName && alreadyPresentName !== '') {
        if (alreadyPresentName && alreadyPresentName.length > 0) {
          // fileObjectToUpload.name = event.target.files[0].name.split('.')[0] +
          // '(' + alreadyPresentName.length + ')' + '.' +
          // event.target.files[0].name.split('.')[1];
          // fileObjectToUpload.name = this.dataService.getNextFileName(alreadyPresentName.fileName, null, null, null, 'name-wise', '');
          const maxCount = _.max(fileCountArr);
          if (maxCount !== undefined) {
            fileObjectToUpload.name = selectedFilename.split('.')[0] +
              '-' + (maxCount + 1) + '.'
              + selectedFilename.split('.')[selectedFilename.split('.').length - 1];
          } else {
            fileObjectToUpload.name = selectedFilename;
          }
        } else {
          fileObjectToUpload.name = selectedFilename;
        }
        fileObjectToUpload.size = event.target.files[0].size;
        fileObjectToUpload.key = environment.aws.bucketRootKey + '/'
          + this.clientId + '/'
          + this.case.id + '/'
          + environment.aws.bucketAdmissionDocumentsPath + '/'
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
  public formatBytes(bytes, decimals = 0) {
    if (bytes === 0) { return '0 Bytes'; }
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    // tslint:disable-next-line: radix
    return parseInt((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
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
      this.awsService.uploadFilesAWS(this.fileToUpload, (data: any) => {
        this.allFiles.push(newFileObj);
        this.fileNames = [];
        // this.allFiles = this.sortFilenames();
        // ? sorting is done in dataService.getFileNamesFromFiles()
        this.fileNames = this.dataService.getFileNamesFromFiles(this.allFiles, 'admission');
        const date = new Date().toString();
        this.case.caseFolders.admission = date;
        this.firebase.editCase(this.case).then(() => {
          this.dataService.setSelectedCase(this.case);
          this.dataService.dismiss();
        });
        this.dataService.dismiss();
      }, (err) => {
        this.dataService.dismiss();
      }, (progress) => {
        this.uploadPercent = Math.ceil(progress.uploadedPercent);
        this.uploadProgress = this.uploadPercent / 100;
        // tslint:disable-next-line: max-line-length
        // let progressVal = '<ion-progress-bar value="' + this.uploadProgress + '"></ion-progress-bar><span class="upload-percent">Uploading... ' + this.uploadPercent + ' %</span>';
        const progressVal = '<span class="upload-percent">Uploading... ' + this.uploadPercent + ' %</span>';
        loader.message = progressVal;
        this.dismiss(true);
      });
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
}
