/* eslint-disable max-len */
import { Component, Input, OnInit } from '@angular/core';
import { SocialSharing } from '@ionic-native/social-sharing/ngx';
import { ModalController } from '@ionic/angular';
import * as _ from 'lodash';
import { AppDataService } from 'src/app/services/app-data.service';
import { environment } from 'src/environments/environment';
import { Router } from '@angular/router';
import { DownloadFileService } from 'src/app/services/download-file.service';
@Component({
  selector: 'app-export-insurance-docs-modal',
  templateUrl: './export-insurance-docs-modal.page.html',
  styleUrls: ['./export-insurance-docs-modal.page.scss'],
})
export class ExportInsuranceDocsModalPage implements OnInit {
  @Input()
  public allFiles;
  @Input()
  clientDetails;
  public isWeb = environment.isWeb;
  public files = [];
  public selectedFile = '';
  public message;
  public subject;
  public isFileSelected = false;
  public internetCheckFlag = false;
  constructor(private dataService: AppDataService, private socialSharing: SocialSharing, private modalCtrl: ModalController, private downloadService: DownloadFileService) { }
  public ngOnInit() {
    this.files = this.dataService.getFileNamesFromFiles(this.allFiles, 'insurance-docs');
  }
  public selectFile(event, file) {
    console.log('file: ', file);
    this.message = 'Insurance Document';
    this.subject = file.fileName;
    if (event.target.checked) {
      this.isFileSelected = true;
      this.selectedFile = file.fileName;
    }
    if (!event.target.checked && (this.selectedFile === file.fileName)) {
      this.selectedFile = '';
      this.isFileSelected = false;
    }
  }
  public selectDoc(filename) {
    this.selectedFile = this.selectedFile === filename ? '' : filename;
  }
  public share() {
    this.dataService.present().then((loader) => {
      loader.present();
      if (this.selectedFile && this.selectedFile !== '') {
        // const findFile = _.filter(this.allFiles, (o) => {
        //   if (_.includes(o.fileUploadKey, this.selectedFile)) {
        //     return o;
        //   }
        // });
        const selectedFilename = this.selectedFile.replace(/ /g, '_');
        const findFile = _.find(this.allFiles, (o) => {
          const filename = o.fileUploadKey.split('/')[4];
          if (filename === selectedFilename) {
            return o;
          }
        });
        const shareFile = environment.aws.bucketAccessRootPath + findFile.fileUploadKey;
        if (!this.internetCheckFlag) {
          this.socialSharing.share(this.message, this.subject, shareFile, null)
            // this.socialSharing.shareViaWhatsApp(msg)
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
      } else {
        this.dataService.dismiss();
        this.dataService.presentAlert('Choose a file to share');
      }
    });
  }
  public download() {
    const selectedFilename = this.selectedFile.replace(/ /g, '_');
    const findFile = _.find(this.allFiles, (o) => {
      const filename = o.fileUploadKey.split('/')[4];
      if (filename === selectedFilename) {
        return o;
      }
    });
    console.log('findFile.fileUploadKey: ', findFile.fileUploadKey);
    const shareFile = environment.aws.bucketAccessRootPath + findFile.fileUploadKey;
    if (this.isWeb) {
      const link = document.createElement('a');
      link.href = shareFile;
      link.download = shareFile;
      link.click();
    } else {
      const filePath: string = this.subject;
      let fileDir: string;
      const selectedcase = this.dataService.getSelectedCase();
      if (selectedcase.name) {
        fileDir = 'Premium Care/' + this.clientDetails.name + '/' + selectedcase.name;
      } else {
        fileDir = 'Premium Care/' + this.clientDetails.name;
      }
      const file = {
        fileName: filePath,
        filePath: shareFile,
        fileDir
      };
      this.downloadService.downloadFile(file);
    }
  }
  public closeModal() {
    this.modalCtrl.dismiss();
  }
}
