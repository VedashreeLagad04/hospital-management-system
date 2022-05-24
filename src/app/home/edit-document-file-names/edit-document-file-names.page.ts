import { Component, Input, OnInit } from '@angular/core';
import { ModalController, NavParams } from '@ionic/angular';
import { debug } from 'console';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';
import { AppDataService } from 'src/app/services/app-data.service';
// import * as firebase from 'firebase';
import { AwsService } from 'src/app/services/aws.service';
import { FirebaseService } from 'src/app/services/firebase.service';
import { environment } from 'src/environments/environment';
@Component({
  selector: 'app-edit-document-file-names',
  templateUrl: './edit-document-file-names.page.html',
  styleUrls: ['./edit-document-file-names.page.scss'],
})
export class EditDocumentFileNamesPage implements OnInit {
  @Input()
  public file;
  @Input()
  public admission;
  @Input()
  public index;
  @Input()
  public clientId;
  // docs: any = [];
  public docNameUpdate: any = new Subject<string>();
  public filesToUpload: any = [];
  public uploadProgress: any = 0;
  public uploadPercent = 0;
  public updatedNames: any = [];
  public showProgressBar = false;
  public newFilesAdded: any = [];
  constructor(private navParams: NavParams,
              private dataService: AppDataService,
              private awsService: AwsService,
              private modalCtrl: ModalController,
              private firebase: FirebaseService) { }
  public ngOnInit() {
    // this.file = this.navParams.get('File');
    if (this.file && this.file.length > 0) {
      // ? split the extensions and show filename
      // tslint:disable-next-line: prefer-for-of
      for (let i = 0; i < this.file.length; ++i) {
        const fileExtension = this.file[i].name.split(/[. ]+/).pop();
        const filename = this.file[i].name.split('.' + fileExtension);
        // this.validate.push(false);
        Object.defineProperty(this.file[i], 'name', {
          value: filename[0],
          writable: true,
        });
        this.file[i].fileExtension = fileExtension;
      }
      this.docNameUpdate.pipe(
        debounceTime(3000),
        distinctUntilChanged())
        .subscribe((event: any) => {
          // tslint:disable-next-line: prefer-for-of
          // for (let i = 0; i < this.existingFiles.length; ++i) {
          //   const fileExtension = this.existingFiles[i].fileName.split(/[. ]+/).pop();
          //   const filename = this.existingFiles[i].fileName.split('.' + fileExtension);
          //   // 
          //   if (event.target.value.toLowerCase() === filename[0].toLowerCase()) {
          //     // alert("filename already exists");
          //     if (!(this.isNameExists)) {
          //       this.presentAlert('filename already exists');
          //     }
          //     // this.selectedImages[this.currentImageIndex].fileName = 'image'+'_' + Math.random().toString(36).substr(2, 5);
          //   }
          // }
          if (event.target.value === '') {
            this.dataService.presentAlert('Filename cannot be empty');
            // this.selectedImages[this.currentImageIndex].fileName = 'image'+'_' + Math.random().toString(36).substr(2, 5);
          }
        });
    }
  }
  public uploadFiles() {
    if (this.file[0].name !== '') {
      this.uploadFilesAndCloseModal();
    } else {
      this.dataService.presentAlert('Filename cannot be empty!');
    }
    // if (this.validateFileNames()) {
    //   
    //   this.closeModal();
    // } else {
    //   return;
    // }
  }
  public uploadFilesAndCloseModal() {
    this.convertFilesToArrayBuffer().then((filesObjects: any) => {
      this.showProgressBar = true;
      this.uploadProgress = 0;
      this.uploadPercent = 0;
      this.filesToUpload = [];
      this.newFilesAdded = [];
      /**root> userid> personal particular & caseId
       * caseid> admission docs etc.
       */
      for (let i = 0; i < this.file.length; ++i) {
        const key = environment.aws.bucketRootKey + '/'
          + this.clientId + '/'
          + this.admission.caseId + '/'
          + environment.aws.bucketAdmissionDocumentsPath + '/' + this.file[i].name + '.' + this.file[i].fileExtension;
        const fileObj = {
          arrayBuffer: filesObjects[i].arrayBuffer,
          key,
          name: this.file[i].name + '.' + this.file[i].fileExtension,
          size: this.file[i].size,
          type: this.file[i].type,
        };
        this.filesToUpload.push(fileObj);
        this.admission.claims[this.index].fileUploadKey = key;
      }
      this.uploadFilesToAWS(this.filesToUpload);
    });
  }
  public uploadFilesToAWS(filesToUpload) {
    this.awsService.uploadFilesAWS(filesToUpload, (data: any) => {
      this.showProgressBar = false;
      this.dataService.present().then((loader) => {
        loader.present();
        let date;
        date = new Date();
        const respObj = {
          file: filesToUpload[0],
          date,
        };
        this.admission.claims[this.index].fileUploadDate = date;
        // tslint:disable-next-line: prefer-for-of
        for (let i = 0; i < this.admission.claims.length; i++) {
          delete this.admission.claims[i].showStatusDropdown;
          if (this.admission.claims[i].zeroized) {
            delete this.admission.claims[i].showZeroizedDropdown;
          }
        }
        const msg = 'Claims file';
        this.dataService.saveAdmissionDataToFirebase(this.admission, msg);
        this.modalCtrl.dismiss(respObj);
      });
    }, (err) => {
    }, (progress) => {
      this.uploadPercent = Math.ceil(progress.uploadedPercent);
      this.uploadProgress = this.uploadPercent / 100;
      // if(this.uploadProgress == 1)
      // {
      //   
      //   // this.insuranceDocsService.addFiles(newFilesAdded);
      //   // this.showProgressBar = false;
      //   // 
      //   // 
      //   // this.modalController.dismiss(newFilesAdded);
      // }
    });
  }
  public convertFilesToArrayBuffer() {
    return new Promise((resolve, reject) => {
      const filesAsArrayBuffer = [];
      const that = this;
      for (let i = 0; i < this.file.length; i++) {
        const doc = this.file[i];
        ((index) => {
          // cordova.plugins.photoLibrary.getPhoto(photo, function (blob) {
          const reader = new FileReader();
          reader.onload = function() {
            // imagesAsArrayBuffer[i] = this.result;
            filesAsArrayBuffer[index] = doc;
            filesAsArrayBuffer[index].arrayBuffer = this.result;
            let totalConvertedFiles = 0;
            filesAsArrayBuffer.forEach((img) => {
              totalConvertedFiles++;
            });
            if (totalConvertedFiles === that.file.length) {
              resolve(filesAsArrayBuffer);
            }
          };
          reader.readAsArrayBuffer(that.file[index]);
          // });
        })(i);
      }
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
  public dismiss() {
    this.modalCtrl.dismiss();
  }
}
