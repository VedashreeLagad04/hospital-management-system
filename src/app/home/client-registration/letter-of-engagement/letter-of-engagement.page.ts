import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import * as _ from 'lodash';
import { AppDataService } from 'src/app/services/app-data.service';
import { FirebaseService } from 'src/app/services/firebase.service';
import { environment } from 'src/environments/environment';
import { ClientRegistrationTermsModalPage } from '../client-registration-terms-modal/client-registration-terms-modal.page';
@Component({
  selector: 'app-letter-of-engagement',
  templateUrl: './letter-of-engagement.page.html',
  styleUrls: ['./letter-of-engagement.page.scss'],
})
export class LetterOfEngagementPage implements OnInit {
  public editPage = false;
  public editMode = false;
  public isCommonEhealthDataPresent = false;
  public privacyPolicy;
  public user: any = [];
  public commonEhealthData: any = {
    activePolicies: [],
    medicalHistory: [],
    clientId: '',
  }
  public date;
  public today;
  public loggedinUser;
  public focusInFlag = false;
  public loeSignature: any = {
    name: '',
    nric: '',
    relation: '',
    signature: '',
    date: '',
    time: ''
  };
  public isSignatureBoxClicked = false;
  public newCase: any = {
    clientId: '',
    assignTo: [],
    caseNumber: '',
    name: '',
    type: 'Normal',
    description: '',
    caseStatus: [],
    currentStatus: 'Pending',
    referralSource: '',
    referrer: '',
  };
  public clientDetails: any = {};
  public clientId: any;
  public activeRouteSubscriber: any;
  public isNextBtnClicked = false;
  constructor(private dataService: AppDataService,
    private router: Router, private modalController: ModalController,
    private activeRoute: ActivatedRoute,
    private firebase: FirebaseService) { }
  public ngOnInit() {
  }
  public ionViewDidEnter() {
    this.activeRouteSubscriber = this.activeRoute.paramMap.subscribe((params) => {
      this.clientId = params.get('id');
      this.dataService.present().then((a) => {
        a.present();
        this.newCase = {
          clientId: '',
          assignTo: [],
          caseNumber: '',
          name: '',
          type: 'Normal',
          description: '',
          caseStatus: [],
          currentStatus: 'Pending',
          referralSource: '',
          referrer: '',
        };
        // ? get back navigation path from service
        const path = this.dataService.getPathForLoe();
        this.isSignatureBoxClicked = false;
        this.date = new Date();
        const obj = {
          title: 'Letter of Engagement',
          backPage: path,
        };
        this.loeSignature = {
          name: '',
          nric: '',
          relation: '',
          signature: '',
          date: '',
          time: ''
        };
        this.privacyPolicy = false;
        this.focusInFlag = false;
        this.dataService.setHeaderTitle(obj);
        this.firebase.getUserDetails(this.clientId).subscribe((data) => {
          let temp;
          temp = data.data();
          temp.id = data.id;
          this.clientDetails = temp;
          this.clientDetails.id = data.id;
          this.dataService.setPatientData(this.clientDetails);
          this.dataService.dismiss();
        }, (error) => {
          this.dataService.dismiss();
        });
        this.user = this.dataService.getRegistrationData();
        this.today = this.dataService.formatMonth(this.date);
        this.loggedinUser = this.dataService.getUserData();
      });
    });
  }
  public async goToNextPage() {
    if (this.user.name !== undefined || this.user.nric !== undefined) {
      if (this.privacyPolicy === true) {
        this.router.navigate(['/letter-of-consent/client']);
      } else {
        this.dataService.presentAlert('Please agree to Preimium Care Privacy Policy');
      }
    } else {
      this.dataService.routeChange('client-list/' + this.loggedinUser.id);
    }
  }
  public checkScroll(event) {
    if (event.target.offsetHeight + event.target.scrollTop >= event.target.scrollHeight) {
      this.focusInFlag = true;
      this.privacyPolicy = true;
    }
  }
  checkClientTypeAndThenAgreeToPolicy(policy) {
    const clientType = this.dataService.getAddOfflineClient();
    if (clientType === 'offline') {
      this.agreeToPolicyWithoutSign(policy);
    } else {
      this.agreedToPolicyWithSign(policy);
    }
  }
  public agreedToPolicyWithSign(policy) {
    this.isNextBtnClicked = true;
    if (policy) {
      if (this.loeSignature.signature != '') {
        this.createNewCase();
      } else {
        this.isNextBtnClicked = false;
        this.dataService.presentAlert('Please sign Letter Of Engagement!');
      }
    } else {
      this.isNextBtnClicked = false;
      if (this.isSignatureBoxClicked) {
        this.dataService.presentAlert('Please sign Letter Of Engagement!');
      } else {
        this.dataService.presentAlert('Please agree to Premium Care Letter Of Engagement!');
      }
    }
  }
  public agreeToPolicyWithoutSign(policy) {
    this.isNextBtnClicked = true;
    if (policy) {
      this.createNewCase();
    } else {
      this.isNextBtnClicked = false;
      this.dataService.presentAlert('Please agree to Premium Care Letter Of Engagement!');
    }
  }
  public createNewCase() {
    this.dataService.present().then((loader) => {
      loader.present();
      this.date = this.date.toString();
      this.newCase.clientId = this.clientDetails.id || this.clientId;
      this.newCase.lastUpdateDate = this.date;
      this.newCase.lastUpdateTimestamp = new Date(this.date).getTime();
      this.newCase.createdDate = this.date;
      this.newCase.caseFolders = {
        admission: this.date,
        discharge: this.date,
        invoices: this.date,
        medicalReport: this.date,
        claims: this.date,
        chatArchive: this.date,
      };
      this.newCase.dischargeDocsChecklistCheckbox = {
        dischargeSummary: false,
        interimBill: false,
        hospitalisationLeave: false,
        medicalReport: false,
      };
      let agentId = '';
      if (_.size(this.user) > 0 && this.user.assignedToAgentId) {
        agentId = this.user.assignedToAgentId;
        // agentId = this.user.createdByAgentId;
      } else {
        agentId = this.clientDetails.assignedToAgentId;     // ? primary consultant
        // agentId = this.clientDetails.createdByAgentId;
      }
      this.newCase.assignTo.push(agentId);
      this.newCase.primaryConsultant = _.cloneDeep(agentId);
      this.firebase.getCommonEheallthData(this.clientId).subscribe((resp) => {
        if (resp.size === 0) {
          this.isCommonEhealthDataPresent = false;
          this.commonEhealthData = {
            activePolicies: [],
            medicalHistory: [],
            clientId: this.clientId,
          }
        } else {
          this.isCommonEhealthDataPresent = true;
          this.commonEhealthData = resp.docs[0].data();
          this.commonEhealthData.id = resp.docs[0].id;
          console.log('this.commonEhealthData: ', this.commonEhealthData);
        }
      });
      // ! auto-generate caseNumber
      this.firebase.getLastCaseNumber().then(
        (result) => {
          this.newCase.caseNumber = result;
          this.firebase.addCase(this.newCase).then((resp) => {
            if (resp.id) {
              this.newCase.id = resp.id;
              this.createCaseDetails(this.newCase);
            } else {
              this.dataService.dismiss();
              this.dataService.presentAlert('Couldn\'t create case. Try again!');
            }
          });
        }).catch((error) => {
          this.isNextBtnClicked = false;
          this.dataService.dismiss();
          this.dataService.presentAlert('Couldn\'t create case. Try again!');
        });
    });
  }
  public createCaseDetails(caseData) {
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
    };
    this.firebase.addMedicalDoc(medicalCondition).then((resp) => {
      if (resp.id) {
        if (!this.clientDetails.homeContactNo) {
          this.clientDetails.homeContactNo = '';
        }
        let booklet: any = {
          caseId: caseData.id,
          profile: this.clientDetails,
          activePolicies: this.commonEhealthData.activePolicies,
          insuranceDocs: [],
          consultationMemo: [],
          medicalConditionId: resp.id,
          preExistingCondition: this.commonEhealthData.medicalHistory,
          preAdmissionChecklist: [],
          travelDeclaration: {
            abroadTravel: {
              answer: '',
              country: '',
              date: '',
            },
            flu: {
              answer: '',
              symptoms: '',
            },
            covid19: {
              contact: '',
              covidCluster: '',
              governmentOrder: '',
            },
            middleEastTravel: {
              answer: '',
              country: '',
              date: '',
            },
            middleEastContact: {
              answer: '',
              country: '',
            },
            travelVaccination: {
              answer: '',
              vaccines: [{
                showVaccineDropdown: false,
                type: '',
                date: '',
              },
              ],
            },
            remarks: '',
            pdfFiles: [],
          },
          caseSubmission: {},
          letterOfConsent: {},
          preview: {
            signatureFlag: false,
            profile: this.clientDetails,
            case: caseData,
            caseSubmission: {},
            activePolicies: this.commonEhealthData.activePolicies,
            preAdmissionChecklist: [],
            preExistingCondition: this.commonEhealthData.medicalHistory,
            MedicalConditions: {
              orthopaedic: medicalCondition.orthopaedic,
              gastroenterology: medicalCondition.gastroenterology,
              cardiology: medicalCondition.cardiology,
              gynaecology: medicalCondition.gynaecology,
              urology: medicalCondition.urology,
              ent: medicalCondition.ent,
              general: medicalCondition.general,
              respiratory: medicalCondition.respiratory,
            },
            pdfFiles: [],
          },
          checkboxValue: {
            profileTab: false,
            caseTab: false,
            activePoliciesTab: this.commonEhealthData.activePolicies.length == 0 ? false : true,
            insuranceDocsTab: false,
            preExtgConditionTab: this.commonEhealthData.medicalHistory.length == 0 ? false : true,
            MedicalConditionTab: false,
            preAdmChecklistTab: false,
            previewTab: false,
            caseSubmissionTab: false,
            letterOfConsentTab: false,
            travelDeclarationTab: false,
            medicalConditionTab: false,
            generalTab: false,
            gastroTab: false,
            cardioTab: false,
            entTab: false,
            uroTab: false,
            gynoTab: false,
            respiratoryTab: false,
            orthoTab: false,
          },
        };
        // tslint:disable-next-line: no-shadowed-variable
        this.firebase.addEhealthBooklet(booklet).then(async (resp) => {
          if (resp.id) {
            this.dataService.dismiss();
            this.dataService.setSelectedCase(this.newCase);
            booklet.id = resp.id;
            this.dataService.setEhealthData(booklet);
            const response: any = await this.dataService.getLatestCase(this.clientId);
            if (response.isFirstCase && !this.isCommonEhealthDataPresent) {
              this.firebase.addCommonEhealthData(this.commonEhealthData).then((resp) => {
                if (resp.id) {
                  this.commonEhealthData.id = resp.id;
                }
                this.exportPdf();
              })
            } else {
              this.exportPdf();
            }
          } else {
            this.dataService.dismiss();
            this.isNextBtnClicked = false;
            this.dataService.presentAlert('Couldn\'t create case. Try again!');
          }
        });
      }
    }).catch((err) => {
      this.dataService.dismiss();
      this.isNextBtnClicked = false;
      this.dataService.presentAlert('Couldn\'t create case. Try again!');
    });
  }
  public hideLoaderSetCaseAndRoute() {
    this.dataService.setSelectedCase(this.newCase);
    this.isNextBtnClicked = false;
    this.dataService.routeChange('/e-health-booklet/case/' + this.newCase.clientId);
  }
  public exportPdf() {
    const pageName = 'PCARE_LOE';
    // tslint:disable-next-line: max-line-length
    this.dataService.exportPdf('loe-pdf-wrap', this.clientDetails.name, environment.aws.bucketAdmissionDocumentsPath, pageName, this.clientId, this.newCase.id, '', null).then((resp) => {
      const response: any = resp;
      if (response.status === 'success') {
        const timelineStatus: any = {
          date: this.date.toString(),
          activity: 'Case Created',
          userType: this.loggedinUser.type,
          userId: this.loggedinUser.id,
          caseId: this.newCase.id,
        };
        this.dataService.updateTimelineData(timelineStatus, this.newCase.clientId);
        this.hideLoaderSetCaseAndRoute();
      } else {
      }
    }).catch((err) => {
      this.isNextBtnClicked = false;
      this.dataService.presentAlert('Couldn\'t create pdf. Try again!');
    });
  }
  public async takeConsent() {
    let consentDetails: any = {
      name: '',
      relation: '',
      nric: '',
    };
    if (!this.clientDetails.guardian) {
      consentDetails.name = this.clientDetails.name;
      consentDetails.relation = 'self';
      this.loeSignature.name = this.clientDetails.name;
      this.loeSignature.nric = '';
      this.openSignatureModal();
    } else {
      if (this.clientDetails.name !== undefined || this.clientDetails.nric !== undefined) {
        const modalPage = await this.modalController.create({
          component: ClientRegistrationTermsModalPage,
          backdropDismiss: false,
          cssClass: 'termsNconditions-modal',
          componentProps: {
            user: this.clientDetails,
            mode: 'engagement',
          },
        });
        modalPage.onDidDismiss().then((data) => {
          if (data.data.data) {
            consentDetails = data.data.data;
            this.loeSignature.name = consentDetails.name;
            this.loeSignature.relation = consentDetails.relation === 'Guardian' ? consentDetails.guardianRelation : consentDetails.relation;
            this.openSignatureModal();
          }
        });
        modalPage.present();
      }
    }
  }
  public openSignatureModal() {
    this.dataService.signatureModal(null).then((resp) => {
      const response: any = resp;
      if (response.status === 'success') {
        this.isSignatureBoxClicked = true;
        this.loeSignature.signature = response.signature;
        let date;
        date = new Date();
        const today = this.dataService.formatDateAndMonth(date);
        this.loeSignature.date = today.split('/')[0];
        this.loeSignature.time = today.split('/')[1];
      } else {
        this.loeSignature.signature = '';
      }
    });
  }
  public ionViewDidLeave() {
    document.getElementById('eventScroll').scrollTop = 0;
    this.activeRouteSubscriber.unsubscribe();
  }
}
