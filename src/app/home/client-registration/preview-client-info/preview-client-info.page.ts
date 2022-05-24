/* eslint-disable max-len */
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AppDataService } from 'src/app/services/app-data.service';
import { FirebaseService } from 'src/app/services/firebase.service';
import { environment } from 'src/environments/environment';
@Component({
  selector: 'app-preview-client-info',
  templateUrl: './preview-client-info.page.html',
  styleUrls: ['./preview-client-info.page.scss'],
})
export class PreviewClientInfoPage implements OnInit {
  public loggedInuser: any;
  public user: any;
  public clientDetails: any = {};
  public pdfFileName;
  public pdfFileDate;
  public isNextBtnClicked = false;
  constructor(private activeRoute: ActivatedRoute, private firebase: FirebaseService, private dataService: AppDataService) { }
  public ngOnInit() {
    this.loggedInuser = this.dataService.getUserData();
    const obj = {
      title: 'Preview Client Info',
      backPage: 'client-registration/-1',
    };
    this.dataService.setHeaderTitle(obj);
    this.user = this.dataService.getRegistrationData();
    console.log('this.user in preview client info: ', this.user);
  }
  // add new client
  public submitRegistration() {
    this.isNextBtnClicked = true;
    console.log('next button clicked and hidden');
    this.dataService.present().then((a) => {
      a.present();
      this.setStaticDetails().then(
        (result) => {
          console.log('now add user');
          this.addUser();
        },
        (error) => {
          this.isNextBtnClicked = false;
        },
      );
    });
  }
  public setStaticDetails() {
    let tempId;
    return new Promise((resolve, reject) => {
      this.user.type = 'client';
      this.user.currentStatus = 'Verified';
      this.user.createdByAgentId = this.loggedInuser.id;
      this.user.assignedToAgentId = this.loggedInuser.id;
      this.user.assignedTo.push(this.loggedInuser.id);
      this.user.countryCode = '+65';
      this.user.password = this.user.name.split(' ')[0] + '123';
      this.user.accountCreatedDate = new Date().toString();
      this.firebase.getLastAccountId().then(
        (result) => {
          tempId = result;
          this.user.accountId = tempId;
          console.log('last account id in preview client info', this.user.accountId);
          resolve(this.user);
        }, // shows "done!" after 1 second
        (error) => {
          reject(error);
        });
    });
  }
  public addUser() {
    if (this.user.length !== 0) {
      delete this.user.addressExist;
      if (this.user.nationality !== 'foreigner') {
        console.log('check nric');
        this.firebase.isTypeAlreadyPresent('nric', this.user.nric).subscribe((resp) => {      // ? check if user is already added
          console.log('nric resp', resp);
          if (resp.size === 0) {
            this.addUserToDb();
          } else {
            this.dataService.dismiss();
            this.dataService.presentAlert('Client already registered!');
          }
        });
      } else {
        console.log('check foreignId');
        this.firebase.isTypeAlreadyPresent('foreignId', this.user.foreignId).subscribe((resp) => {      // ? check if user is already added
          console.log('foreignId resp', resp);
          if (resp.size === 0) {
            this.addUserToDb();
          } else {
            this.dataService.dismiss();
            this.dataService.presentAlert('Client already registered!');
          }
        });
      }
    }
  }
  addUserToDb() {
    console.log('before addUser query');
    this.firebase.addUser(this.user).then((accountCreatedResult) => {
      console.log('after addUser query');
      if (accountCreatedResult.id) {
        this.user.id = accountCreatedResult.id;
        console.log('before exportpdf');
        this.exportPdf(accountCreatedResult);
      } else {
        this.isNextBtnClicked = false;
        this.dataService.dismiss();
        this.dataService.presentAlert('Something went wrong! Please try again');
      }
    }).catch((err) => {
      console.log('in catch of firebase.addUser()', err);
      this.isNextBtnClicked = false;
      this.dataService.dismiss();
      this.dataService.presentAlert('Client is not registered! Please try again...!');
    });
  }
  public createClientDetails(id) {
    this.dataService.present().then((a) => {
      a.present();
      const temptimeline: any = {};
      this.clientDetails.clientId = id;
      this.clientDetails.personalParticular = [];
      this.clientDetails.timeline = [];
      console.log('creating timeline');
      this.firebase.addClientDetails(this.clientDetails).then((resp) => {
        if (resp.id) {
          console.log('after creating timeline');
          // ? set back navigation route to session
          this.dataService.setPathForLoe('client-registration/-1');
          const route = '/letter-of-engagement/' + this.clientDetails.clientId;
          const data = 'Client Profile Created!';
          const msg = 'Client profile has been successfully created, please proceed to case creation.';
          this.dataService.dismiss();
          this.isNextBtnClicked = false;
          this.dataService.clearRegistrationData();
          this.dataService.presentMsgAlertThenRoute(data, msg, route);
        } else {
          this.isNextBtnClicked = false;
          this.dataService.dismiss();
          this.dataService.presentAlert('Couldn\'t add client details!');
        }
      });
    });
  }
  public exportPdf(accountCreatedResult) {
    this.dataService.dismiss();
    // ? generate pdf
    const pageName = 'Client_Information_Sheet';
    this.dataService.exportPdf('preview-client-info-pdf-wrap', this.user.name, environment.aws.bucketPersonalParticularsPath, pageName, this.user.id, this.user.caseId, this.pdfFileName, this.pdfFileDate).then((resp) => {
      const response: any = resp;
      console.log('after exportPdf', response);
      if (response.status === 'success') {
        this.createClientDetails(accountCreatedResult.id);
      }
    }).catch((err) => {
      console.log('catch of exportPdf', err);
      this.isNextBtnClicked = false;
      this.dataService.presentAlert('Couldn\'t create pdf. Try again!');
    });
  }
  public takeConsent() {
    this.dataService.signatureModal(this.user.consentDetails.signature).then((resp) => {
      const response: any = resp;
      if (response.status === 'success') {
        const date = new Date();
        const today = this.dataService.formatDateAndMonth(date);
        this.user.consentDetails.signature = response.signature;
        this.user.consentDetails.date = today.split('/')[0];
        this.user.consentDetails.time = today.split('/')[1];
      } else {
        this.user.consentDetails.signature = '';
      }
    });
  }
}
