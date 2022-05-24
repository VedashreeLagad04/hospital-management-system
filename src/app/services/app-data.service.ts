/* eslint-disable max-len */
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import {
  AlertController,
  LoadingController,
  MenuController,
  ModalController,
} from '@ionic/angular';
import { Storage } from '@ionic/storage';
import { Subject } from 'rxjs';
import { FirebaseService } from './firebase.service';
declare let gapi: any;
import { ToastController } from '@ionic/angular';
import * as CryptoJS from 'crypto-js';
import html2pdf from 'html2pdf.js';
import * as jsPDF from 'jspdf';
import * as _ from 'lodash';
import { fromEvent, merge, Observable, Observer } from 'rxjs';
import { map } from 'rxjs/operators';
import { AwsService } from 'src/app/services/aws.service';
import { environment } from 'src/environments/environment';
import { SignatureModalPage } from '../home/signature-modal/signature-modal.page';
declare let base64: any;
// declare const Buffer: any;
@Injectable({
  providedIn: 'root',
})
export class AppDataService {
  fileTransfer: any;
  medicalCondition = {};
  public mySubscription: any;
  public currentMemoObj = {};
  public isCaseApprovalSidebarOpen = false;
  public showCancelLoader = false;
  public currentLoader = 'data';
  public currentFile: any;
  public isCancelled = false;
  public callEnableCancelLoader = true;
  public allSurgicalCodes = [];
  public isLatestCase = false;
  public isFirstCase = false;
  public addOfflineClient = 'new';
  public defectPhotosObj: any;
  public currentDefectObj: any;
  public isLoading = false;
  public userData = '';
  public lastPage = '';
  public selectedCase: any = {};
  public sortOption: any;
  // ? subscriber used to get value/header-title from each page
  public subscribeHeaderTitle: Subject<any> = new Subject<any>();
  public subscribeCheckboxValue: Subject<any> = new Subject<any>();
  public subscribeLoaderCancel: Subject<any> = new Subject<any>();
  public showLoaderCancel: Subject<any> = new Subject<any>();
  public showCancelBtn: Subject<any> = new Subject<any>();
  public subscribeUserGender: Subject<any> = new Subject<any>();
  public CLIENT_ID: string;
  public API_KEY: string;
  public DISCOVERY_DOCS: string[];
  public SCOPES: string;
  public googleEvent: any;
  public activePart: any;
  public newCase: {};
  public admissionData: any;
  public isAdmissionIdPresent = false;
  private encryptSecretKey = 'premiumcare';
  constructor(
    public loadingController: LoadingController,
    public alertController: AlertController,
    private router: Router,
    private storage: Storage,
    private firebase: FirebaseService,
    private awsService: AwsService,
    private modalCtrl: ModalController,
    private toastController: ToastController,
    private menuCtrl: MenuController
  ) {
    // localhost
    // this.CLIENT_ID = '852237406325-pfcmkr479buipj2u3s0v9ku3jp30hbb0.apps.googleusercontent.com';
    // // server
    // this.CLIENT_ID = '852237406325-7cah1adlo72qthlvpbleuk2hq1e1gepv.apps.googleusercontent.com';
    // ipad app
    this.CLIENT_ID =
      '852237406325-9bh56h2liq2j56narkn736hfvg1b9muk.apps.googleusercontent.com';
    this.API_KEY = 'AIzaSyAIAd3TvfB548kV4PotycSyKGgIkuC2l-A';
    // Array of API discovery doc URLs for APIs used by the quickstart
    this.DISCOVERY_DOCS = [
      'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest',
    ];
    // Authorization scopes required by the API; multiple scopes can be
    // included, separated by spaces.
    this.SCOPES = 'https://www.googleapis.com/auth/calendar';
    // ? subscribe to show 'cancel' button in loader
    // ? in insurance docs, when deleting a file, we have to hide 'cancel' button
    this.showLoaderCancel.subscribe((resp) => {
      if (resp === false) {
        this.callEnableCancelLoader = resp;
      } else {
        this.callEnableCancelLoader = true;
      }
    });
  }
  // tslint:disable-next-line: use-lifecycle-interface
  // tslint:disable-next-line: contextual-lifecycle
  public ngOnInit() { }
  public toDataUrl(url, callback) {
    const xhr = new XMLHttpRequest();
    xhr.onload = function () {
      const reader = new FileReader();
      reader.onloadend = function () {
        callback(reader.result);
      };
      reader.readAsDataURL(xhr.response);
    };
    xhr.open('GET', url);
    xhr.responseType = 'blob';
    xhr.send();
  }
  // start loading function
  public async present() {
    this.isLoading = true;
    if (this.callEnableCancelLoader) {
      this.enableCancelForLoader();
    }
    return await this.loadingController.create({
      spinner: 'bubbles',
    });
  }
  public async presentOnlyLoader() {
    this.isLoading = true;
    return await this.loadingController.create({
      spinner: 'bubbles',
    });
  }
  public dismiss() {
    // if (this.isLoading) {
    this.isLoading = false;
    this.showCancelLoader = false;
    this.setCancelBtn(this.showCancelLoader);
    return this.loadingController.dismiss();
    // }
    // else {
    //   this.dismissAllLoaders();
    //   return;
    // }
    // return false;
  }
  public async dismissAllLoaders() {
    let topLoader = await this.loadingController.getTop();
    while (topLoader) {
      if (!(await this.loadingController.dismiss())) {
        throw new Error('Could not dismiss the topmost modal. Aborting...');
        //
        this.loadingController.dismiss();
      }
      topLoader = await this.loadingController.getTop();
    }
    return;
  }
  public enableCancelForLoader() {
    setTimeout(() => {
      if (this.isLoading) {
        this.showCancelLoader = true;
        this.setCancelBtn(this.showCancelLoader);
      }
    }, 5000);
  }
  // function to alert confirmation for a process
  public async presentAlertConfirm(heading: any, text) {
    return new Promise(async (resolve) => {
      const alert = await this.alertController.create({
        header: heading,
        message: text,
        cssClass: 'alertDiv',
        buttons: [
          {
            text: 'Cancel',
            role: 'cancel',
            cssClass: 'secondary',
            handler: (cancel) => {
              resolve('cancel');
            },
          },
          {
            text: 'Confirm',
            handler: (ok) => {
              resolve('ok');
            },
          },
        ],
      });
      await alert.present();
    });
  }
  public setUserGender(gender) {
    this.subscribeUserGender.next(gender);
  }
  // function for normal alert
  public async presentAlert(text: any) {
    const alert = await this.alertController.create({
      header: text,
      cssClass: 'alertDiv',
      message: '',
      buttons: ['OK'],
    });
    await alert.present();
  }
  public async presentAlertMessage(heading, text) {
    const alert = await this.alertController.create({
      header: heading,
      cssClass: 'alertDiv',
      message: text,
      buttons: ['OK'],
    });
    await alert.present();
  }
  // you can route on ok button
  public async presentAlertThenRoute(text: any, routeUrl) {
    const alert = await this.alertController.create({
      header: text,
      // subHeader: 'Subtitle',
      message: '',
      cssClass: 'alertDiv',
      buttons: [
        {
          text: 'OK',
          handler: () => {
            // user has clicked the alert button
            // begin the alert's dismiss transition
            const navTransition = alert.dismiss();
            navTransition.then(() => {
              this.routeChange(routeUrl);
            });
            return false;
          },
        },
      ],
    });
    await alert.present();
  }
  public async presentAlertPrompt(heading: any, text) {
    return new Promise(async (resolve) => {
      const alert = await this.alertController.create({
        header: heading,
        message: text,
        cssClass: 'alertDiv',
        inputs: [
          {
            name: 'never_show',
            label: 'Do not show this again',
            type: 'checkbox',
          },
        ],
        buttons: [
          {
            text: 'Cancel',
            role: 'cancel',
            cssClass: 'secondary',
            handler: (cancel) => {
              resolve('cancel');
            },
          },
          {
            text: 'Confirm',
            handler: (data) => {
              let ok;
              if (data.never_show) {
                ok = true;
                // logged in!
              } else {
                // invalid login
                ok = false;
              }
              resolve(ok);
            },
          },
        ],
      });
      await alert.present();
    });
  }
  public formatMonth(date) {
    date = new Date(date);
    let dd = date.getDate();
    const M = date.toDateString().substr(4, 3);
    const yyyy = date.getFullYear();
    dd = dd < 10 ? '0' + dd : dd;
    const newDate = dd + ' ' + M + ' ' + yyyy;
    return newDate;
  }
  // ! formatMonthForPreviewPage() is required for date of signature in approval-preview
  public formatMonthForPreviewPage(date) {
    date = date.toDate();
    let dd = date.getDate();
    const M = date.toDateString().substr(4, 3);
    const yyyy = date.getFullYear();
    dd = dd < 10 ? '0' + dd : dd;
    const newDate = dd + ' ' + M + ' ' + yyyy;
    return newDate;
  }
  // function for date format in dd/mm/yyyy hh:mm
  public formatDate(date) {
    date = new Date(date);
    let hh = date.getHours();
    let mm = date.getMinutes();
    let dd = date.getDate();
    let M = date.getMonth();
    M = M + 1;
    dd = dd < 10 ? '0' + dd : dd;
    M = M < 10 ? '0' + M : M;
    mm = mm < 10 ? '0' + mm : mm;
    hh = hh < 10 ? '0' + hh : hh;
    const yyyy = date.getFullYear();
    const newDate = dd + '/' + M + '/' + yyyy + ' ' + hh + ':' + mm;
    return newDate;
  }
  public timeConverter(time) {
    // tslint:disable-next-line: one-variable-per-declaration
    let d; let hh; let h; let m; let dd: any;
    d = new Date(time);
    const original = d.toString().split(' ')[4];
    let timezoneData = d.toString().split(' ')[5];
    if (timezoneData) {
      const length = timezoneData.length;
      timezoneData =
        timezoneData.substr(0, length - 2) +
        ':' +
        timezoneData.substr(length - 2, length);
    } else {
      timezoneData = '';
    }
    hh = d.getHours();
    m = d.getMinutes();
    dd = 'AM';
    h = hh;
    if (h >= 12) {
      h = hh - 12;
      dd = 'PM';
    }
    if (h === 0) {
      h = 12;
    }
    m = m < 10 ? '0' + m : m;
    h = h < 10 ? '0' + h : h;
    const format = h + ':' + m + ' ' + dd;
    const temp = {
      timeInFormat: format,
      time: original,
      timezone: timezoneData,
    };
    return temp;
  }
  // function for back button
  public async routeChange(pageName) {
    this.router.navigate(['/' + pageName]);
  }
  public storeUserData(userdata) {
    this.storage.set('userData', userdata);
  }
  public getStorageData() {
    let temp;
    this.storage.get('userData').then((userData) => {
      temp = userData;
    });
    return temp;
  }
  // ? set loggedIn user data
  public setUserData(userdata) {
    // ! when in browser, set data to sessionStorage;
    // ! when in app, set data to localStorage, because sessionStorage expires when app is cleared from background;
    this.userData = userdata;
    if (environment.isWeb) {
      sessionStorage.setItem('userdata', JSON.stringify(this.userData));
    } else {
      // ! userdata set ionic storage in sign-in page
      // this.storage.set('userdata', JSON.stringify(this.userData));
      localStorage.setItem('userdata', JSON.stringify(this.userData));
    }
  }
  // ? logout
  public clearUserData(flag) {
    if (flag) {
      if (environment.isWeb) {
        sessionStorage.clear();
      } else {
        // this.storage.remove('userdata');
        localStorage.clear();
      }
    }
  }
  // ? get loggedIn user data
  public getUserData() {
    if (environment.isWeb) {
      return JSON.parse(sessionStorage.getItem('userdata'));
    } else {
      // this.storage.get('userdata').then((user) => {
      //   this.userData = JSON.parse(user);
      //   return this.userData;
      // });
      return JSON.parse(localStorage.getItem('userdata'));
    }
  }
  public setNric(nric) {
    sessionStorage.setItem('nric', JSON.stringify(nric));
  }
  public getNric() {
    return JSON.parse(sessionStorage.getItem('nric'));
  }
  public clearNric() {
    sessionStorage.removeItem('nric');
  }
  // ? for registration
  public setRegistrationData(data) {
    const result = sessionStorage.setItem('newUser', JSON.stringify(data));
  }
  // ? registration clear
  public clearRegistrationData() {
    const data = {};
    sessionStorage.setItem('newUser', JSON.stringify(data));
  }
  // ? get registration user data
  public getRegistrationData() {
    return JSON.parse(sessionStorage.getItem('newUser'));
  }
  // active part for registration
  public setActivePart(partNo) {
    this.activePart = partNo;
  }
  public getActivePart() {
    return this.activePart;
  }
  public setNewCase(caseDetails) {
    sessionStorage.setItem('newCase', JSON.stringify(caseDetails));
  }
  public getNewCase() {
    return JSON.parse(sessionStorage.getItem('newCase'));
  }
  public clearNewCase() {
    const data = {};
    sessionStorage.setItem('newCase', JSON.stringify(data));
  }
  public setSelectedCase(caseDetails) {
    sessionStorage.setItem('selectedCase', JSON.stringify(caseDetails));
  }
  public getSelectedCase() {
    return JSON.parse(sessionStorage.getItem('selectedCase'));
  }
  public setGoogleId(eventId) {
    sessionStorage.setItem('selectedId', JSON.stringify(eventId));
  }
  public getGoogleId() {
    return JSON.parse(sessionStorage.getItem('selectedId'));
  }
  public setAppointmentTime(dateTime, caseId) {
    const data = {
      startTime: dateTime.start,
      endTime: dateTime.end,
      caseId,
    };
    sessionStorage.setItem('apointmentDetails', JSON.stringify(data));
  }
  public getAppointmentTime() {
    return JSON.parse(sessionStorage.getItem('apointmentDetails'));
  }
  // ! for ipad
  public setHeaderTitle(title) {
    this.subscribeHeaderTitle.next(title);
  }
  public setCheckboxValue(value) {
    this.subscribeCheckboxValue.next(value);
  }
  public setLoaderCancel(value) {
    this.isCancelled = value;
    this.subscribeLoaderCancel.next(value);
  }
  public setShowLoaderCancel(value) {
    this.isCancelled = value;
    this.showLoaderCancel.next(value);
  }
  public setCancelBtn(value) {
    this.showCancelBtn.next(value);
  }
  // ? google calendar functions
  public async googleLogin() {
    let googleUser;
    this.presentAlert('google login instance');
    try {
      const googleAuth = gapi.auth2.getAuthInstance();
      if (googleAuth) {
        this.presentAlert('google login function Auth');
        googleUser = await googleAuth.signIn();
        const token = googleUser.getAuthResponse().id_token;
        let result;
        if (token) {
          result = true;
          this.presentAlert('google login function token return');
        } else {
          result = false;
        }
        return result;
      }
    } catch (error) {
      const resp = 'Error: ' + error;
      this.presentAlert(resp);
    }
    // this.listUpcomingEvents();
    // const credentials = auth.GoogleAuthProvider.credential(token);
    // await this.afAuth.auth.signInAndRetrieveDataWithCredential(credentials);
  }
  // // ? google calendar functions
  // public async googleLogin() {
  //   let googleUser;
  //   const googleAuth = gapi.auth2.getAuthInstance();
  //   if (googleAuth) {
  //     googleUser = await googleAuth.signIn();
  //     const token = googleUser.getAuthResponse().id_token;
  //     let result;
  //     if (token) {
  //       result = true;
  //     } else {
  //       result = false;
  //     }
  //     return result;
  //     // this.listUpcomingEvents();
  //   }
  //   // const credentials = auth.GoogleAuthProvider.credential(token);
  //   // await this.afAuth.auth.signInAndRetrieveDataWithCredential(credentials);
  // }
  // ? add to timeline
  public updateTimelineData(timelineStatus, clientId) {
    // tslint:disable-next-line: one-variable-per-declaration
    let clientTimelineDetails: any = {}; let clientTimelineId;
    this.firebase.getclientDetails(clientId).subscribe((resp) => {
      resp.docs.forEach((element) => {
        clientTimelineDetails = element.data();
        clientTimelineId = element.id;
      });
      clientTimelineDetails.timeline.push(timelineStatus);
      this.firebase.editClientDetails(clientTimelineDetails, clientTimelineId);
    });
  }
  public setEhealthData(ehealth) {
    sessionStorage.setItem('ehealthData', JSON.stringify(ehealth));
  }
  public getEhealthData() {
    return JSON.parse(sessionStorage.getItem('ehealthData'));
  }
  public clearEhealthData() {
    sessionStorage.removeItem('ehealthData');
  }
  public setMedicalData(medical) {
    sessionStorage.setItem('medicalData', JSON.stringify(medical));
  }
  public getMedicalData() {
    return JSON.parse(sessionStorage.getItem('medicalData'));
  }
  public clearMedicalData() {
    sessionStorage.removeItem('medicalData');
  }
  public setAdmissionData(data) {
    this.isAdmissionIdPresent = data.admissionId ? true : false;
    sessionStorage.setItem('admissionData', JSON.stringify(data));
  }
  public getAdmissionData() {
    return JSON.parse(sessionStorage.getItem('admissionData'));
  }
  public saveAdmissionDataToFirebase(admission, alertMsg) {
    this.isAdmissionIdPresent = admission.admissionId ? true : false;
    if (this.isAdmissionIdPresent) {
      this.editAdmissionInFirebase(admission, alertMsg);
    } else {
      this.addAdmissionToFirebase(admission, alertMsg);
    }
  }
  public addAdmissionToFirebase(admission, alertMsg) {
    this.firebase
      .addAdmission(admission)
      .then((resp) => {
        if (resp.id) {
          admission.admissionId = resp.id;
          sessionStorage.setItem('admissionData', JSON.stringify(admission));
          this.isAdmissionIdPresent = admission.admissionId ? true : false;
          const msg = alertMsg + ' added successfully!';
          this.presentAlert(msg);
        } else {
          const msg = 'Something went wrong. Couldn\'t add information!';
          this.presentAlert(msg);
        }
        this.dismiss();
      })
      .catch((err) => {
        this.dismiss();
      });
  }
  public editAdmissionInFirebase(admission, alertMsg) {
    this.firebase
      .editAdmission(admission)
      .then((resp) => {
        sessionStorage.setItem('admissionData', JSON.stringify(admission));
        const msg = alertMsg + ' updated successfully!';
        this.presentAlert(msg);
        this.dismiss();
      })
      .catch((err) => {
        const msg = 'Something went wrong. Couldn\'t update information!';
        this.presentAlert(msg);
        this.dismiss();
      })
      .catch((err) => {
        this.dismiss();
      });
  }
  // ? set client/patient data to session
  public setPatientData(data) {
    sessionStorage.setItem('patientData', JSON.stringify(data));
  }
  public getPatientData() {
    return JSON.parse(sessionStorage.getItem('patientData'));
  }
  public getClientNameInitials(clientName) {
    const name = clientName.split(' ');
    let clientInitials = '';
    clientInitials = name[0].substring(0, 1).toUpperCase();
    if (name.length > 1) {
      for (let i = 1; i < name.length; i++) {
        clientInitials += name[i].substring(0, 1).toUpperCase();
      }
    } else if (name.length === 1) {
      clientInitials += name[name.length - 1].substring(1, 1).toUpperCase();
    }
    return clientInitials;
  }
  public getNextFileName(
    prevfilename,
    prevFileDate,
    currentyear,
    currentmonth,
    currentday,
    type,
    pageName
  ) {
    let newFileName;
    let newName;
    if (type === 'date-wise') {
      const fileName = prevfilename.split('/')[4].split('_');
      let prevFileName;
      prevFileName = fileName[fileName.length - 1].split('.')[0];
      let prevdate;
      if (prevFileDate) {
        prevdate = new Date(prevFileDate).toDateString();
      } else {
        prevdate = new Date().toDateString();
      }
      const currentdate = new Date(
        currentyear + ' ' + currentmonth + ' ' + currentday
      ).toDateString();
      if (prevdate === currentdate) {
        if (prevFileName.split('-')[1]) {
          // tslint:disable-next-line: radix
          const newFileNameCount = parseInt(prevFileName.split('-')[1]) + 1;
          newName = prevFileName.split('-')[0] + '-' + newFileNameCount;
        } else {
          newName = prevFileName + '-1';
        }
      } else {
        newName = prevFileName.split('-')[0];
      }
      // ? create new filename
      newFileName =
        currentyear +
        currentmonth +
        currentday +
        '_' +
        pageName +
        '_' +
        newName;
    }
    return newFileName;
  }
  public OldgetNextFileName(
    prevfilename,
    currentyear,
    currentmonth,
    currentday,
    type,
    pageName
  ) {
    let newFileName;
    let newName;
    if (type === 'date-wise') {
      const fileName = prevfilename.split('/')[4].split('_');
      // let fileName = prevfilename.split('/')[4];
      let prevFileName;
      // ? for preview page, file name is '20201017 Preview AM.pdf';
      // ? for letter of consent page, file name is '20201017 Letter Of Consent AM.pdf';
      // ? whereas for other pages it is  '20201017 Consultation Memo AM.pdf'
      // if (pageName === 'Preview') {
      //   prevFileName = fileName[2].split('.')[0];
      // } else {
      //   prevFileName = fileName[3].split('.')[0];
      // }
      if (pageName === 'Preview') {
        prevFileName = fileName[2].split('.')[0];
      } else if (
        pageName === 'Letter_Of_Consent' ||
        pageName === 'Pre_Admission_Checklist'
      ) {
        prevFileName = fileName[4].split('.')[0];
      } else {
        prevFileName = fileName[3].split('.')[0];
      }
      const prevFileDate = fileName[0];
      const currentdate = currentyear + currentmonth + currentday;
      if (prevFileDate === currentdate) {
        if (prevFileName.split('-')[1]) {
          // tslint:disable-next-line: radix
          // const newFileNameCount = parseInt(prevFileName.split('(')[1].split(')')) + 1;
          // newName = prevFileName.split('(')[0] + '(' + newFileNameCount + ')';
          // tslint:disable-next-line: radix
          const newFileNameCount = parseInt(prevFileName.split('-')[1]) + 1;
          newName = prevFileName.split('-')[0] + '-' + newFileNameCount;
        } else {
          // newName = prevFileName + '(1)';
          newName = prevFileName + '-1';
        }
        if (pageName === 'Preview') {
          newFileName = fileName[0] + '_' + fileName[1] + '_' + newName;
        } else if (
          pageName === 'Letter_Of_Consent' ||
          pageName === 'Pre_Admission_Checklist'
        ) {
          newFileName =
            fileName[0] +
            '_' +
            fileName[1] +
            '_' +
            fileName[2] +
            '_' +
            fileName[3] +
            '_' +
            newName;
        } else {
          newFileName =
            fileName[0] + '_' + fileName[1] + '_' + fileName[2] + '_' + newName;
        }
        // if (pageName === 'Preview') {
        //   newFileName = fileName[0] + ' ' + fileName[1] + ' ' + newName;
        // } else {
        //   newFileName = fileName[0] + ' ' + fileName[1] + ' ' + fileName[2] + ' ' + newName;
        // }
      } else {
        // newFileName = currentdate + '_' + fileName[1] + '_' + fileName[2] + '_' + prevFileName.split('-')[0];
        newName = prevFileName.split('-')[0];
        if (pageName === 'Preview' || pageName === 'Consultation_Memo') {
          newFileName = currentdate + '_' + fileName[1] + '_' + newName;
        } else if (
          pageName === 'Letter_Of_Consent' ||
          pageName === 'Pre_Admission_Checklist'
        ) {
          newFileName =
            currentdate +
            '_' +
            fileName[1] +
            '_' +
            fileName[2] +
            '_' +
            fileName[3] +
            '_' +
            newName;
        } else {
          newFileName =
            currentdate + '_' + fileName[1] + '_' + fileName[2] + '_' + newName;
        }
      }
    }
    // else {
    //   const prevFileName = prevfilename.split('.')[0];
    //   const fileExtension = prevfilename.split('.')[1];
    //   // if (prevFileName.split('(')[1]) {
    //   if (prevFileName.split('-')[1]) {
    //     // // tslint:disable-next-line: radix
    //     // const newFileNameCount = parseInt(prevFileName.split('(')[1].split(')')) + 1;
    //     // newName = prevFileName.split('(')[0] + '(' + newFileNameCount + ')';
    //     const filenumber = prevFileName.split('-');
    //     // ? below regex returns whether the string contains all digits
    //     const isnum = /^\d+$/.test(filenumber[filenumber.length - 1]);
    //     if (isnum) {
    //       // tslint:disable-next-line: radix
    //       const newFileNameCount = parseInt(filenumber[filenumber.length - 1]) + 1;
    //       newName = uploadedFileName + '-' + newFileNameCount;
    //     } else {
    //       // newName = prevFileName + '(1)';
    //       newName = prevFileName + '-1';
    //     }
    //   } else {
    //     // newName = prevFileName + '(1)';
    //     newName = prevFileName + '-1';
    //   }
    //   newName = newName.replace(/ /g, '_');
    //   newFileName = newName + '.' + fileExtension;
    // }
    return newFileName;
  }
  public exportPdf(
    toPdfElement,
    clientName,
    bucketKeyPath,
    pageName,
    clientId,
    caseId,
    prevFilename,
    prevFileDate
  ) {
    return new Promise(async (resolve, reject) => {
      this.present().then((loader) => {
        loader.present();
        this.currentLoader = 'pdf';
        this.enableCancelForLoader();
        // if (pageName !== 'PCARE_LOE') {
        loader.message =
          '<span>Generating pdf....</span><br><p>Please wait for the process to complete!</p>';
        // }
        const clientInitials = this.getClientNameInitials(clientName);
        let today;
        today = new Date();
        // tslint:disable-next-line: one-variable-per-declaration
        let year; let month; let day: string;
        year = today.getFullYear().toString();
        month = today.getMonth();
        month = month + 1;
        month = month.toString();
        if (month.length === 1) {
          month = '0' + month;
        }
        day = today.getDate();
        if (day.toString().length === 1) {
          day = '0' + day;
        }
        const M = today.toDateString().substr(4, 3);
        // let filename;
        const now = new Date().getTime();
        // if (prevFilename) {
        //   filename = this.getNextFileName(
        //     prevFilename,
        //     prevFileDate,
        //     year,
        //     month,
        //     day,
        //     'date-wise',
        //     pageName
        //   );
        // } else if (!prevFilename || prevFilename.length === 0) {
        //    filename = year + month + day + '_' + pageName + '_' + clientInitials;
        // if (pageName === 'PCARE_LOE' || pageName === 'Client_Information_Sheet') {
        //   filename = year + '_' + month + '_' + day + '_' + pageName + '_' + clientInitials;
        // } else {
        //   filename = year + '' + month + '' + day + '_' + pageName + '_' + clientInitials;
        // }
        // }
        // if (prevFilename) {
        //   filename = this.getNextFileName(prevFilename, year, month, day, 'date-wise', pageName);
        // } else if ((!prevFilename || prevFilename.length === 0) && (pageName === 'Consultation Memo' || pageName === 'Preview')) {
        //   filename = year + '' + month + '' + day + ' ' + pageName + ' ' + clientInitials;
        // } else if (prevFilename === '') {
        //   filename = year + ' ' + month + ' ' + day + ' ' + pageName + ' ' + clientInitials;
        // } else {
        //   filename = year + ' ' + month + ' ' + day + ' ' + pageName + ' ' + clientInitials;
        // }
        // this.toDataUrl('../../assets/images/800px-National_Flag_of_Singapore.svg.png', function (myBase64) {
        //    // myBase64 is the base64 string
        // });
        const awsFileName = year + month + day + '_' + pageName + '_' + clientInitials + '_' + now;
        const that = this;
        const marginForPdf = pageName === 'Preview' ? 0 : 10;
        const allNodes = document.querySelectorAll('#' + toPdfElement);
        const element = allNodes[allNodes.length - 1];
        const opt = {
          // margin: [10, 10],
          margin: marginForPdf,
          filename: awsFileName + '.pdf',
          html2canvas: {
            allowTaint: true,
            useCORS: true,
            logging: true,
            removeContainer: true,
            scale: 1,
          },
          image: { type: 'jpg', quality: 0.95 },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
          pagebreak: { before: '.before', avoid: '.avoid', after: '.after' },
        };
        html2pdf()
          .set(opt)
          .from(element)
          .toPdf()
          .get('pdf')
          .then((pdf) => {
            const totalPages = pdf.internal.getNumberOfPages();
            // ? previous watermark img; PREMIUMCARE SG (without space)
            // tslint:disable-next-line: max-line-length
            // const watermarkBase64 = 'data:image/png;base64,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';
            // ? new watermark img; PREMIUM CARE SG (with space)
            // tslint:disable-next-line: max-line-length
            const watermarkBase64 =
              'data:image/png;base64,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' +
              'erRC6yyHjJq4OjS1X/flbsq6WMMCWmfUi6Cra+PjUwVhfaD9bQ4fYghIe3TILAxeMVdQ1vkrXYyVR4GpI+xHU7an4w+6ZtxRMR4y9bX38/UCay96L6ML6pXX+XPa6iW/12tefz1R7hX04kzJKT9uaAb2K3psaGSdRLYLjDm6o+v9Wx9GKx7vGKxQ+2DIXHaDAlpX7oMSFbGEU8NlKwXz9QP7vIcr/n928+uo2hozKMDZkhI+xEzCLS+5o21vkZc1bzVh9SJqYoHhrt7gXQYLFxL+9GjH2x9HTc0jujteCu/iBlDG2pPnyEh7UOo9TViyrCxVdLfthhH1FHxtNX2gzoShoT09SIuArs1lY2dDh1xEShaN/sdTKxHnAdDQvp6bQaB3ZqmjBq67abc7HgckfO409OydTAMCenr9emsVB4qUq4aef+/OAh1lxZrOWx9PQvJ9k8h6UO6XAdv4jFtOiTMtrz9tvkr8C87Wv5qwryxiTEdPFtgpa+VBnd9XVish27zuMXEU8RNcDuOJyJYxkRETPVqA8DoQ28XK4a2vp4PQ0L6Wl0GxGvHChUJAzqMefzkoro+/ZXxQsUjt8vfRzwvlfs9rng9wvgdGPGrEImIlx8Tk1uyPieGhHRoIjIyOgx5+PB2fCnfAqOCOb8+8Eyr0RG9+q+I0sOMzok1CelrFUyBbGPTSEqbLvEHKxTXXKyMI0p+8fSJK61efpWUlBTLX44izoohIX2tijlTZsSkG8rIERkt2kS1N+ro8H1ldqBiyk87kfRZhoT09UpmTChobfwXGNOiQ0ZeawOMb/QC9YgfrmjQ5xkS0n4UTBnVCIqIhBbdGkHR42bluSqeuHMcoc8zJKR9qciZMmFzhSIio02X6N0KxV+BQ4Yq/mOZWdswJKR9qpgzqV2haNNe21t0wfVK1FQ88rDvb1HHzZCQ9u1jFYouLeYrE08p//NyLOlvc/5rL5K2Y0hIh6CoPfGU0KJHwvSPiacbBoGppl+M9v2N6dgZEtJhWEw8jYFs48RTSpsB5UtrbCe4W9PE1ldtz5CQDkfJnAk5CcmGoIhJ6dJZBsXfgZJ1yb+2vmp7hoR0WEpmPNWuUPRok3EVKFnb+qpGGBLSoakoXyoUmyaeFmsoQrs1/dfWVzXBkJAOUcWcMTPSGq2xceCz7z61W5O0wpCQDlXFnBHzGhWKt+b8a+urmmFISIdsUaGoaH8gJip+Mtn3hetUGBLSYVtUKMbEGysUz+b8cByhphgS0uFbVCimZLUmniLa5Jat1QxDQjoOJfPlxNOm44oiMnq0A5t3SB9mSEjHo2TKI2ysUEQktOmTMt73JevYGRLSMakomTAiqbWGos0FfPicbOkVQ0I6NhUFo1oVimi5eYcVCn2aISEdo6p2hSImo0+LmR1P+gxDQjpWi9bYqMbEU0ybAZEb/unjDAnpeFUUjJnVWEMRkdChS/WyvbhUiyEhHbfFxFNOWmN78Yw+HXJbY1WfISEdv4opj1SBUyX+FC2DImFuhUL1GBLSaaiYMqo18RTToU9la6zqMCSkU1GRM2JWqzU2oWuFQnUYEtIpqZgzrF2h6NGitEKh9xgS0qmpmDIkpgXvBsWiNXZRofCgU61hSEinqGTMqOa5dh36lFYoFGZISKepIuepdoWiZ2uswgwJ6XQtKhTQho1B0aJL7nhCbxkS0mmrmCxbYzcFxYw7V0/oLUNCOnWL1thNFYqcO0+f0CpDQjoHiwrFfG1rbMWQn/u+SB0iQ0I6F4vW2IgW0UpQzLl1YZ1CDAlpW9H2T/FlKsaMVzbvqBhyt+9L02EyJKTtpPSJYfnu/BgCI2fEnJT45Wqn/LT9VWHH8CMtHa6IK/5Znjw9Y86cKRVQLf/3cCVcckGbiIJf3O77cnSoDAlpGx3+D60/HimZkzNjzowZi7ioDjQuUr4zYMp/PANb6xgS0uclfOf6nT8vmS/DYkbOIQZGRJuY0b4vQ4fLkJA+r8v/Ja35scWruChe4uKQAkMKMCSkz8r4m8GnPvN1YBzmCENaqvsuSNKfInqfjAhISOgsfz9f1jBmzClYBIabY+hgGBLS57S4auR5MrLl7wryZWRMXsYXpeML7ZchIX1GwuBlLNDccya0l79/DowJc0pKJ6S0L4aE9BkxvZ0+/5+BMWPOlJw55XJ0YWDoi1i4lj4j5orvxF/+dfPlgr18WcEwMLRjhoT0OQnfuVqzo+qMnJSYmGiHQTJddknlr6akLHmrYYaE9Fkp/wT7m3JuuSWmS4uMjJToJTB29Z5/ypwZBeOXcrclbzXCkJA+L+P/0l25GUdM+PfVKuaIFm0y2mREL4GxK/lyfDFlbmBoe4aE9HkRPf4n0P5R8cRPpoGPz5Zhkb6ajop2cguPqMjJmZEzJV9OSJVWMPQxhoS0jYgL/g5suV/xyL/vbr+d0l5ORyXLuEh2FBeLwJgv95GaM3ZbcNVnSEjbWdfnVPJQ85SGmBYtMtov1YuYaGfjizn/cUM/1eehQ9J2KuYktFfecEVksDxdYtMz5EwZ88gjI6bMXyaHCBw0uu3VegadPsSQkLZVMSN9Wfr2W0JGGahMvPdMBTPGPDFkxJQZc3LiBtto5xsmwaQ3DAlpeyUz2m8OH4JFTBTMP/GMi7iY8MQTnTcnUsNnRxgl9wz3/WLpuBgSUhMKCrqBf08pGfNPxcSzb1ysjCQWPUuL6aiPtNNO+dfeJn2MISE1I6ekE5gYykiZfnqKp8P3lRFKxS9+8cR0GRZlzbjI+clk3y+Tjo0hITUlBzqBG3VKzPiT7+C/0V15xjG/yF+qF4+MX6oX+XJbjjgwHVUx5Ne+XyIdH3eBlZpScE/MdaB+MKDg1ydGE116JG/ipeTuzTPNmC1/lyxXXrSJiZfrL2KgAnIe9v0C6RgZElJzcu5IuVh5POaSktsPbr8Xc0W2MgIZvjMqKRgzBiAhJaNFSmu57uJp+SfShxgSUpPm/CSlt3IbT7mi4P5Dk04Deiujkpz7WiOSgmLZfLuIi8SI0OdYk5CaVVDQCbz9WqyamNV+noTvK2ffVdzy9MHqxqKZ9vOlc505Q0Jq2qLPadt22G8MVnqlJjU3+pAaY0hIzcuBVrAdNmFGXuMZOnwLtL7awqovZ0hIzauYE69ph02YbRwNxNys1CMinrjz5Dl9NUNC2oWSeXA/p3rb/g24JnvzWBE8oULaMUNC2o2SeXA/p4g20bsxkfCN7spn3fPgOEJfz5CQdqWgDPY5xbQoma2NiQsuV+oZc359oDNKaowhIe3OfE2fU0JKseamn/Et0Pr6k5Fb82kfDAlpl9b1Oa1vh/3GxUrJesStra/aD0NC2qX1fU7hdtguNyt1jJJftr5qXwwJabfK5fGmq1LSN+2wMd/ovfmoiAfuLVlrXwwJadfW9zm1gOmrABhwtVLoLvhpyVr7Y0hIu1dQ0g5up7mIiUVJOuMm2Pr6aMla+2NISF9hDrQD/95et8Nec7lSu5jZ+qr9MiSkrzEnph0oYCdkFEzJ+LZSuaj4Zeur9suQkL5GxWxNTKRklAzoB3drsvVVe2VISF+lZLamzymjFVh0V7pbk/bPkJC+zro+J0hWFtxFPPBo66v2zZCQvtL6Pqe35vxyHKH9MySkr7Wuz+lPEb8YWrLW/hkS0ldb1+f02oxftU6wk3bMkJC+2vo+p98f8Yux4wgdAkNC+nol0+C5dQsRQ1tfdSji7Z9C0ofl3DJeO5YYO9WkQ+FIQtqP9X1OETBxJKHDYEhI+7K+zykjZuIaCR0CQ0Lan/UF7BbxH5uIS3tiSEj7s+hzagViIqJF+bKJuLQ3dVZ+SucoISUjJl62d5SUlOTMGn1/n3NPurK1H0DMDSUPjia0X4aE9FaXDhktYmKilw7AioqKkpKCKZPGagZTfpHSDYwZUr5RuO5a+xVt/xTSyWgzoE1Guhw/rN6eI6CioGDOmPuGepAG/EU7+NXG/Mt43y+Lzpk1CWmhxw3X9OmSEG94+xSTklIwbOhrL/qcQquWEjLGTjlpfwwJCdp854o+2QeWl+b8ZN7YFazrc4rISGyH1f4YEjp3KTfc0CP70ORryZCHBq+iYkoS7HNatMNOrExoPwwJnbc237hcc3N+z5h/G353X5GTBaMqogW2w2o/DAmds0v+oveJfwUFdzsoJxfM6ZAF/iSiTcnMmNDXMyR0vr5xs/Fch7AJP3dyw87J1+znFNNm3mANRKrJkNC5+sZ18F37ZvkODxbNWdfnFJMxc9s/fTVDQufpb65rLSWN/vgFUDHidocTP+v3c0po8WSfk76Wi+l0jr5zveENUs6MCQX5yxRPREZKF/i14+VtCd+5DI4mKob861kT+kqGhM7Pd67eHUWMeGJESbnciuNZREQC5DsvILf4m17wX2fFAz+cdNLXcbpJ52bAt3dqEY/84p4x+TIi/rTYu2n3CmZ01/Q52Q6rL2VI6Ly0+Xvt2dIT/uWeKcUB3IIL8jUHEkX2OekrGRI6Jynf10zjwD0/Dmr7i/f6nMaumdBXMSR0Tq7XFoR/cHdw787X9TmNubN4ra9Sfzsz6di1uQi+Lar4wcMB3nZLfvEYGNvcH1yc6YQZEjof17QCjy4i4jD7hUpuGb+ZWHpk5FSTvo4hoXNxEaxGHHJEAMz4wezVf+fcHuCYRyfMkNC5uAq2lA553FNEdILjmlVTfryaXnp0qklfy8K1zsNFsGQ953/3dNPt8Bfdmnsx5VTLPqdpowcdSTXU2b1GOn6hNdYV/+7plhtzSY+KiJ9MNn50xT0ZV8SOI/T1DAmdg96aqabxnkrA3WV9pE/Fzxo7ylb8JCZleEDrOHQmnG7SOfhOd6VoXb0pCX+dlBt6y98vNtnYfOuvmDNhbl+TvpojCZ2+NLgkbbi3c6P79F/91zU5dzViYkZkROjr2d2k0xc6oLTiYU9TNy36b96cXdKt9ZlGhPbAkNDpC4XEZG87qXbpvvnKLa7Wbjoo7ZkhoVOX0gpMNu1rAV2Pq0BkDeh7tosOkyGhU5cGf8r31dfUphN4NKLvWEKHyZDQqesE3rnP99ZKOgkefVrRpee/Rh0ifyx16rLgZtv7KgKPuQ023kb03zkvT9obQ0KnLgmExD6P7BkGG14rWoaEDpEhoVMXGkns94DSJ54Cj6Z0Xdyqw2NI6LSFy9b73Wx7zmNgyqmiV3NfWOkLGRLS1xsxDoxvUkcSOjyGhPT1SsaB/VzDKzqkvTIkdI72v2fZlGkgEFoHcGXSHwwJnaN07+/Yp8ENwpO9X5f0hiGh01YF+5gO4Wacr2wMUq0ps0t75I+kTlu42bVzACExZ75yFbH/InVo/JHUqQsd1NM5gJ/8MnBd8QGEl/SH/f9TkXYrPJbYfx9RvufVGlIthoRO3Sy4md+FP/tSHf5D0ambBEOi48I1qQ5DQqduGjxeKOPSn35pM/+Z6PSF93y92PPCtSTwr6/Y2zkX0hqGhE7faM1YYr9HhsaBCa9yr7vTSgGGhE7faE0f0fVed11NSd5EQrTHE/OkNQwJnb6Cp+DNN+P7Hqec0uCxqsUnnknaIUNC5+AxsOcqwICLPU05JbSsSegYGBI6BzPGa26/13T2ckWhw0qr4Opwaa8MCZ2HuzVjiYx/aO/hetq0VyoSY9dg6/AYEjoP68cSbf768gJ2RCtQkZgZEjo8hoTOxV3gXOmFPt+/OCZ6dFceq9Ys+5P2yq0JdC4K1u/+2iZh9mW36IgLBiuPTnlYMyUm7ZEhofMxJaO9ppupTfJlDajdwAqNiEeGlq11eAwJnZM5nUBX0UKbjPkXVAUirgLjiIrb4IGm0p4ZEjonBcU7+7+26HxBTAy4XgmqiCGPViR0iAwJnZc50F7bsJHSo9rpkraMb/RWppUq7hnt+6WRQgwJnZvJmtXOCzF9UoodvauPueFy5dGIJx5sf9VhMiR0fqbE78QEtOmwiy0yYi65Du79euc4QofKkND5qTbGREqflLLRrbsjLvgWXI/xyIP1CB0qQ0LnaHNMQJseMWVDt++YAd9WtuKAiBm/7GvS4TIkdJ7qxERMd/kR2wZFzAXfAxEBFQ+uj9AhMyR0riqmsCEmoEVv66DIuOaGViAKIsZrtx6UDoIhofNVMaYi3Xjw0HNQRPDhYnZKjxuugv/SIubc8rTvl0F6jyGh8zahIK6xvV+LHl0yEiKqmtNDKX0uuaa35s8Lbnl0qkmHbZ8HwUuHocU3erUOMo2oGDNhSk5Osbb7KSMjpcuAdG0IVNxx6+oIHTpDQoKECy5rnlEXARUzZswpKCiolr8iIiJiUjq0yYjfGSVUPPJr7ebl0sEwJKSFHpc1xxMLz/92ckpKoCQiJiYhhg2TSBVDfhoROgaGhPQs4YLB2jMnNlmMMOowInRELFxLzyomzMhr9Dt9XmRE6LgYEtJrOWNyKuKdBEXEnAdujQgdD0NCemvGmDnlDoJiyh33djTpmBgS0qrqJSgi0kYqdxEFQ365BYeOjSEhhT0HRQ7Ey/XWn7NYXXHPndNMOj52N0mb9GjTpUVWo7n1TxFQMGbMkzu96jgZElIdGS1adJZrqWFTWCz2eZoyW67Qlo6UISHVl5GS0SIjIyENrqioKCiYM2fGjKnHCem4GRLSx2Wky5CIliusASrKZUQU5MwbP/5U2gNDQtpO/Cokqto7xEqSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJHnGtQ5SQuam29IhMCR0iDr8Q4fcU92kfTMkdHhSrrmgTZuYueMJaZ8MCR2aiAHfiIjI6NAB5vu+JOl8GRI6NC1u6Cx/H9OiS5ucfN+XJZ0nQ0KHJeaSqzePtOjRYm6FQvp6hoQOS4fvpG8ei0hp0yWyQiF9NUNChyThkkHwTyJSKxTS1zMkdEg6fH/nZzImo0vbiSfp6xgSOhwZN/Te/YiImBYdEnLKfV+udA4MCR2KiD7fiGp8XEqHnhUK6SsYEjoUMX36NT92ERRtSltjpd0yJHQoKioyWrU/PiazNVbaNUNChyOnpPOBn8mImDZdEuZWKKTdMCR0SOYU9GrUJX57bo0tbY2VdsGQ0GGZE23ocFoVkdKnY4VCap4hocNSkZPS/uBnRcRk9MmYOfEkNcmQ0KEpKD5UmXi2qFDYGis1ypDQ4ZlTfrAy8SwipUuXwoknqRmGhA7RuspExBMTsncDZFGhaDGzNVbaniGhQ1QxJ6K78njEjFvGtFZ2iv3zo2JaXFqhkLZnSOgwlZTBKGhR8MiQioz4nc9/rlBAboVC+jxDQocqX1PAbjFnzJgxEemGoEjp0aWgMCikzzEkdLhyItorMRDTImdGzogJGdm7zxGRMiBj6sST9BmGhA5XRU7yct71bwkJM3Iqch6Z0Xr35zgiokXPzTukzzAkdMhKiuBYIYPl2KBixlONCkVKlz5WKKQPMiR02HIK2oECdkbJbHnDLz9QoWhboZA+wpDQoZtT0Q1WJubMXv4754k5LZINaygyLohf4kXSBoaEDt+cJLBmIiFl/sfK6jlPlGTE7wRFRESHvpt3SPUYEjp8i03/Vo8j+l2ZeFYyYQhkRO8GRUqPDrkTT9ImhoSOQUERXFrXoWLy5kZfMmZGTLKhQpExsEIhbWJI6DjMIVCZ4E1l4vdHD61QSE0wJHQswpWJRQE7dCrdjFHtCoXHFUlrGBI6FhVzksBxRCnRmh1fS8ZMSEg3Vij6ViikMENCx6MkDy6t61AwXXODz3liWrNCkTIDg0J6zZDQMcmpaAd+atvBysSzOY/LNdnvVyg6XFmhkP5kSOi4zNYsreusqUw8m/AEpDWCwgqF9IohoWOzfmnd7N2be8loWaHYtHnHokJROqKQDAkdn3VL61pUGzcEzxlS1Jh4skIhLRkSOj4F5cZN/9abck+5YU02RLTpEblrrM6dIaFjFF5aF9Ni9m5l4tmEp2XH06bNO6xQ6MwZEjpOcxI6K7f4hGxDZeJZWbM1NqVP5uYdOl+GhI5TxYwssLSuBcxqnkCXM9y4Jnsx8TQgYrzvb1naB0NCx6qkDC6t676ztG7VlBGQbKxQxDx5+KnOkSGh4zWHtUvr6lQmFkpGGysUOb8cSeg8GRI6ZnMi2lsUsJ+VPJETralQVIz4ue9vVdoPQ0LHrGJORmtlBJCt3fRvvdnaCkXOrw9FjnRCDAkdt5Kc1gc3/VvvuULxOigqHrjb97cp7YshoWOXUwSX1nU+OOW0UDJiSkz8EhRz/mvJWufLkNDxmxPRWakmRJ+MiUVrbE5ESkzFPU/7/gal/TEkdApmpLQDS+tSph+sTPx+xicqEnJ+OI7QOTMkdAoWBexsJSbqbPq33oQnxpasdd4MCZ2GYk1lot6mf+uUnxyHSCfDkNCpCFcmFmsm3KJP+iRDQqdjXWWixdSYkD7HkNDpqJiuWVpXf9M/SX8wJHRKSnLaW2/6J+mFIaHTklMGN/377JoJ6cwZEjo1MwgurWtbmZA+zpDQ6ZmSBQvYCRMrE9LHGBI6RXNatFYebVuZkD7KkFCzYlobjgP9CgXlmk3/5sz2fG3SUTEk1KSIC27o0KFFi5SMeE8/Y+9t+mdlQqot3f4ppBcpN6+qATkFBQVzCnIKKioKKkrKL5j0uSfjaiUmUr6RM933CyUdC0NCzYm4pAUvAZCQvJp4yikplv+7+P+LX8WOIqPiloz+ytRXjyt+OZqQ6jEk1Jw2Vyu35N+3/4Tkj31a/xxnLEYXBWWDt++cWxK6K1d0Sc6tBWypDkNCTUn4VuPn6c/QiF4eLSiWI405BSz/u9xyH9Yx9yQrfU4x18vzIiRtYEioGRF9+h/+rHBkQLUcZzyPNn4HxkcjY0jKzUrxPOUbcysT0mb7blXUqUj4f+g0+oyvI6NYRsZzaFSUL/+7ScrfDAI/6Y/8a2VC2sSRhJpxQbvhZ3w9GfTn1FT+MqooyZfTVM//vSrnFwndlZi4ZM5Pp5yk9zmSUBPa/N/ACudd+v2T+zou8peJqZLy1YZ+Xf4JhFjJf3k0JqT3OJLQ9iKuA9tz79bvW3tESvoSGuXLyGJxbOlzgMwD50zEfGPOeJ8vnXToDAk1If3AmPR1raE5z88VkfLnOCOnJF8zzmnxjf+1MiGt57YcakJJSVrrp6lkxNOyBF0BETER0c4mPiMSsnf2k2pROZaQ1nMkoSY8MWZCn/7KNhirSiZMiJbF6GT5KyUmIX71+c2NM95/pismrpmQ1rFwreZk9Lmgx6bb8owhj69WKSxiIn4JjPjl/36Hxi5v4v/LgyEhhRkSalaXHgM67950IypGPDAOHii6CIfniEhfjTOSndQzxvzHg02ldQwJNa/HgAHZhht5zpgnnjYuh3s9ukhfImTxyPahUfAfRo4jpHUMCe1CQo8BfZKNQfHEI+MP3KT/HGcsxhjp8nefiYw7fnikqbSeIaFdyehxSW/jDXvKEw+fPi/udwUjWa6YWIRG/Mca7XXm/P/cwUl6jyGhXeoyoE97Q4WiZMRjjYmnzeKXaaj4j76p9FUf3+tr+eGW4dL7DAntVkKHHhc1KhQjHhuuDkQvU1MJCc8nWqTLgjiM+X8tWUvvMyS0ewk9LulurFDMeOJhh9M/0ctU1CImxh+qhkhnyZDQ12jR3VihiCiZMOLx0xWKj4gMCGkzt+XQ1yiYMqcgeXeVf0SLDi0icm/h0iEwJPR1cqbMqMje3bzjOSgqN96T9s+Q0FeqmDNlxqZ9Y2PadMg+cVyppEYZEvpqJVOmzMg2nEGR0qZFtOa8OUlfwpDQPhTMmFKQvfsTGJHRoWOFQtofQ0L7Uq9CES8rFKUVCmkfDAl9xKaVDh9TMWPKjHTDxFNCiy4ZcyeepK9mSKi+hL/pNnyrLpkxYbohKCJSWnSIyQ0K6SsZEqrvims6dEkaXhVdMGVKQatGhcI1FNKXMiRUV8JftIho0aIPDa+KzpkyoSLb0BrbokPbCoX0VQwJ1XXDxfIG/nyrLhq9VVfMmWysUCwmnqxQSF' +
              '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' +
              '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';
            // for (let i = 0; i < totalPages; i++) {   // ! for demo
            //   pdf.setPage(i);
            //   const width = pdf.internal.pageSize.getWidth();
            //   const height = pdf.internal.pageSize.getHeight();
            //   // pdf.addImage(that.watermarkImg, 'PNG', 0, 0, width, height);
            //   pdf.addImage(watermarkBase64, 'PNG', 0, 0);
            // }
          })
          .output('datauristring')
          .then((resp) => {
            //
            // var buf = new Buffer(resp.replace(/^data:application\/pdf\/\w+;base64,/, ""), 'base64');
            //
            let uint8Arr;
            fetch(resp)
              .then((res) => res.arrayBuffer())
              .then((buffer) => {
                uint8Arr = new Uint8Array(buffer);
                const filesToUpload = [];
                let key;
                let awskey;
                if (pageName === 'Client_Information_Sheet') {
                  // key =
                  //   environment.aws.bucketRootKey +
                  //   '/' +
                  //   clientId +
                  //   '/' +
                  //   bucketKeyPath +
                  //   '/' +
                  //   filename +
                  //   '.pdf';
                  awskey =
                    environment.aws.bucketRootKey + '/' + clientId + '/' + bucketKeyPath + '/' + awsFileName + '.pdf';
                } else {
                  // key =
                  //   environment.aws.bucketRootKey +
                  //   '/' +
                  //   clientId +
                  //   '/' +
                  //   caseId +
                  //   '/' +
                  //   bucketKeyPath +
                  //   '/' +
                  //   filename +
                  //   '.pdf';
                  awskey =
                    environment.aws.bucketRootKey + '/' + clientId + '/' + caseId + '/' + bucketKeyPath + '/' + awsFileName + '.pdf';
                }
                const fileObj = {
                  arrayBuffer: uint8Arr,
                  key: awskey,
                  name: awsFileName,
                  size: 1,
                  type: 'application/pdf',
                };
                filesToUpload.push(fileObj);
                this.awsService.uploadFilesAWS(
                  filesToUpload,
                  (data: any) => {
                    const respObj = {
                      status: 'success',
                      awsFileName: awskey,
                      // filename: key      // ? not needed as we are appending timestamp(ms)
                    };
                    const selectedCase = this.getSelectedCase();
                    if (selectedCase) {
                      selectedCase.caseFolders.admission = new Date().toString();
                      this.firebase
                        .editCase(selectedCase)
                        .then(() => {
                          this.dismiss();
                          resolve(respObj);
                        })
                        .catch((error) => {
                          this.dismiss();
                          reject(error);
                        });
                    } else {
                      this.dismiss();
                      resolve(respObj);
                    }
                  },
                  (err) => {
                    reject(err);
                    this.dismiss();
                  },
                  (progress) => {
                    this.currentLoader = 'aws';
                    const uploadPercent = Math.ceil(
                      progress.uploadedPercent / uint8Arr.length
                    );
                    // tslint:disable-next-line: max-line-length
                    loader.message =
                      '<span class="upload-percent">Uploading... ' +
                      uploadPercent +
                      ' %</span><br><p>Please wait for the process to complete!</p>';
                  }
                );
              })
              .catch((err) => {
                this.dismiss();
              });
          })
          .catch((err) => {
            this.dismiss();
          });
        // });
      });
    });
  }
  public getDateAndTimeOfPdfUpload(timestamp) {
    // tslint:disable-next-line: one-variable-per-declaration
    // let date, convertedDate, convertedTime;
    // date = new Date(timestamp);
    // // date = timestamp.toDate();
    // // const dateToString = date.toString();
    // let month;
    // month = date.getMonth();
    // month = month + 1;
    // if (month.toString().length === 1) {
    //   month = '0' + month;
    // }
    // let day = date.getDate();
    // if (day.toString().length === 1) {
    //   day = '0' + day;
    // }
    // // const splitDate = dateToString.split(' ');
    // const splitDate = timestamp.split(' ');
    //
    // convertedDate = day + '-' + month + '-' + splitDate[3];
    // const timeSplit = splitDate[4].split(':');
    // convertedTime = timeSplit[0] + ':' + timeSplit[1];
    // return { date: convertedDate, time: convertedTime };
    // tslint:disable-next-line: one-variable-per-declaration
    let date; let convertedDate; let convertedTime;
    date = new Date(timestamp);
    // date = timestamp.toDate();
    // const dateToString = date.toString();
    const today = this.formatDateAndMonth(date);
    convertedDate = today.split('/')[0];
    convertedTime = today.split('/')[1];
    return { date: convertedDate, time: convertedTime };
  }
  public signatureModal(prevSignature) {
    return new Promise(async (resolve) => {
      this.modalCtrl
        .create({
          component: SignatureModalPage,
          cssClass: 'signature-modal',
          componentProps: { signature: prevSignature },
        })
        .then((modal) => {
          modal.present();
          let obj: any;
          modal
            .onDidDismiss()
            .then((resp) => {
              // if (resp.data) {
              if (resp.role === 'success') {
                obj = {
                  status: 'success',
                  signature: resp.data,
                };
              } else {
                obj = {
                  status: 'invalid',
                  signature: resp.data,
                };
              }
              resolve(obj);
            })
            .catch((err) => {
              obj = {
                status: 'error',
                error: err.error.text,
              };
              resolve(obj);
            });
        });
    });
  }
  public encryptData(data) {
    try {
      return CryptoJS.AES.encrypt(
        JSON.stringify(data),
        this.encryptSecretKey
      ).toString();
    } catch (e) { }
  }
  public decryptData(data: string) {
    try {
      const bytes = CryptoJS.AES.decrypt(data, this.encryptSecretKey);
      if (bytes.toString()) {
        return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
      }
      return data;
    } catch (e) { }
  }
  public setDefectPhotosObj(photosObj) {
    this.defectPhotosObj = photosObj;
  }
  public getDefectPhotosObj() {
    return this.defectPhotosObj;
  }
  public setCurrentDefectObj(obj) {
    this.currentDefectObj = obj;
  }
  public getCurrentDefectObj() {
    return this.currentDefectObj;
  }
  public getFileNamesFromFiles(filesArray, pageName) {
    const files = [];
    let filename;
    let newFilename;
    if (pageName === 'insurance-docs') {
      filesArray = _.orderBy(
        filesArray,
        [(file) => new Date(file.fileUploadDate)],
        ['desc']
      );
    } else {
      filesArray = _.orderBy(filesArray, 'fileUploadDate', 'desc');
    }
    // eslint-disable-next-line @typescript-eslint/prefer-for-of
    for (let i = 0; i < filesArray.length; i++) {
      const file = filesArray[i];
      let date;
      /** ? in personal-particulars, aws path is:- root/clientId/personal-particulars/filename;
       * whereas in insurance docs and case-folder, it is root/clientId/caseId/folder-name/filename
       * also
       * date in insurance docs is from firebase, hence requires toDate()
       * and date in personal-particular & case-folder is timestamp, hence does not require any function
       *  to get it in date format
       */
      if (pageName === 'personal-particular') {
        date = file.fileUploadDate;
        filename = file.fileUploadKey.split('/')[3];
      } else {
        filename = file.fileUploadKey.split('/')[4];
        date = new Date(file.fileUploadDate);
      }
      // ? replace '_' with space
      // eslint-disable-next-line no-underscore-dangle
      const _split = filename.split('_');
      // const timestamp = _split[_split.length - 1].split('.')[0].split('-')[0];
      // if (timestamp.length === 13) {
      //   filename = filename.replace('_' + timestamp, '');
      // }
      newFilename = filename.replace(/_/g, ' ');
      const year = date.getFullYear();
      let month;
      if (pageName === 'insurance-docs') {
        month = date.toLocaleString('default', { month: 'short' });
      } else {
        month = date.getMonth();
        month = month + 1;
        if (month < 10) {
          month = '0' + month;
        }
      }
      let day = date.getDate();
      if (day < 10) {
        day = '0' + day;
      }
      const M = date.toDateString().substr(4, 3);
      let fileSize;
      const fileDate = day + ' ' + M + ' ' + year;
      if (pageName === 'insurance-docs') {
        fileSize = file.fileSize || file.fileUploadSize;
      } else {
        fileSize = file.fileUploadSize;
      }
      const obj = {
        fileName: newFilename,
        actualFilename: file.fileUploadKey,
        fileSize,
        fileDate,
        show: true,
        showDropdown: false,
      };
      files.push(obj);
    }
    console.log('files: ', files);
    return files;
  }
  // public openFile(doc: any, filesArr) {
  //   this.isCancelled = false;
  //   let awsFilename = '';
  //   if (doc.fileUploadKey) {
  //     awsFilename = doc.fileUploadKey;
  //   } else {
  //     awsFilename = doc.fileName;
  //   }
  //   //  ? replace space with '_'
  //   if (doc.fileUploadKey) {
  //     awsFilename = doc.fileUploadKey.replace(/ /g, '_');
  //   } else {
  //     awsFilename = doc.fileName.replace(/ /g, '_');
  //   }
  //   // ? replace '(1)' to '-1'
  //   awsFilename = awsFilename.replace(/\(/g, '-').replace(/\)/g, '');
  //   let currentFile = {
  //     fileName: '',
  //     fileType: '',
  //     // showFileName: doc.fileName,
  //     showFileName: '',
  //   };
  //
  //   // ! in discharge-docs-checklist page, not showing file names in left-container
  //   // ! hence assign showFileName here as doc does not contain 'fileName'
  //   // ? need showFileName to show file name in right-container of discharge-docs-checklist page
  //   currentFile.showFileName = doc.fileName ? doc.fileName.replace(/_/g, ' ') : doc.fileUploadKey.replace(/_/g, ' ');
  //   if ((awsFilename && awsFilename.includes('pdf'))) {
  //     currentFile.fileType = 'pdf';
  //   } else if (awsFilename && ((awsFilename.includes('jpeg')) || (awsFilename.includes('jpg')) || (awsFilename.includes('png')) ||
  //     (awsFilename.includes('JPEG')) || (awsFilename.includes('JPG')) || (awsFilename.includes('PNG')))
  //     // tslint:disable-next-line: max-line-length
  //   ) {
  //     currentFile.fileType = 'image';
  //   } else if ((awsFilename && (awsFilename.includes('docx')) || (awsFilename.includes('doc')))) {
  //     currentFile.fileType = 'doc';
  //   }
  //   let filename = [];
  //   if (awsFilename) {
  //     filename = _.filter(filesArr, (file) => {
  //       if (file.fileUploadKey.includes(awsFilename)) {
  //         return file.fileUploadKey;
  //       }
  //     });
  //   } else {
  //     filename[0] = doc;
  //   }
  //
  //   if (filename.length > 0) {
  //     currentFile.fileName = environment.aws.bucketAccessRootPath + filename[0].fileUploadKey;
  //     const fileNumber = awsFilename.split('-');
  //     // ? if filename contains number, only then replace
  //     if (fileNumber[1]) {
  //       // ? replace '-1' ,'-2', etc in filename to '(1)', '(2)', etc
  //       // doc.fileName = doc.fileName.replace(/-/g, '(').replace(/\./g, ').');
  //     }
  //   }
  //   // ! bug patch:-
  //   // ? when uploaded a pdf in 'discharge-docs-checklist';
  //   // ? file name is '2020_12_14_changi general hospital_discharge_summary'
  //   // ? this 'changi general hospital' is the facilities name from admission.case.facilities;
  //   // ? when these facilities were hardcoded i.e. 'PEH, FPH, GPH, etc'; there was no error in opening the pdf
  //   // ? when these facilities were taken from super-admin; issue occurred;
  //   // ? hence adding this patch
  //   // ? this issue will not be present in future as it is fixed from respective 'discharge-docs-checklist' page
  //   else {
  //   currentFile.fileName = environment.aws.bucketAccessRootPath + doc.actualFilename;
  //   }
  //   if (this.isCancelled) {
  //     currentFile = null;
  //   }
  //   this.currentFile = currentFile;
  //   return this.currentFile;
  // }
  public openFile(doc: any, filesArr) {
    this.isCancelled = false;
    let awsFilename = '';
    if (doc.fileUploadKey) {
      awsFilename = doc.fileUploadKey;
    } else {
      awsFilename = doc.fileName;
    }
    let currentFile = {
      fileName: '',
      fileType: '',
      // showFileName: doc.fileName,
      showFileName: '',
    };
    // ! in discharge-docs-checklist page, not showing file names in left-container
    // ! hence assign showFileName here as doc does not contain 'fileName'
    // ? need showFileName to show file name in right-container of discharge-docs-checklist page
    currentFile.showFileName = doc.fileName
      ? doc.fileName.replace(/_/g, ' ')
      : doc.fileUploadKey.replace(/_/g, ' ');
    if (awsFilename && awsFilename.includes('pdf')) {
      currentFile.fileType = 'pdf';
    } else if (
      awsFilename &&
      (awsFilename.includes('jpeg') ||
        awsFilename.includes('jpg') ||
        awsFilename.includes('png') ||
        awsFilename.includes('JPEG') ||
        awsFilename.includes('JPG') ||
        awsFilename.includes('PNG') ||
        awsFilename.includes('_Orthopaedic_Image_') || awsFilename.includes(' Orthopaedic Image '))
      // tslint:disable-next-line: max-line-length
    ) {
      currentFile.fileType = 'image';
    } else if (awsFilename && awsFilename.includes('zip')) {
      currentFile.fileType = 'zip';
    } else {
      currentFile.fileType = 'doc';
    }
    currentFile.fileName =
      environment.aws.bucketAccessRootPath + doc.actualFilename;
    if (this.isCancelled) {
      currentFile = null;
    }
    this.currentFile = currentFile;
    return this.currentFile;
  }
  public async presentMsgAlertThenRoute(text: any, message, routeUrl) {
    const alert = await this.alertController.create({
      header: text,
      // subHeader: 'Subtitle',
      message,
      cssClass: 'alertDiv',
      buttons: [
        {
          text: 'OK',
          handler: () => {
            // user has clicked the alert button
            // begin the alert's dismiss transition
            const navTransition = alert.dismiss();
            navTransition.then(() => {
              this.routeChange(routeUrl);
            });
            return false;
          },
        },
      ],
    });
    await alert.present();
  }
  public async toastPresent(msg) {
    const toast = await this.toastController.create({
      message: msg,
      duration: 2000,
    });
    await toast.present();
  }
  public createOnline$() {
    return merge<boolean>(
      fromEvent(window, 'offline').pipe(map(() => false)),
      fromEvent(window, 'online').pipe(map(() => true)),
      new Observable((sub: Observer<boolean>) => {
        sub.next(navigator.onLine);
        sub.complete();
      })
    );
  }
  public presentReSignFormAlert(formName) {
    return new Promise(async (resolve) => {
      let mode = 'preview';
      this.alertController
        .create({
          header: 'Re-sign Form',
          message:
            formName +
            ' form is already previously signed, select yes if you wish to re-sign form.',
          cssClass: 'alertDiv',
          buttons: [
            {
              text: 'No',
              role: 'cancel',
              handler: () => {
                resolve(mode);
              },
            },
            {
              text: 'Yes',
              handler: () => {
                mode = 'edit';
                resolve(mode);
              },
            },
          ],
        })
        .then((alert) => {
          alert.present();
        });
    });
  }
  // set memo File details
  public setMemoFile(fileObj) {
    this.currentMemoObj = fileObj;
  }
  // set memo File details
  public getMemoFile() {
    return this.currentMemoObj;
  }
  // set memo File details
  public clearMemoFile() {
    this.currentMemoObj = {};
  }
  public openCaseApprovalTimelineSidebar() {
    this.menuCtrl.enable(true, 'case-status-timeline');
    this.menuCtrl.open('case-status-timeline').then(() => {
      this.isCaseApprovalSidebarOpen = true;
    });
  }
  public closeCaseApprovalTimelineSidebar() {
    if (this.isCaseApprovalSidebarOpen) {
      this.menuCtrl.close('case-status-timeline').then(() => {
        this.isCaseApprovalSidebarOpen = false;
      });
    }
  }
  public scrollDiv(elementId) {
    document
      .getElementById(elementId)
      .scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'start' });
    return;
  }
  public sortFiles(filesArr) {
    let allFilenames = [];
    allFilenames = filesArr.sort((a, b) => {
      const dateA = new Date(a.fileUploadDate);
      const dateB = new Date(b.fileUploadDate);
      if (dateA > dateB) {
        const nameA = a.fileName;
        const nameB = b.fileName;
        if (nameA > nameB) {
          return 1;
        } else {
          return -1;
        }
      } else {
        return -1;
      }
    });
    return allFilenames;
  }
  public setFolderName(folderName) {
    sessionStorage.setItem('folderName', folderName);
  }
  public getFolderName() {
    return sessionStorage.getItem('folderName');
  }
  public setAwsBucketPath(path) {
    sessionStorage.setItem('awsBucketPath', path);
  }
  public getAwsBucketPath() {
    return sessionStorage.getItem('awsBucketPath');
  }
  public formatDateAndMonth(date) {
    date = new Date(date);
    let hh = date.getHours();
    let mm = date.getMinutes();
    let dd = date.getDate();
    const M = date.toDateString().substr(4, 3);
    dd = dd < 10 ? '0' + dd : dd;
    mm = mm < 10 ? '0' + mm : mm;
    hh = hh < 10 ? '0' + hh : hh;
    const yyyy = date.getFullYear();
    const newDate = dd + ' ' + M + ' ' + yyyy + '/' + hh + ':' + mm;
    return newDate;
  }
  setAllSurgicalCodes(allcodes) {
    this.allSurgicalCodes = allcodes;
  }
  getAllSurgicalCodes() {
    return this.allSurgicalCodes;
  }
  setPathForLoe(path) {
    sessionStorage.setItem('pathForLoe', path);
  }
  getPathForLoe() {
    return sessionStorage.getItem('pathForLoe');
  }
  setCaseList(caselist) {
    sessionStorage.setItem('caseList', JSON.stringify(caselist));
  }
  getCaseList() {
    return JSON.parse(sessionStorage.getItem('caseList'));
  }
  public async getLatestCase(clientId) {
    return new Promise(async (resolve) => {
      this.firebase.getAllCasesFromId(clientId).subscribe(
        (resp) => {
          let data = [];
          if (resp.size === 1) {
            this.isFirstCase = true;
          } else {
            this.isFirstCase = false;
          }
          resp.docs.forEach((element) => {
            const temp: any = element.data();
            data.push(temp);
          });
          data = _.orderBy(
            data,
            [(user) => user.lastUpdateTimestamp],
            ['desc']
          );
          const selectedCase = this.getSelectedCase();
          if (data[0].id === selectedCase.id) {
            this.isLatestCase = true;
          } else {
            this.isLatestCase = false;
          }

          resolve({
            isFirstCase: this.isFirstCase,
            isLatestCase: this.isLatestCase,
          });
        },
        (error) => {
          // reject('');
        }
      );
    });
  }
  setAddOfflineClient(val) {
    sessionStorage.setItem('addOfflineClient', val);
    this.addOfflineClient = val;
  }
  getAddOfflineClient() {
    this.addOfflineClient = sessionStorage.getItem('addOfflineClient');
    return this.addOfflineClient;
  }
  searchFromDropdownList(array, nameToSearch, key1, key2?) {
    nameToSearch = nameToSearch.trim().replace(/\s\s+/g, ' ');
    array.forEach((element) => {
      element.show = false;
      if (key2) {
        if (element[key1].toLowerCase().includes(nameToSearch.toLowerCase()) || element[key2].toLowerCase().includes(nameToSearch.toLowerCase()) || nameToSearch === '') {
          element.show = true;
        }
      } else {
        if (element[key1].toLowerCase().includes(nameToSearch.toLowerCase()) || nameToSearch === '') {
          element.show = true;
        }
      }
    });
    return array;
  }
  enterValue(event) {
    event.stopPropagation();
  }
  setFileTransferRef(param) {
    this.fileTransfer = param;
  }
  getFileTransferRef() {
    return this.fileTransfer;
  }
  setMedicalCondition(condition) {
    this.medicalCondition = condition;
  }
  getMedicalCondition() {
    return this.medicalCondition;
  }
}
