import { ChangeDetectorRef, Component, NgZone, OnInit } from '@angular/core';
import { AlertController, ModalController, NavParams } from '@ionic/angular';
// import * as pdfmake from 'pdfmake/build/pdfmake';
// import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import * as firebase from 'firebase';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';
import { AwsService } from 'src/app/services/aws.service';
import { InsuranceDocsService } from 'src/app/services/insurance-docs.service';
import { environment } from 'src/environments/environment';
@Component({
  selector: 'app-file-opener-modal',
  templateUrl: './file-opener-modal.component.html',
  styleUrls: ['./file-opener-modal.component.scss'],
})
export class FileOpenerModalComponent implements OnInit {
  constructor(private modalController: ModalController,
              private navParams: NavParams,
              private awsService: AwsService,
              private insuranceDocsService: InsuranceDocsService,
              private ngZone: NgZone,
              private cdRef: ChangeDetectorRef,
              private alertCtrl: AlertController,
  ) { }
  public fileName: any;
  public docs: any = [];
  public filesToUpload: any = [];
  public uploadProgress: any = 0;
  public uploadPercent = 0;
  public updatedNames: any = [];
  public showProgressBar = false;
  public newFilesAdded: any = [];
  public existingFiles: any = [];
  public totalFiles: any;
  public docNameUpdate: any = new Subject<string>();
  public isBlank = false;
  public isNameExists = false;
  public file1: any = [];
  public ngOnInit() {
    this.docs = [];
    const demo = {
      image: 'qwerty',
    };
    this.file1.push(demo);
    this.docs = this.navParams.get('File');
    this.totalFiles = this.navParams.get('totalFiles');
    this.existingFiles = this.navParams.get('existingFiles');
    // this.updatedNames = new Array<string>(this.docs.length);
    // tslint:disable-next-line: prefer-for-of
    for (let i = 0; i < this.docs.length; ++i) {
      const fileExtension = this.docs[i].name.split(/[. ]+/).pop();
      const filename = this.docs[i].name.split('.' + fileExtension);
      // this.validate.push(false);
      Object.defineProperty(this.docs[i], 'name', {
        value: filename[0],
        writable: true,
      });
      this.docs[i].fileExtension = fileExtension;
    }
    this.docNameUpdate.pipe(
      debounceTime(3000),
      distinctUntilChanged())
      .subscribe((event: any) => {
        // tslint:disable-next-line: prefer-for-of
        for (let i = 0; i < this.existingFiles.length; ++i) {
          const fileExtension = this.existingFiles[i].fileName.split(/[. ]+/).pop();
          const filename = this.existingFiles[i].fileName.split('.' + fileExtension);
          // 
          if (event.target.value.toLowerCase() === filename[0].toLowerCase()) {
            // alert("filename already exists");
            if (!(this.isNameExists)) {
              this.presentAlert('filename already exists');
            }
            // this.selectedImages[this.currentImageIndex].fileName = 'image'+'_' + Math.random().toString(36).substr(2, 5);
          }
        }
        if (event.target.value === '') {
          if (!(this.isBlank)) {
            this.presentAlert('filename cannot be empty');
          }
          // this.selectedImages[this.currentImageIndex].fileName = 'image'+'_' + Math.random().toString(36).substr(2, 5);
        }
      });
  }
  // demo()
  // {
  //   
  // }
  // tslint:disable-next-line: use-lifecycle-interface
  public ngAfterViewInit() {
    this.validateFileNames();
  }
  public async presentAlert(msg: string) {
    const alert = await this.alertCtrl.create({
      message: msg,
      buttons: ['ok'],
    });
    await alert.present();
  }
  // makePdf() {
  //   let filesupload = [];
  //   let demo = [];
  //   let pdftext = [];
  //   pdftext.push(
  //     { text: 'BITCOIN', style: 'header' },
  //     { text: 'Cryptocurrency Payment System', style: 'sub_header' },
  //     { text: 'WEBSITE: https://bitcoin.org/', style: 'url' }
  //   );
  //   pdfmake.vfs = pdfFonts.pdfMake.vfs;
  //   const docDefinition = {
  //   content: [
  //     {
  //       columns: pdftext
  //     }
  //   ],
  //   pageSize: 'A4',
  //   pageOrientation: 'portrait'
  //   };
  //   pdfmake.createPdf(docDefinition).getBuffer((buffer) => {
  //     let utf8 = new Uint8Array(buffer);
  //     let binaryArray = utf8.buffer;
  //     const key = environment.aws.bucketInsuranceDocs + '/' + 'test' + '.pdf';
  //     const fileObj = {
  //       arrayBuffer : binaryArray,
  //       key,
  //       name: 'test' + '.pdf',
  //       size: binaryArray.byteLength
  //    };
  //     const object = {
  //     fileName: 'demo' + '.pdf',
  //     fileType: 'application/pdf',
  //     filePath: environment.aws.bucketAccessRootPath + key,
  //     uploadDate: firebase.firestore.Timestamp.fromDate(new Date()),
  //     fileSize: this.formatBytes(binaryArray.byteLength)
  //     };
  //     demo.push(object);
  //     filesupload.push(fileObj);
  //     // 
  //     this.showProgressBar = true;
  //     this.uploadFilesToAWS(filesupload, demo);
  //     });
  // }
  public validateFileNames() {
    // tslint:disable-next-line: prefer-for-of
    for (let i = 0; i < this.docs.length; ++i) {
      // tslint:disable-next-line: prefer-for-of
      for (let j = 0; j < this.existingFiles.length; ++j) {
        const fileExtension = this.existingFiles[j].fileName.split(/[. ]+/).pop();
        const filename = this.existingFiles[j].fileName.split('.' + fileExtension);
        if (this.docs[i].name.toLowerCase() === filename[0].toLowerCase()) {
          this.isNameExists = true;
          this.presentAlert(this.docs[i].name + ' already exists');
          return false;
        }
      }
      if (this.docs[i].name === '') {
        this.isBlank = true;
        this.presentAlert('filename cannot be empty');
        return false;
      }
    }
    this.isBlank = false;
    this.isNameExists = false;
    return true;
  }
  // validateFileNames()
  // {
  //   let blank = false;
  //   if(this.totalFiles > 0)
  //   {
  //       for (var i = 0; i < this.docs.length; ++i) {
  //         this.validate[i] = false;
  //       }
  //       let flag = 0;
  //       for (var i = 0; i < this.docs.length; ++i) {
  //         flag = 0;
  //         for (var j = 0; j < this.existingFiles.length; ++j) {
  //            if(this.existingFiles[j].fileName == (this.docs[i].name + '.'+this.docs[i].fileExtension))
  //            {
  //              // alert("filename " + this.existingFiles.fileName + "already exits");
  //             //  this.ngZone.run(() => {
  //                this.validate[i] = true;
  //             //  })
  //              this.validateError = true;
  //             this.cdRef.detectChanges();
  //              // let id = "file"+(i.toString());
  //              // document.getElementById(id).innerHTML = "file name already exists";
  //              // flag = 1;
  //            }
  //            else if(this.docs[i].name == "")
  //            {
  //              blank = true;
  //              this.validateError = true;
  //             this.cdRef.detectChanges();
  //              // this.ngZone.run(() => {
  //              //   this.validate[i] = true;
  //              // })
  //              // let id = "file"+(i.toString());
  //              // document.getElementById(id).innerHTML = "file name cannot be blank";
  //            }
  //         }
  //       }
  //       for (var i = 0; i < this.docs.length; ++i) {
  //         if(this.validate[i] == true || blank == true)
  //         {
  //           flag = 1;
  //           this.validateError = true;
  //           this.cdRef.detectChanges();
  //           // if(this.docs[i].name == "")
  //           // {
  //           //   this.validate[i] = true;
  //           //   let id = "file"+(i.toString());
  //           //   document.getElementById(id).innerHTML = "file name cannot be blank";
  //           // }
  //         }
  //       }
  //       if(flag == 0)
  //       {
  //         this.validateError = false;
  //         this.cdRef.detectChanges();
  //       }
  //   }
  //   else
  //   {
  //     for (var i = 0; i < this.docs.length; ++i) {
  //       if(this.docs[i].name == "")
  //       {
  //         blank = true;
  //         this.validateError = true;
  //         this.cdRef.detectChanges();
  //         // this.ngZone.run(() => {
  //         //   this.validate[i] = true;
  //         // })
  //         // let id = "file"+(i.toString());
  //         // document.getElementById(id).innerHTML = "file name cannot be blank";
  //       }
  //     }
  //     if(blank == false)
  //     {
  //       // this.closeModal();
  //       this.validateError = false;
  //       this.cdRef.detectChanges();
  //     }
  //   }
  // }
  public uploadFiles() {
    if (this.validateFileNames()) {
      this.closeModal();
    } else {
      return;
    }
  }
  public async closeModal() {
    this.convertFilesToArrayBuffer().then((filesObjects: any) => {
      this.showProgressBar = true;
      this.uploadProgress = 0;
      this.uploadPercent = 0;
      this.filesToUpload = [];
      this.newFilesAdded = [];
      for (let i = 0; i < this.docs.length; ++i) {
        const key = environment.aws.bucketInsuranceDocumentsPath + '/' + this.docs[i].name + '.' + this.docs[i].fileExtension;
        const fileObj = {
          arrayBuffer: filesObjects[i].arrayBuffer,
          key,
          name: this.docs[i].name + '.' + this.docs[i].fileExtension,
          size: this.docs[i].size,
          type: this.docs[i].type,
        };
        this.filesToUpload.push(fileObj);
        const object = {
          fileName: this.docs[i].name + '.' + this.docs[i].fileExtension,
          fileType: this.docs[i].type,
          filePath: environment.aws.bucketAccessRootPath + key,
          uploadDate: firebase.firestore.Timestamp.fromDate(new Date()),
          fileSize: this.formatBytes(this.docs[0].size),
        };
        this.newFilesAdded.push(object);
        if (i === (this.docs.length - 1)) {
          //  this.filesToUpload.push(this.file1);
          //  this.newFilesAdded.push(this.file2);
          // this.insuranceDocsService.addFiles(this.newFilesAdded);
          this.uploadFilesToAWS(this.filesToUpload, this.newFilesAdded);
        }
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
  public uploadFilesToAWS(filesToUpload, newFilesAdded) {
    this.awsService.uploadFilesAWS(filesToUpload, (data: any) => {
      this.insuranceDocsService.addFiles(newFilesAdded);
      this.showProgressBar = false;
      this.modalController.dismiss(newFilesAdded);
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
      for (let i = 0; i < this.docs.length; i++) {
        const doc = this.docs[i];
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
            if (totalConvertedFiles === that.docs.length) {
              resolve(filesAsArrayBuffer);
            }
          };
          reader.readAsArrayBuffer(that.docs[index]);
          // });
        })(i);
      }
    });
  }
}
