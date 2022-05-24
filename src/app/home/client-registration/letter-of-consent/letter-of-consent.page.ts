import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { AppDataService } from 'src/app/services/app-data.service';
import { FirebaseService } from 'src/app/services/firebase.service';
import { ClientRegistrationTermsModalPage } from '../client-registration-terms-modal/client-registration-terms-modal.page';
@Component({
  selector: 'app-letter-of-consent',
  templateUrl: './letter-of-consent.page.html',
  styleUrls: ['./letter-of-consent.page.scss'],
})
export class LetterOfConsentPage implements OnInit {
  other;
  public user: any = [];
  public clientDetails: any = {};
  public consentDetails: any = {
    name: '',
    nric: '',
    authoriser: 'patient',
    relation: '',
    request: {
      discharge: true,
      labrResult: true,
      certificate: true,
      others: true,
    },
    purpose: {
      care: true,
      insurance: true,
      legal: true,
      others: true,
    },
    authoriserName: '',
    authoriserNric: '',
    sign: '',
  };
  public consentAccepted = false;
  public consent: any = [];
  public loggedinUser: any;
  public consentType: string;
  case: any = {};
  constructor(private dataService: AppDataService, private router: Router,
    private modalController: ModalController,
    private firebase: FirebaseService,
    private activeRoute: ActivatedRoute,) { }
  public ngOnInit() {
  }
  public ionViewDidEnter() {
    this.activeRoute.paramMap.subscribe((params) => {
      this.consentType = params.get('type');
      if (this.consentType === 'client') {
        const obj = {
          title: 'Letter of Consent',
          backPage: '/client-registration/-1',
        };
        this.dataService.setHeaderTitle(obj);
        this.user = this.dataService.getRegistrationData();
        if (this.user.consentDetails && this.user.consentDetails.sign.length !== 0) {
          this.consentDetails = this.user.consentDetails;
          this.consentAccepted = true;
        }
      } else if (this.consentType === 'case') {
        this.case = this.dataService.getNewCase();
        if (this.case.consentDetails && this.case.consentDetails.sign.length !== 0) {
          this.consentDetails = this.case.consentDetails;
          this.consentAccepted = true;
        }
        const obj = {
          title: 'Letter of Consent',
          backPage: '/client-case-add/' + this.case.clientId + '/-1',
        };
        this.dataService.setHeaderTitle(obj);
        this.firebase.getUserDetails(this.case.clientId).subscribe(data => {
          this.user = data.data();
          this.user.id = data.id;
        });
      }
      this.loggedinUser = this.dataService.getUserData();
    });
  }
  public async goToConfirm() {
    if (this.user.name !== undefined || this.user.nric !== undefined) {
      this.consentDetails.name = this.user.name;
      this.consentDetails.nric = this.user.nric;
      const modalPage = await this.modalController.create({
        component: ClientRegistrationTermsModalPage,
        backdropDismiss: false,
        cssClass: 'termsNconditions-modal',
        componentProps: {
          user: this.user,
          mode: 'engagement',
          consentDetails: this.consentDetails,
          type: this.consentType
        },
      });
      modalPage.onDidDismiss().then((detail) => {
        if (detail.data.data !== undefined) {
          if (detail.data.data.sign.length !== 0) {
            this.consentDetails = detail.data.data;
            this.consentAccepted = true;
            let temp = {};
            if (this.consentDetails.authoriser === 'patient') {
              temp = {
                sign: this.consentDetails.sign,
                name: this.consentDetails.name,
                nric: this.consentDetails.nric,
                request: this.consentDetails.request,
                purpose: this.consentDetails.purpose,
                signingPerson: 'patient'
              };
            } else if (this.consentDetails.authoriser === 'other') {
              temp = {
                sign: this.consentDetails.sign,
                name: this.consentDetails.authoriserName,
                nric: this.consentDetails.authoriserNric,
                signingPerson: this.consentDetails.relation,
                request: this.consentDetails.request,
                purpose: this.consentDetails.purpose,
              };
            }
            this.consentDetails = temp;
            if (this.consentType === 'client') {
              this.user.consentDetails = temp;
              this.dataService.setRegistrationData(this.user);
            } else {
              this.case.consentDetails = temp;
              this.dataService.setNewCase(this.case);
            }
          }
        }
      });
      modalPage.present();
    } else {
      this.dataService.routeChange('client-list/' + this.loggedinUser.id);
    }
  }
  public setStaticDetails() {
    let tempId;
    return new Promise((resolve, reject) => {
      this.user.type = 'client';
      this.user.currentStatus = 'Verified';
      this.user.createdByAgentId = this.loggedinUser.id;
      this.user.assignedToAgentId = this.loggedinUser.id;
      this.user.countryCode = '+65';
      this.user.password = this.user.name.split(' ')[0] + '123';
      this.user.accountCreatedDate = new Date();
      this.firebase.getLastAccountId().then(
        (result) => {
          tempId = result,
            this.user.accountId = tempId;
          resolve(this.user);
        }, // shows "done!" after 1 second
        (error) => {
          reject(error);
        });
    });
  }
  public addUser() {
    if (this.user.length !== 0) {
      this.firebase.addUser(this.user).then((accountCreatedResult) => {
        if (accountCreatedResult.id) {
          this.createClientDetails(accountCreatedResult.id);
          this.dataService.clearRegistrationData();
        } else {
          this.dataService.dismiss();
          // this.addStatus = 'Something went wrong! PLease try again';
          // this.dismiss();
          this.dataService.presentAlert('Something went wrong! PLease try again');
        }
      }, (err) => {
        this.dataService.dismiss();
        // this.addStatus = 'Client is not registered! Please try again...!';
        // this.dismiss();
        this.dataService.presentAlert('Client is not registered! Please try again...!');
      });
    }
  }
  public createClientDetails(id) {
    const temptimeline: any = {};
    this.clientDetails.clientId = id;
    this.clientDetails.personalParticular = [];
    this.clientDetails.timeline = [];
    this.firebase.addClientDetails(this.clientDetails).then((resp) => {
      if (resp.id) {
        const route = 'client-profile/' + this.clientDetails.clientId;
        const data = 'Client added successfully!';
        this.dataService.presentAlertThenRoute(data, route);
        this.dataService.dismiss();
      }
    });
  }
  // add new client
  public submitRegistration() {
    this.dataService.present().then((a) => {
      a.present();
      // if (this.checkbox === true) {
      this.setStaticDetails().then(
        (result) => {
          this.addUser();
        },
        (error) => { },
      );
      // } else {
      //   this.dataService.dismiss();
      //   this.dataService.presentAlert('Please accept terms and conditions to proceed');
      // }
    });
  }
  createCase() {
    this.dataService.present().then(loader => {
      loader.present();
      const date = new Date();
      this.consentDetails = this.case.consentDetails;
      delete this.case.consentDetails;
      this.case.lastUpdateDate = date;
      this.case.lastUpdateTimestamp = new Date(date).getTime();
      this.case.createdDate = date;
      this.firebase.addCase(this.case).then(resp => {
        if (resp.id) {
          this.case.id = resp.id;
          this.createCaseDetails(this.case);
          this.consentDetails.date = date;
          this.consentDetails.caseId = resp.id;
          this.consentDetails.clientId = this.case.clientId;
          this.firebase.addConsentDoc(this.consentDetails).then(() => {
            this.dataService.clearNewCase();
            const timelineStatus: any = {
              date: date,
              activity: 'Case Created',
              userType: this.loggedinUser.type,
              userId: this.loggedinUser.id,
              caseId: this.case.id
            };
            this.dataService.updateTimelineData(timelineStatus, this.case.clientId);
            this.hideLoaderShowAlertAndRoute("Case added successfully!");
          });
        }
      });
    });
  }
  createCaseDetails(caseData) {
    const medicalCondition = {
      caseId: caseData.id,
      gastroenterology: {},
      orthopaedic: {},
      cardiology: {},
      gynaecology: {},
      urology: {},
      ent: {},
      respiratory: {},
      general: {},
    }
    this.firebase.addMedicalDoc(medicalCondition).then(resp => {
      if (resp.id) {
        if (!this.user.homeContactNo) {
          this.user.homeContactNo = '';
        }
        const booklet = {
          caseId: caseData.id,
          profile: this.user,
          activePolicies: [],
          insuranceDoc: [],
          medicalConditionId: resp.id,
          preExistingCondition: [],
          TravelDeclaration: [],
          signature: [],
          caseSubmission: {}
        }
        this.firebase.addEhealthBooklet(booklet).then(resp => {
        });
      }
    });
  }
  hideLoaderAndShowAlert(alertMsg) {
    this.dataService.dismiss();
    this.dataService.presentAlert(alertMsg);
  }
  hideLoaderShowAlertAndRoute(alertMsg) {
    this.dataService.dismiss();
    this.dataService.presentAlertThenRoute(alertMsg, '/client-case-list/' + this.case.clientId);
  }
}
