/* eslint-disable @typescript-eslint/prefer-for-of */
/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable max-len */
import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ImagePicker } from '@ionic-native/image-picker/ngx';
import { SocialSharing } from '@ionic-native/social-sharing/ngx';
import { LoadingController } from '@ionic/angular';
import * as _ from 'lodash';
import { AppDataService } from 'src/app/services/app-data.service';
import { AwsService } from 'src/app/services/aws.service';
import { DownloadFileService } from 'src/app/services/download-file.service';
import { FirebaseService } from 'src/app/services/firebase.service';
import { InsuranceDocsService } from 'src/app/services/insurance-docs.service';
import { environment } from 'src/environments/environment';
declare let zip: any;
import { getExtension } from 'mime';
@Component({
  selector: 'app-client-case-folders',
  templateUrl: './client-case-folders.page.html',
  styleUrls: ['./client-case-folders.page.scss'],
})
export class ClientCaseFoldersPage implements OnInit {
  public isWeb = environment.isWeb;
  public loader;
  public nameToSearch;
  public isFolderOpened = false;
  public folderName = '';
  public fileNames = [];
  public case: any;
  public fileType = '';
  public allFiles = [];
  public currentFileObj: any;
  public fileToUpload = [];
  public uploadPercent = 0;
  public uploadProgress;
  public pdfContent = [];
  public bucketName;
  public internetCheckFlag = false;
  public lastAdmissionFileUploadDate;
  public lastDischargeFileUploadDate;
  public lastInvoiceFileUploadDate;
  public lastMedicalReportFileUploadDate;
  public lastClaimFileUploadDate;
  public lastCharArchiveFileUploadDate;
  public openFileObj: any;
  public lastUpdatedDates: any = {
    admission: '',
    discharge: '',
    invoices: '',
    medicalReport: '',
    claims: '',
    chatArchive: '',
  };
  public reloadAgain = true;
  public isOpenFileCancelled;
  public selectedImages = [];
  clientDetails: any;
  // eslint-disable-next-line @typescript-eslint/member-ordering
  @ViewChild('uploadFile', { static: false }) public inputFile: ElementRef;
  // eslint-disable-next-line @typescript-eslint/member-ordering
  @ViewChild('preview', { static: false }) public preview: ElementRef;
  public zipFileList = [];
  constructor(private socialSharing: SocialSharing, public dataService: AppDataService, private firebaseService: FirebaseService, private awsService: AwsService, private loadingController: LoadingController,
    private imagePicker: ImagePicker,
    private router: Router,
    public insuranceDocsService: InsuranceDocsService,
    public downloadService: DownloadFileService,
    public http: HttpClient
  ) {
    dataService.subscribeLoaderCancel.subscribe((resp) => {
      this.isOpenFileCancelled = resp;
      if (resp) {
        this.currentFileObj = null;
      }
    });
    zip.configure({
      workerScripts: {
        inflate: ['lib/z-worker-pako.js', 'pako_inflate.min.js']
      }
    });
  }
  public ionViewDidLeave() {
    this.isFolderOpened = false;
    this.currentFileObj = '';
    this.fileNames = [];
    this.nameToSearch = '';
  }
  public ionViewDidEnter() {
    this.dataService.present().then((loader) => {
      loader.present();
      const obj = {
        title: 'Case Folder',
        backPage: '/client-case-profile',
      };
      this.dataService.setHeaderTitle(obj);
      this.case = this.dataService.getSelectedCase();
      this.clientDetails = this.dataService.getPatientData();
      console.log('this.clientDetails: ', this.clientDetails);

      this.lastUpdatedDates.admission = this.getDateInFormat(this.case.caseFolders.admission);
      this.lastUpdatedDates.discharge = this.getDateInFormat(this.case.caseFolders.discharge);
      this.lastUpdatedDates.invoices = this.getDateInFormat(this.case.caseFolders.invoices);
      this.lastUpdatedDates.medicalReport = this.getDateInFormat(this.case.caseFolders.medicalReport);
      this.lastUpdatedDates.claims = this.getDateInFormat(this.case.caseFolders.claims);
      this.lastUpdatedDates.chatArchive = this.getDateInFormat(this.case.caseFolders.chatArchive);
      this.openFileObj = this.dataService.getMemoFile();
      if (_.size(this.openFileObj) !== 0) {
        this.dataService.dismiss();
        this.openFolder('admission');
      } else {
        this.openFileObj = {};
      }
      const newlyAddedFile = this.insuranceDocsService.getCurrentlyAddedFile();
      if (newlyAddedFile) {
        _.forEach(newlyAddedFile, (o) => {
          this.allFiles.push(o);
        });
        this.fileNames = [];
        this.fileNames = this.dataService.getFileNamesFromFiles(this.allFiles, 'case-folder');
        this.insuranceDocsService.setCurrentlyAddedFile(null);
      }
      this.dataService.dismiss();
    });
  }
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
        this.router.routeReuseStrategy.shouldReuseRoute = () => false;
        if (this.reloadAgain) {
          this.ionViewDidEnter();
        }
        this.dataService.toastPresent('Internet Connected');
        this.internetCheckFlag = false;
      }
    });
  }
  // eslint-disable-next-line @angular-eslint/use-lifecycle-interface
  public ngOnDestroy() {
    if (this.dataService.mySubscription) {
      this.dataService.mySubscription.unsubscribe();
    }
  }
  public getDateInFormat(date) {
    const splittedDate = date.split(' ');
    const newDate = new Date(date);
    return splittedDate[2] + ' ' + newDate.toDateString().substr(4, 3) + ' ' + splittedDate[3].substr(2);
  }
  public goToAllFolders() {
    this.isFolderOpened = false;
    this.folderName = '';
    this.nameToSearch = '';
    if (this.currentFileObj) {
      this.currentFileObj = undefined;
    }
  }
  public openFolder(folderName) {
    this.dataService.present().then((loader) => {
      loader.present();
      this.dataService.setFolderName(folderName);
      this.allFiles = [];
      this.fileNames = [];
      this.isFolderOpened = true;
      this.reloadAgain = false;
      if (folderName === 'admission') {
        this.folderName = 'Admission Document';
        this.bucketName = environment.aws.bucketAdmissionDocumentsPath;
      } else if (folderName === 'discharge') {
        this.folderName = 'Discharge Document';
        this.bucketName = environment.aws.bucketDischargeDocumentsPath;
      } else if (folderName === 'invoices') {
        this.folderName = 'Invoices';
        this.bucketName = environment.aws.bucketInvoiceDocumentsPath;
      } else if (folderName === 'medical-report') {
        this.folderName = 'Medical Report';
        this.bucketName = environment.aws.bucketMedicalReportsPath;
      } else if (folderName === 'claims') {
        this.folderName = 'Claims';
        this.bucketName = environment.aws.bucketClaimDocumentsPath;
      } else if (folderName === 'chat-archive') {
        this.folderName = 'Chat Archive';
        this.bucketName = environment.aws.bucketChatArchivePath;
      } else if (folderName === 'medical-condition') {
        this.folderName = 'Medical Condition';
        this.bucketName = environment.aws.bucketMedicalConditionImagePath;
      }
      const foldername = environment.aws.bucketRootKey + '/' + this.case.clientId + '/' + this.case.id + '/' + this.bucketName;
      this.dataService.setAwsBucketPath(foldername);
      if (!this.internetCheckFlag) {
        this.awsService.getFiles(foldername).then((resp) => {
          console.log('resp: ', resp);
          const response: any = resp;
          this.reloadAgain = true;
          if (response.length > 0) {
            this.allFiles = response;

            this.fileNames = this.dataService.getFileNamesFromFiles(response, 'case-folder');
            console.log('this.fileNames: ', this.fileNames);
            if (_.size(this.openFileObj) !== 0) {
              this.dataService.dismiss();
              this.openFile(this.openFileObj);
              this.dataService.clearMemoFile();
            }
          }
          this.dataService.dismiss();
        }).catch((err) => {
          this.dataService.dismiss();
        });
      } else {
        this.isFolderOpened = false;
        this.dataService.dismiss();
        this.dataService.presentAlert('Please check your internet connection!');
      }
    });
  }
  public model() {
    return {
      getEntries(file, options) {
        return (new zip.ZipReader(new zip.BlobReader(file))).getEntries(options);
      },
      async getURL(entry, options) {
        return URL.createObjectURL(await entry.getData(new zip.BlobWriter(), options));
      }
    };
  }
  public openFile(file) {
    this.dataService.setLoaderCancel(false);
    const element = document.getElementById('preview');
    if (element) {
      element.scrollTop = 0;
    }
    if (file && file.fileSize === 0) {
      this.dataService.presentAlert('Cannot open ' + file.fileName + ' because it is not compatible!');
    } else {
      this.reloadAgain = false;
      if (!this.internetCheckFlag) {
        if (this.currentFileObj && this.currentFileObj.fileName && this.currentFileObj.fileName === file.actualFilename) {
        } else {
          this.dataService.present().then((loader) => {
            this.loader = loader;
            this.loader.present();
            this.dataService.enableCancelForLoader();
            this.dataService.currentLoader = 'preview-pdf';
            this.currentFileObj = this.dataService.openFile(file, this.allFiles);
            console.log('this.currentFileObj: ', this.currentFileObj);
            if (this.currentFileObj.fileType === 'zip') {
              // ! read contents of zip file
              this.readFile(this.currentFileObj.fileName);
            } else if (this.currentFileObj.fileType === 'others') {
              this.dataService.dismiss();
            }
          });
        }
        this.reloadAgain = true;
      } else {
        this.dataService.dismiss();
        this.dataService.presentAlert('Please check your internet connection!');
      }
    }
  }
  public fileClick() {
    this.inputFile.nativeElement.value = '';
  }
  async refreshList(selectedFile) {
    const entries = await this.model().getEntries(selectedFile, 'cp437');
    this.zipFileList = [];
    entries.forEach((entry, entryIndex) => {
      this.zipFileList.push(entry.filename.replace(/_/g, ' '));
    });
    if (this.loader) {
      this.dataService.dismiss();
    }
  }
  async readFile(filepath) {
    const blob = await fetch(filepath).then(r => r.blob());

    this.refreshList(blob);
  }
  public uploadFiles(event: any) {
    if (event.target.files.length > 0) {
      this.dataService.present().then((loader) => {
        loader.present();
        this.dataService.enableCancelForLoader();
        this.dataService.currentLoader = 'file';
        let date;
        date = new Date().toString();
        const fileObjectToUpload = {
          body: '',
          name: '',
          size: 0,
          key: '',
          arrayBuffer: null,
        };
        fileObjectToUpload.body = event.target.files[0];
        // const selectedFilename = event.target.files[0].name.split('.')[0];
        // ? changed logic for files with names file.name.something.pdf on 30 Mar,2022
        const splitArr = event.target.files[0].name.split('.');
        splitArr.splice(-1);
        const selectedFilename = splitArr.join('.');
        const splittedName = selectedFilename.replace(/[!&\/\\#., +=^()$~%'":*?<>{}]/g, '_');
        let splittedFileName;
        const fileCountArr = [];
        const alreadyPresentName = _.filter(this.fileNames, (o) => {
          splittedFileName = o.fileName.split('.')[0];
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
              const count = filenumber[filenumber.length - 1].split('.')[0];
              fileCountArr.push(parseInt(count));
              return o;
            }
          }
        });
        // const extension = event.target.files[0].name.split('.')[1];
        const extension = event.target.files[0].name.split('.')[event.target.files[0].name.split('.').length - 1];
        if (alreadyPresentName && alreadyPresentName.length > 0) {
          const maxCount = _.max(fileCountArr);
          if (maxCount !== undefined) {
            fileObjectToUpload.name = splittedName +
              '-' + (maxCount + 1) + '.'
              + extension;
          } else {
            fileObjectToUpload.name = splittedName + '.' + extension;
          }
        } else {
          fileObjectToUpload.name = splittedName + '.' + extension;
        }
        fileObjectToUpload.name = fileObjectToUpload.name.replace(/ /g, '_');
        fileObjectToUpload.size = event.target.files[0].size;
        fileObjectToUpload.key = environment.aws.bucketRootKey + '/'
          + this.case.clientId + '/'
          + this.case.id + '/'
          + this.bucketName + '/'
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
      spinner: 'bubbles',
      keyboardClose: true,
      cssClass: 'progress-bar-loader',
      message: '<span class="upload - percent">Uploading... ' + this.uploadPercent + ' %</span>',
    }).then((loader) => {
      loader.present();
      this.dataService.enableCancelForLoader();
      this.dataService.currentLoader = 'aws';
      this.awsService.uploadFilesAWS(this.fileToUpload, (data: any) => {
        this.allFiles.unshift(newFileObj);
        this.fileNames = [];
        this.fileNames = this.dataService.getFileNamesFromFiles(this.allFiles, 'case-folder');
        const date = new Date().toString();
        if (this.folderName === 'Admission Documents') {
          this.case.caseFolders.admission = date;
          this.lastUpdatedDates.admission = this.getDateInFormat(this.case.caseFolders.admission);
        } else if (this.folderName === 'Discharge Documents') {
          this.case.caseFolders.discharge = date;
          this.lastUpdatedDates.discharge = this.getDateInFormat(this.case.caseFolders.discharge);
        } else if (this.folderName === 'Invoices') {
          this.case.caseFolders.invoices = date;
          this.lastUpdatedDates.invoices = this.getDateInFormat(this.case.caseFolders.invoices);
        } else if (this.folderName === 'Medical Report') {
          this.case.caseFolders.medicalReport = date;
          this.lastUpdatedDates.medicalReport = this.getDateInFormat(this.case.caseFolders.medicalReport);
        } else if (this.folderName === 'Claims') {
          this.case.caseFolders.claims = date;
          this.lastUpdatedDates.claims = this.getDateInFormat(this.case.caseFolders.claims);
        } else if (this.folderName === 'Chat Archive') {
          this.case.caseFolders.chatArchive = date;
          this.lastUpdatedDates.chatArchive = this.getDateInFormat(this.case.caseFolders.chatArchive);
        }
        if (this.folderName === 'Medical Condition') {
          let medicalCondition: any = this.dataService.getMedicalCondition();
          if (_.size(medicalCondition) === 0) {
            this.firebaseService.getMedicalId(this.case.id).subscribe((resp: any) => {
              medicalCondition = resp.docs[0].data();
              medicalCondition.id = resp.docs[0].id;
              medicalCondition.orthopaedic.uploadedImages.push({ fileUploadDate: newFileObj.fileUploadDate, fileUploadKey: newFileObj.fileUploadKey });
              this.dataService.setMedicalCondition(medicalCondition);
              this.firebaseService.editMedical(medicalCondition).then(() => {
                this.dataService.dismiss();
              }).catch((err) => {
                this.dataService.dismiss();
              });
            }, (err) => {
              this.dataService.dismiss();
            });
          } else {
            medicalCondition.orthopaedic.uploadedImages.push({ fileUploadDate: newFileObj.fileUploadDate, fileUploadKey: newFileObj.fileUploadKey });
            this.dataService.setMedicalCondition(medicalCondition);
            this.firebaseService.editMedical(medicalCondition).then(() => {
              this.dataService.dismiss();
            }).catch((err) => {
              this.dataService.dismiss();
            });
          }
        } else {
          this.case.lastUpdateDate = date;
          this.firebaseService.editCase(this.case).then(() => {
            this.dataService.setSelectedCase(this.case);
            this.dataService.dismiss();
          }).catch((err) => {
            this.dataService.dismiss();
          });
        }
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
    return parseInt((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }
  public openCamera() {
    let oldObj = this.dataService.getDefectPhotosObj();
    if (oldObj) {
      oldObj.mode = 'capture';
    } else {
      oldObj = {
        mode: 'capture',
      };
    }
    this.dataService.setDefectPhotosObj(oldObj);
    this.insuranceDocsService.setExistingFiles(this.fileNames);
    this.router.navigateByUrl('client-case-folders/camera');
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
  public openGallery() {
    this.insuranceDocsService.setExistingFiles(this.fileNames);
    this.openPhoneGallery();
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
            if (!_.isArray(results)) {
              if (results === 'OK') {
                this.openPhoneGallery();
              } else {
              }
            } else {
              if (results.length === 0) {
              } else {
                this.dataService.present().then((loader) => {
                  loader.present();
                  const imageCount = 1;
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
                      fileName: 'image' + '_' + Math.random().toString(36).substr(2, 5),
                    };
                    this.selectedImages.push(capturedImageObj);
                  }
                  this.insuranceDocsService.setSelectedImages(this.selectedImages);
                  this.dataService.dismiss();
                  this.router.navigateByUrl('client-case-folders/gallery');
                });
              }
            }
          },
          (err) => {
          },
        );
      })
      .catch(() => {
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
    } else {
      this.dataService.dismiss();
    }
  }
  public afterLoadComplete(event) {
    console.log('event: ', event);
    this.dataService.dismiss();
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
  getFileExtension(filePath) {
    return new Promise((resolve, reject) => {
      let ext = '.pdf';
      const binary = '';
      //   fetch(filePath)
      //     .then((res) => res.arrayBuffer())
      //     .then((buffer) => {
      //       console.log('buffer: ', buffer);
      //       let uint8Arr = new Uint8Array(buffer);

      // //       // var len = uint8Arr.byteLength;
      // //       // for (var i = 0; i < len; i++) {
      // //       //   binary += String.fromCharCode(uint8Arr[i]);
      // //       // }
      // //       // console.log(btoa(binary));
      //       let b64 = Buffer.from(uint8Arr).toString('base64');
      //       console.log('b64: ', b64);
      //     });
      this.http.get(filePath, { responseType: 'blob' }).subscribe(blob => {
        const reader = new FileReader();
        const binaryString = reader.readAsDataURL(blob);
        reader.onload = (event: any) => {
          //Here you can do whatever you want with the base64 String
          // console.log('mime type ', event.target.result);
          // const extension = getExtension('image/png');
          // console.log('extension: ', extension);
          console.log('mime type: ', event.target.result.split(';base64')[0].split(':')[1]);
          if (getExtension(event.target.result.split(';base64')[0].split(':')[1]) === 'bin') {
            ext = '.pdf';
          } else {
            ext = getExtension(event.target.result.split(';base64')[0].split(':')[1]);
          }
          console.log('ext: ', ext);
          resolve({ext, file: event.target.result});
          // else if (event.target.result.split(';base64')[0].includes('image/')) {
          //   ext = '.' + event.target.result.split(';base64')[0].split('image/')[1];
          // }
          // if (event.target.result.split(';base64')[0].includes('application/')) {
          //   ext = '.pdf';
          // }
        };

        reader.onerror = (event: any) => {
          console.log('File could not be read: ' + event.target.error.code);
          reject(event.target.error);
        };
      });
      // let result = null;
      // let uint8Arr;
      // // const xmlhttp = new XMLHttpRequest();
      // // xmlhttp.open('GET', filePath, false);
      // // xmlhttp.send();
      // // if (xmlhttp.status === 200) {
      // //   result = xmlhttp.responseText;
      // // }
      // fetch(filePath)
      // .then((resp) => {
      //   console.log('resp: ', resp.arrayBuffer());
      // })
      // .then((buffer: any) => {
      //   uint8Arr = new Uint8Array(buffer);
      //   const reader = new FileReader();
      //   reader.readAsArrayBuffer(uint8Arr);
      //   reader.onload = (e) => console.log(e.target.result);
      //   reader.onerror = error => console.log(error);
      //   debugger
      // });
      // return result;
    });
  }
  public async downloadFile() {
    if (environment.isWeb) {
      const link = document.createElement('a');
      // const resp: any = await this.getFileExtension(this.currentFileObj.fileName);
      // link.href = resp.file;
      // console.log('ext: ', resp.ext);
      // link.download = this.currentFileObj.showFileName  + resp.ext;
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
}
