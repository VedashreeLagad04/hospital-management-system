import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { MenuController } from '@ionic/angular';
import * as _ from 'lodash';
import { AppDataService } from 'src/app/services/app-data.service';
import { FirebaseService } from 'src/app/services/firebase.service';
@Component({
  selector: 'app-e-health-booklet',
  templateUrl: './e-health-booklet.page.html',
  styleUrls: ['./e-health-booklet.page.scss'],
})
export class EHealthBookletPage implements OnInit {
  public data: any = {};
  public checkboxValue: any = {
    profileTab: false,
    caseTab: false,
    activePoliciesTab: false,
    insuranceDocsTab: false,
    preExtgConditionTab: false,
    MedicalConditionTab: false,
    preAdmChecklistTab: false,
    previewTab: false,
    caseSubmissionTab: false,
    letterOfConsentTab: false,
    travelDeclarationTab: false,
    generalTab: false,
    gastroTab: false,
    cardioTab: false,
    entTab: false,
    uroTab: false,
    gynoTab: false,
    respiratoryTab: false,
    orthoTab: false,
  };
  public docId = '';
  public healthbookStep1 = true;
  public healthbookStep2 = false;
  public clientId: string;
  public clientDetails: any;
  public healthBookUpdate;
  public mode = 'disabled';
  public loggedInUser: any;
  public date = new Date().toISOString();
  public today = this.date.split('T')[0];
  public skipTag;
  public tab: string;
  public case: any;
  public activeTab;
  public ehealth: any = {};
  public MedicalConditions;
  public medicalTab = false;
  constructor(private router: Router, private activeRoute: ActivatedRoute,
    private firebase: FirebaseService,
    private dataService: AppDataService,
    private menuCtrl: MenuController) {
    // this.loggedInUser = this.dataService.getUserData();
    // 
    router.events.subscribe((val: NavigationEnd) => {
      if (val instanceof NavigationEnd) {
        this.medicalTab = false;
        if (this.router.url.split('/')[2] === 'medical-condition') {
          this.clientId = this.router.url.split('/')[4];
          this.medicalTab = true;
          if (this.router.url.indexOf('gastroenterology') > -1) {
            this.activeTab = 'gastroenterology';
          } else if (this.router.url.indexOf('orthopaedic') > -1) {
            this.activeTab = 'orthopaedic';
          } else if (this.router.url.indexOf('cardiology') > -1) {
            this.activeTab = 'cardiology';
          } else if (this.router.url.indexOf('gynaecology') > -1) {
            this.activeTab = 'gynaecology';
          } else if (this.router.url.indexOf('urology') > -1) {
            this.activeTab = 'urology';
          } else if (this.router.url.indexOf('ent') > -1) {
            this.activeTab = 'ent';
          } else if (this.router.url.indexOf('respiratory') > -1) {
            this.activeTab = 'respiratory';
          } else if (this.router.url.indexOf('general') > -1) {
            this.activeTab = 'general';
          }
        } else {
          this.clientId = this.router.url.split('/')[3];
        }
        if (this.router.url.indexOf('profile') > -1) {
          this.activeTab = 'profile';
        } else if (this.router.url.indexOf('case') > -1) {
          this.activeTab = 'case';
        } else if (this.router.url.indexOf('refferrer') > -1) {
          this.activeTab = 'refferrer';
        } else if (this.router.url.indexOf('active-policies') > -1) {
          this.activeTab = 'policies';
        } else if (this.router.url.indexOf('acknowledgement') > -1) {
          this.activeTab = 'acknowledgement';
        } else if (this.router.url.indexOf('travel-declaration') > -1) {
          this.activeTab = 'travel';
        } else if (this.router.url.indexOf('administration') > -1) {
          this.activeTab = 'administration';
        } else if (this.router.url.indexOf('consultation-memo') > -1) {
          this.activeTab = 'consultationMemo';
        } else if (this.router.url.indexOf('preview') > -1) {
          this.activeTab = 'preview';
        } else if (this.router.url.indexOf('export-info') > -1) {
          this.activeTab = 'export-info';
        } else if (this.router.url.indexOf('pre-admission-checklist') > -1) {
          this.activeTab = 'preadmission';
        } else if (this.router.url.indexOf('insurance-docs') > -1) {
          this.activeTab = 'insurance-docs';
        } else if (this.router.url.indexOf('letter-of-consent') > -1) {
          this.activeTab = 'letter-of-consent';
        }
        if (this.router.url.indexOf('case-submission') > -1) {
          this.activeTab = 'submission';
        }
        if (this.router.url.indexOf('status-resubmission') > -1) {
          this.activeTab = 'statusResubmission';
        }
        if (this.router.url.indexOf('case-approval') > -1) {
          this.activeTab = 'approval';
        }
        if (this.router.url.indexOf('approval-preview') > -1) {
          this.activeTab = 'approval-preview';
        }
        if (this.router.url.indexOf('medical-history') > -1) {
          this.activeTab = 'medical-history';
        }
      }
    });
    dataService.subscribeCheckboxValue.subscribe((value) => {
      if (value.tabName === 'profile') {
        this.ehealth.checkboxValue.profileTab = value.value;
      } else if (value.tabName === 'case') {
        this.ehealth.checkboxValue.caseTab = value.value;
      } else if (value.tabName === 'active-policies') {
        this.ehealth.checkboxValue.activePoliciesTab = value.value;
      } else if (value.tabName === 'insurance-docs') {
        this.ehealth.checkboxValue.insuranceDocsTab = value.value;
      } else if (value.tabName === 'medical-history') {
        this.ehealth.checkboxValue.preExtgConditionTab = value.value;
      } else if (value.tabName === 'medical-condition') {
        this.checkboxValue.caseTab = value.value;
      } else if (value.tabName === 'pre-admission-checklist') {
        this.ehealth.checkboxValue.preAdmChecklistTab = value.value;
      } else if (value.tabName === 'preview') {
        this.ehealth.checkboxValue.previewTab = value.value;
      } else if (value.tabName === 'case-submission') {
        this.ehealth.checkboxValue.caseSubmissionTab = value.value;
      } else if (value.tabName === 'letter-of-consent') {
        this.ehealth.checkboxValue.letterOfConsentTab = value.value;
      } else if (value.tabName === 'travel-declaration') {
        this.ehealth.checkboxValue.travelDeclarationTab = value.value;
      } else if (value.tabName === 'general') {
        this.ehealth.checkboxValue.generalTab = value.value;
        this.ehealth.checkboxValue.medicalConditionTab = value.value;
      } else if (value.tabName === 'gastroenterology') {
        this.ehealth.checkboxValue.gastroTab = value.value;
        this.ehealth.checkboxValue.medicalConditionTab = value.value;
      } else if (value.tabName === 'orthopaedic') {
        this.ehealth.checkboxValue.orthoTab = value.value;
        this.ehealth.checkboxValue.medicalConditionTab = value.value;
      } else if (value.tabName === 'cardiology') {
        this.ehealth.checkboxValue.cardioTab = value.value;
        this.ehealth.checkboxValue.medicalConditionTab = value.value;
      } else if (value.tabName === 'gynaecology') {
        this.ehealth.checkboxValue.gynoTab = value.value;
        this.ehealth.checkboxValue.medicalConditionTab = value.value;
      } else if (value.tabName === 'urology') {
        this.ehealth.checkboxValue.uroTab = value.value;
        this.ehealth.checkboxValue.medicalConditionTab = value.value;
      } else if (value.tabName === 'ent') {
        this.ehealth.checkboxValue.entTab = value.value;
        this.ehealth.checkboxValue.medicalConditionTab = value.value;
      } else if (value.tabName === 'respiratory') {
        this.ehealth.checkboxValue.respiratoryTab = value.value;
        this.ehealth.checkboxValue.medicalConditionTab = value.value;
      }
    });
    dataService.subscribeUserGender.subscribe((gender) => {
      this.ehealth.profile.gender = gender;
    });
  }
  public ngOnInit() {
  }
  public ionViewWillEnter() {
    this.loggedInUser = this.dataService.getUserData();
  }
  public ionViewDidEnter() {
    const obj = {
      title: 'E-Health Booklet',
      backPage: 'client-case-profile',
    };
    this.dataService.setHeaderTitle(obj);
    this.case = this.dataService.getSelectedCase();
    this.clientDetails = this.dataService.getPatientData();
    if (this.case) {
      this.clientId = this.case.clientId;
    }
    this.ehealth = this.dataService.getEhealthData();
    // this.firebase.getEhealth(this.case.id).subscribe((resp) => {
    //   resp.docs.forEach((temp) => {
    //     this.ehealth = temp.data();
    //     this.ehealth.id = temp.id;
    //   });
    // });
    // this.dataService.dismiss();
  }
  public multistepForm(stepNo) {
    if (stepNo === 1) {
      this.healthbookStep1 = true;
      this.healthbookStep2 = false;
    } else if (stepNo === 2) {
      this.healthbookStep1 = false;
      this.healthbookStep2 = true;
    }
  }
  public changeDateFormat() {
    const date = new Date(this.data.date);
    const dateToString = date.toString();
    const newDate = dateToString.split(' ')[2] + ' ' + dateToString.split(' ')[1] + ' ' +
      dateToString.split(' ')[3];
    this.data.date = newDate;
  }
  public backStep() {
    if (this.healthbookStep1 === true) {
      this.router.navigate(['/client-details/' + this.clientId]);
    } else if (this.healthbookStep2 === true) {
      this.healthbookStep1 = true;
      this.healthbookStep2 = false;
    }
  }
  public changeRoute(page, activeTab, medicalTab) {
    if (page === 'case') {
      this.medicalTab = false;
      this.activeTab = 'case';
      let route;
      if (this.case) {
        route = '/e-health-booklet/case/' + this.clientId;
      } else {
        route = 'client-case-add/' + this.clientId + '/-1';
      }
      this.dataService.routeChange(route);
    } else {
      if (medicalTab) {
        if (document.getElementById('gastro-container')) {
          document.getElementById('gastro-container').scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'start' });
        }
        if (document.getElementById('ortho-container')) {
          document.getElementById('ortho-container').scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'start' });
        }
        if (document.getElementById('gynaec-container')) {
          document.getElementById('gynaec-container').scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'start' });
        }
      }
      this.medicalTab = medicalTab;
      this.activeTab = activeTab;
      const route = '/e-health-booklet/' + page + '/' + this.clientId;
      this.dataService.routeChange(route);
    }
  }
  public ionViewDidLeave() {
    this.dataService.clearEhealthData();
    this.dataService.clearMedicalData();
    this.dataService.closeCaseApprovalTimelineSidebar();
  }
}
