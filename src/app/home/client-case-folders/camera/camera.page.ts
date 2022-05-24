import { Location } from '@angular/common';
import { ChangeDetectorRef, Component, ElementRef, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Base64ToGallery, Base64ToGalleryOptions } from '@ionic-native/base64-to-gallery/ngx';
import {
  CameraPreview,
  CameraPreviewDimensions,
  CameraPreviewOptions,
  CameraPreviewPictureOptions,
} from '@ionic-native/camera-preview/ngx';
import { ImagePicker } from '@ionic-native/image-picker/ngx';
import { ScreenOrientation } from '@ionic-native/screen-orientation/ngx';
import { AlertController, ModalController, NavController, Platform } from '@ionic/angular';
import * as pdfmake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import { Observable, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';
import { AppDataService } from 'src/app/services/app-data.service';
import { AwsService } from 'src/app/services/aws.service';
import { FirebaseService } from 'src/app/services/firebase.service';
import { InsuranceDocsService } from 'src/app/services/insurance-docs.service';
import { environment } from 'src/environments/environment';
import { PdfFilenameModalPage } from '../pdf-filename-modal/pdf-filename-modal.page';
declare var cordova: any;
declare var $: any;
import * as _ from 'lodash';
@Component({
  selector: 'app-camera',
  templateUrl: './camera.page.html',
  styleUrls: ['./camera.page.scss'],
})
export class CameraPage implements OnInit {
  public selectedIcon = null;
  public selectedImages = [];
  public mode = 'capture';
  public backButtonSubscription;
  public currentImage = null;
  public currentImageIndex = 0;
  public imageNameUpdate = new Subject<string>();
  public existingFiles = [];
  public isNameExists = false;
  public isBlank = false;
  public showProgressBar = false;
  public uploadProgress = 0;
  public uploadPercent = 0;
  public case: any;
  public bucketName;
  public folderName;
  public showFooter = true;
  public ehealth: any;
  constructor(
    private platform: Platform,
    private cameraPreview: CameraPreview,
    private componentDom: ElementRef,
    private router: Router,
    private dataService: AppDataService,
    private alertController: AlertController,
    private base64ToGallery: Base64ToGallery,
    private imagePicker: ImagePicker,
    private location: Location,
    private screenOrientation: ScreenOrientation,
    private awsService: AwsService,
    private insuranceDocsService: InsuranceDocsService,
    private navCtrl: NavController,
    private modalController: ModalController,
    private firebaseService: FirebaseService,
  ) { }
  public ngOnInit() { }
  public ionViewDidEnter() {
    this.case = this.dataService.getSelectedCase();
    this.ehealth = this.dataService.getEhealthData();
    this.bucketName = this.dataService.getAwsBucketPath();
    this.folderName = this.dataService.getFolderName();
    this.platform.ready().then(() => {
      this.handleCameraBackButton();
    });
    this.existingFiles = this.insuranceDocsService.getExistingFiles();
    if (this.screenOrientation.type.includes('portrait')) {
      this.screenOrientation.lock(this.screenOrientation.ORIENTATIONS.PORTRAIT);
    } else {
      this.screenOrientation.lock(this.screenOrientation.ORIENTATIONS.LANDSCAPE);
    }
    const obj = this.dataService.getDefectPhotosObj();
    this.selectedImages = [];
    this.platform.ready().then(() => {
      this.checkMode();
    });
    if (obj) {
      if (obj.selectedImages) {
        this.selectedImages = obj.selectedImages;
      }
    }
  }
  public validateFileNames() {
    for (let i = 0; i < this.selectedImages.length; ++i) {
      for (let j = 0; j < this.existingFiles.length; ++j) {
        const fileExtension = this.existingFiles[j].fileName.split(/[. ]+/).pop();
        const filename = this.existingFiles[j].fileName.split('.' + fileExtension);
        if (this.selectedImages[i].fileName.toLowerCase() === filename[0].toLowerCase()) {
          this.currentImage = this.selectedImages[i];
          this.currentImageIndex = i;
          this.isNameExists = true;
          this.presentAlert('Invalid Action', 'Filename already exists');
          return false;
        }
      }
      if (this.selectedImages[i].fileName === '') {
        this.currentImage = this.selectedImages[i];
        this.currentImageIndex = i;
        this.isBlank = true;
        this.presentAlert('Invalid Action', 'filename cannot be empty');
        return false;
      }
    }
    this.isBlank = false;
    this.isNameExists = false;
    return true;
  }
  public next() {
    // ? if camera is opened for discharge-docs-checklist; do not show filename modal
    // ? set filename to YYYYMMDD facilities foldername clientInitials.pdf
    if (this.bucketName.split('/')[3] === 'discharge') {
      const patient = this.dataService.getPatientData();
      const patientInitials = this.dataService.getClientNameInitials(patient.name);
      let date;
      date = new Date();
      const year = date.getFullYear();
      let month = date.getMonth();
      month = month + 1;
      if (month < 10) {
        month = '0' + month;
      }
      let day = date.getDate();
      if (day < 10) {
        day = '0' + day;
      }
      const M = date.toDateString().substr(4, 3);
      const _foldername = this.folderName.replace(/ /g, '_');
      const admission = this.dataService.getAdmissionData();
      const filename = year + month + day + '_'
        + admission.case.facilities.replace(/[!&\/\\#., +=^()$~%'":*?<>{}]/g, '_') + '_'
        + _foldername + '_'
        + patientInitials;
      const pdfContent = this.generatePdfContent();
      this.makePdf(filename, pdfContent);
    } else {
      this.openFileModal();
    }
  }
  public async openFileModal() {
    this.showFooter = false;
    const modal = await this.modalController.create({
      component: PdfFilenameModalPage,
      backdropDismiss: false,
      cssClass: 'pdf-filename-scss',
      componentProps: {
        existingFiles: this.existingFiles,
      },
    });
    modal.onDidDismiss().then((resp: any) => {
      this.showFooter = true;
      if (resp.role === 'success') {
        const pdfFilename = resp.data;
        const pdfContent = this.generatePdfContent();
        this.makePdf(pdfFilename, pdfContent);
      }
    });
    return await modal.present();
  }
  public generatePdfContent() {
    let imageCount = 1;
    const pdfContent = [];
    this.selectedImages.forEach((image) => {
      if (imageCount === 1) {
        pdfContent.push(
          {
            image: image.newURL,
            width: 515,
            alignment: 'center',
          },
        );
      }
      if (imageCount > 1) {
        pdfContent.push(
          {
            image: image.newURL,
            width: 515,
            alignment: 'center',
            pageBreak: 'before',
          },
        );
      }
      imageCount += 1;
    });
    return pdfContent;
  }
  public makePdf(pdfFilename: any, pdfContent: any) {
    const awsFiles = [];
    const fireBaseFiles = [];
    pdfmake.vfs = pdfFonts.pdfMake.vfs;
    const docDefinition = {
      content: pdfContent,
      pageSize: 'A4',
      pageOrientation: 'portrait',
    };
    pdfmake.createPdf(docDefinition).getBuffer((buffer) => {
      const utf8 = new Uint8Array(buffer);
      const binaryArray = utf8.buffer;
      const pdfName = pdfFilename + '.pdf';
      const key = this.bucketName + '/' + pdfName;
      const fileObj = {
        arrayBuffer: binaryArray,
        key,
        name: pdfName,
        size: binaryArray.byteLength,
      };
      const object = {
        fileUploadKey: key,
        fileUploadDate: new Date(),
        fileSize: this.formatBytes(binaryArray.byteLength),
      };
      fireBaseFiles.push(object);
      awsFiles.push(fileObj);
      this.showProgressBar = true;
      const oldObj = this.dataService.getDefectPhotosObj();
      oldObj.mode = 'edit';
      oldObj.allImages = oldObj.allImages ? oldObj.allImages.concat(this.selectedImages) : this.selectedImages;
      this.dataService.setDefectPhotosObj(oldObj);
      this.uploadFilesToAWS(awsFiles, fireBaseFiles);
    });
  }
  public changeMode(currentMode) {
    this.selectedIcon = currentMode;
    if (this.selectedImages == null || this.selectedImages === undefined) {
      this.selectedImages = [];
    }
    if (this.mode === 'capture' && currentMode === 'edit') {
      if (this.selectedImages.length > 0) {
        this.mode = 'edit';
        this.currentImage = this.selectedImages[0];
        this.stopCamera();
      }
      if (this.selectedImages.length === 0) {
        this.presentAlert('Invalid Action', 'Please capture atleast 1 image to view in edit mode');
      }
    }
  }
  public checkMode() {
    const defectPhotosObj = this.dataService.getDefectPhotosObj();
    if (defectPhotosObj) {
      this.selectedImages = defectPhotosObj.selectedImages;
      this.mode = defectPhotosObj.mode;
      if (this.mode === 'capture') {
        this.openCameraPreview();
      } else if (this.mode === 'edit') {
        this.stopCamera();
        this.setStageForSelectedImage();
        this.currentImage = this.selectedImages[0];
      }
    } else {
      this.presentAlert('Error', 'could not load selected photos , please capture photo again !');
    }
    if (this.mode === 'edit') {
      if (this.selectedImages.length === 0) {
      }
    }
  }
  public openCameraPreview() {
    const locations = this.getCameraViewportLocation();
    const cameraPreviewOpts: CameraPreviewOptions = {
      x: locations.x,
      y: locations.y,
      width: locations.width,
      height: locations.height,
      camera: 'rear',
      tapPhoto: false,
      previewDrag: false,
      toBack: false,
      alpha: 1,
    };
    this.cameraPreview
      .startCamera(cameraPreviewOpts)
      .then(
        (res) => {
          this.cameraPreview.show();
        },
        (err) => { },
      )
      .catch((err) => { });
  }
  /**
   * calculates the exact area of camera preview window
   */
  public getCameraViewportLocation() {
    const header = this.componentDom.nativeElement.querySelector('.header').clientHeight;
    const elem = this.componentDom.nativeElement.querySelector('.camera-preview-area');
    const x = 0;
    const y = elem.offsetTop + header;
    const width = this.componentDom.nativeElement.querySelector('.page').clientWidth;
    const footerElementHeight = this.componentDom.nativeElement.querySelector('.footer-wrapper').clientHeight;
    const primaryFooter = this.componentDom.nativeElement.querySelector('.primary-footer');
    const footerSeperatorElem = this.componentDom.nativeElement.querySelector('.footer-seperator');
    let footerSeperatorMarginTop = 0;
    let footerSeperatorMarginBottom = 0;
    let footerOuterHeight = 0;
    if (footerSeperatorElem) {
      footerOuterHeight = $(footerSeperatorElem).outerHeight();
      footerSeperatorMarginTop = parseInt(
        $(footerSeperatorElem)
          .css('marginTop')
          .replace('px', ''),
        10,
      );
      footerSeperatorMarginBottom = parseInt(
        $(footerSeperatorElem)
          .css('marginBottom')
          .replace('px', ''),
        10,
      );
    }
    let primaryFooterHeight = 0;
    if (primaryFooter) {
      primaryFooterHeight = primaryFooter.clientHeight;
    }
    const totalViewHeight = this.componentDom.nativeElement.querySelector('.page').clientHeight;
    const height = totalViewHeight - y - footerElementHeight + primaryFooterHeight + footerSeperatorMarginTop + footerOuterHeight;
    return {
      width,
      height,
      x,
      y,
    };
  }
  public captureImage() {
    if (this.mode === 'capture') {
      const pictureOpts: CameraPreviewPictureOptions = {
        width: 1280,
        height: 1280,
        quality: 85,
      };
      this.cameraPreview
        .takePicture(pictureOpts)
        .then(
          (imageData) => {
            const picture = 'data:image/jpeg;base64,' + imageData;
            const byteCharacters = atob(imageData);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
              byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const byteArrayBuffer = byteArray.buffer;
            this.base64ToGallery.base64ToGallery(imageData, { prefix: '_img', mediaScanner: true }).then(
              (res) => { },
              (err) => { },
            );
            const capturedImageObj = {
              newURL: picture,
              captured: true,
              arrayBuffer: byteArrayBuffer,
              fileName: 'image' + '_' + Math.random().toString(36).substr(2, 5),
            };
            if (this.selectedImages === null || this.selectedImages === undefined) {
              this.selectedImages = [];
            }
            this.selectedImages.push(capturedImageObj);
            this.mode = 'edit';
            this.setStageForSelectedImage();
            this.currentImage = this.selectedImages[this.selectedImages.length - 1];
            this.currentImageIndex = this.selectedImages.length - 1;
            this.stopCamera();
          },
          (err) => { },
        )
        .catch((err) => { });
    } else if (this.mode === 'edit') {
      this.mode = 'capture';
      this.openCameraPreview();
    }
  }
  public removeSelectedImage(image, index) {
    this.selectedImages.splice(index, 1);
    let obj = this.dataService.getDefectPhotosObj();
    if (obj) {
      obj.selectedImages = this.selectedImages;
    } else {
      obj = {
        selectedImages: this.selectedImages,
      };
    }
    if (this.selectedImages.length === 0) {
      this.currentImage.newURL = '';
      this.mode = 'capture';
      obj.mode = 'capture';
      this.openCameraPreview();
    } else {
      this.currentImage = this.selectedImages[0];
      this.currentImageIndex = 0;
      this.setStageForSelectedImage();
    }
    this.dataService.setDefectPhotosObj(obj);
  }
  public switchCamera() {
    try {
      this.cameraPreview.switchCamera();
    } catch (exception) { }
  }
  public stopCamera() {
    this.cameraPreview.stopCamera();
  }
  public async presentAlert(header, message) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK'],
    });
    await alert.present();
  }
  public showSelectedImage(image, index) {
    this.currentImage = image;
    this.currentImageIndex = index;
  }
  public setStageForSelectedImage() {
    const cameraPreviewArea = this.componentDom.nativeElement.querySelector('.camera-preview-area');
    const area = this.getCameraViewportLocation();
    cameraPreviewArea.style.width = area.width + 'px';
    cameraPreviewArea.style.height = area.height + 'px';
  }
  public uploadImages() {
    this.showProgressBar = true;
    const oldObj = this.dataService.getDefectPhotosObj();
    oldObj.mode = 'edit';
    oldObj.selectedImages = this.selectedImages;
    oldObj.allImages = oldObj.allImages ? oldObj.allImages.concat(this.selectedImages) : this.selectedImages;
    this.dataService.setDefectPhotosObj(oldObj);
    if (this.validateFileNames()) {
      const imagesToUpload: any = [];
      const newFilesAdded: any = [];
      for (let i = 0; i < this.selectedImages.length; ++i) {
        const key = environment.aws.bucketAdmissionDocumentsPath + '/' + this.selectedImages[i].fileName + '.jpeg';
        const fileObj = {
          arrayBuffer: this.selectedImages[i].arrayBuffer,
          key,
          name: this.selectedImages[i].fileName + '.jpeg',
          size: this.selectedImages[i].arrayBuffer.byteLength,
        };
        imagesToUpload.push(fileObj);
        const object = {
          fileName: this.selectedImages[i].fileName + '.jpeg',
          fileType: 'image/jpeg',
          filePath: environment.aws.bucketAccessRootPath + key,
          uploadDate: new Date(),
          fileSize: this.formatBytes(this.selectedImages[i].arrayBuffer.byteLength),
        };
        newFilesAdded.push(object);
        if (i === (this.selectedImages.length - 1)) {
          this.showProgressBar = true;
          this.uploadFilesToAWS(imagesToUpload, newFilesAdded);
        }
      }
    } else {
      return;
    }
  }
  public formatBytes(bytes, decimals = 0) {
    if (bytes === 0) {
      return '0 Bytes';
    }
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseInt((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }
  public uploadFilesToAWS(awsFiles: any, fireBaseFiles: any) {
    this.dataService.present().then((loader) => {
      loader.message = '<span class="upload-percent">Uploading...' + this.uploadPercent + ' %</span>';
      loader.present();
      this.awsService.uploadFilesAWS(awsFiles, (data: any) => {
        if (this.bucketName.split('/')[3] !== 'insurance') {
        const date = new Date().toString();
        if (this.folderName === 'admission') {
          this.case.caseFolders.admission = date;
        } else if (this.folderName === 'discharge') {
          this.case.caseFolders.discharge = date;
        } else if (this.folderName === 'invoices') {
          this.case.caseFolders.invoices = date;
        } else if (this.folderName === 'medical-report') {
          this.case.caseFolders.medicalReport = date;
        } else if (this.folderName === 'claims') {
          this.case.caseFolders.claims = date;
        } else if (this.folderName === 'chat-archive') {
          this.case.caseFolders.chatArchive = date;
        } else {
          // ? this means that image is uploaded for discharge-docs-checklist
          this.case.caseFolders.discharge = date;
          if (this.folderName === 'Discharge Summary') {
            this.case.dischargeDocsChecklistCheckbox.dischargeSummary = true;
          } else if (this.folderName === 'Interim Bill') {
            this.case.dischargeDocsChecklistCheckbox.interimBill = true;
          } else if (this.folderName === 'Hospitalisation Leave') {
            this.case.dischargeDocsChecklistCheckbox.hospitalisationLeave = true;
          } else if (this.folderName === 'Medical Report') {
            this.case.dischargeDocsChecklistCheckbox.medicalReport = true;
          }
        }
        this.case.lastUpdateDate = date;
        this.firebaseService.editCase(this.case).then(() => {
          this.dataService.setSelectedCase(this.case);
          this.insuranceDocsService.setCurrentlyAddedFile(fireBaseFiles);
          this.dataService.dismiss();
          this.navCtrl.pop();
        }).catch((err) => {
          this.dataService.dismiss();
          this.dataService.presentAlert('Something went wrong. Try again!').then(() => {
            this.navCtrl.pop();
          });
        });
      } else {
        _.forEach(fireBaseFiles, (file) => {
          file.fileUploadDate = file.fileUploadDate.toString();
          this.ehealth.insuranceDocs.push(file);
        });
        this.firebaseService.editEhealth(this.ehealth).then((resp) => {
          this.dataService.setEhealthData(this.ehealth);
          this.insuranceDocsService.setCurrentlyAddedFile(fireBaseFiles);
          this.dataService.dismiss();
          const clientId = this.dataService.getPatientData().id;
          this.dataService.presentAlertThenRoute('File uploaded successfully!', '/e-health-booklet/insurance-docs/' + clientId);
        }).catch((err) => {
          this.dataService.dismiss();
          this.dataService.presentAlert('Something went wrong. Try again!').then(() => {
            this.navCtrl.pop();
          });
        });
      }
      }, (err) => {
      }, (progress) => {
        this.uploadPercent = Math.ceil(progress.uploadedPercent);
        this.uploadProgress = this.uploadPercent / 100;
        loader.message = '<span class="upload-percent">Uploading...' + this.uploadPercent + ' %</span>';
      });
    });
  }
  public openPhoneGallery() {
    this.imagePicker
      .requestReadPermission()
      .then(() => {
        const options = {
          maximumImagesCount: 10,
          outputType: 1,
        };
        this.imagePicker.getPictures(options).then(
          (results) => {
            if (results.length === 0) {
            } else {
              for (let i = 0; i < results.length; i++) {
                const picture = 'data:image/jpeg;base64,' + results[i];
                const byteCharacters = atob(results[i]);
                const byteNumbers = new Array(byteCharacters.length);
                for (let i = 0; i < byteCharacters.length; i++) {
                  byteNumbers[i] = byteCharacters.charCodeAt(i);
                }
                const byteArray = new Uint8Array(byteNumbers);
                const byteArrayBuffer = byteArray.buffer;
                const capturedImageObj = {
                  newURL: picture,
                  selected: true,
                  arrayBuffer: byteArrayBuffer,
                };
                if (this.selectedImages == null || this.selectedImages === undefined) {
                  this.selectedImages = [];
                }
                this.selectedImages.push(capturedImageObj);
              }
              this.mode = 'edit';
              this.setStageForSelectedImage();
              this.currentImage = this.selectedImages[this.selectedImages.length - 1];
              this.stopCamera();
            }
          },
          (err) => {
            alert(err);
          },
        );
      })
      .catch(() => {
      });
  }
  public closeAndback() {
    this.selectedImages = [];
    const oldObj = this.dataService.getDefectPhotosObj();
    oldObj.mode = 'edit';
    oldObj.selectedImages = this.selectedImages;
    oldObj.allImages = [];
    this.dataService.setDefectPhotosObj(oldObj);
    this.stopCamera();
    this.location.back();
  }
  public ionViewWillLeave() {
    this.stopCamera();
    this.selectedImages = [];
    this.screenOrientation.unlock();
  }
  public handleCameraBackButton() {
    this.cameraPreview
      .onBackButton()
      .then(() => {
        this.closeAndback();
      })
      .catch((err) => { });
  }
  public handleGalleryPermission() {
    return new Promise<void>((resolve, reject) => {
      this.imagePicker
        .hasReadPermission()
        .then((hasReadPermission) => {
          if (!hasReadPermission) {
            this.imagePicker
              .requestReadPermission()
              .then(() => {
                resolve();
              })
              .catch(() => {
                reject();
              });
          } else {
            resolve();
          }
        })
        .catch((err) => {
          reject();
          throw err;
        });
    });
  }
  public handleCameraPermission() {
  }
  public ionViewDidLeave() {
    this.selectedImages = [];
  }
}
