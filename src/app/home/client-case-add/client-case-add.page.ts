import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { AppDataService } from 'src/app/services/app-data.service';
import { FirebaseService } from 'src/app/services/firebase.service';
@Component({
  selector: 'app-client-case-add',
  templateUrl: './client-case-add.page.html',
  styleUrls: ['./client-case-add.page.scss'],
})
export class ClientCaseAddPage implements OnInit {
  showCaseTypeDropdown = false;
  caseTypes = ['Normal', 'A & E'];
  previousCase: any;
  clientDetails: any = {};
  user;
  clientId;
  caseName;
  caseDescription;
  checkbox1;
  case: any = {
    clientId: '',
    assignTo: [],
    name: '',
    type: 'Normal',
    description: '',
    caseStatus: [],
    currentStatus: ''
  };
  pageMode = 'case-info';
  caseSnapshotSub: any;
  constructor(
    private dataService: AppDataService,
    private firebase: FirebaseService,
    private activeRoute: ActivatedRoute,
    private router: Router,
    private modalController: ModalController
  ) { }
  ngOnInit() {
    this.dataService.present().then(a => {
      a.present();
      this.user = this.dataService.getUserData();
      this.activeRoute.paramMap.subscribe(params => {
        this.clientId = params.get('clientId');
        const caseId = params.get('caseId');
        this.getClientDetails();
        if (caseId === '-1') {
          this.pageMode = 'add-case';
          const obj = {
            title: 'Add Case',
            backPage: 'client-case-list/' + this.clientId,
          };
          this.dataService.setHeaderTitle(obj);
          this.case.clientId = this.clientId;
          this.case.currentStatus = 'Pending';
        }
      });
    });
  }
  getClientDetails() {
    this.firebase.getUserDetails(this.clientId).subscribe(data => {
      this.clientDetails = data.data();
      this.clientDetails.id = data.id;
      this.hideLoader();
    }, error => {
      this.dataService.dismiss();
    });
  }
  getCaseDetails(caseId) {
    this.firebase.getOneCase(caseId).subscribe(data => {
      this.case = data.data();
      this.case.id = data.id;
      this.previousCase = data.data();
      this.case.caseDetails.preExistingCondition = this.case.caseDetails.preExistingCondition || '-';
      this.case.caseDetails.currentComplaints = this.case.caseDetails.currentComplaints || '-';
      this.case.caseApproval.cc = this.case.caseApproval.cc || '-';
      this.case.caseApproval.mc = this.case.caseApproval.mc || '-';
      this.case.caseApproval.aol = this.case.caseApproval.aol || '-';
      this.case.caseApproval.aoq = this.case.caseApproval.aoq || '-';
      this.hideLoader();
    }, error => {
      this.dataService.dismiss();
    });
  }
  hideLoader() {
    if (this.pageMode === 'case-info') {
      if (this.clientDetails && this.case) {
        this.dataService.dismiss();
      }
    } else {
      if (this.clientDetails) {
        this.dataService.dismiss();
      }
    }
  }
  openConsent() {
    this.dataService.present().then(loader => {
      loader.present();
      if (this.case.name === '') {
        this.hideLoaderAndShowAlert('Please enter case name!');
      } else if (this.case.description === '') {
        this.hideLoaderAndShowAlert('Please enter case description!');
      } else {
        this.dataService.setNewCase(this.case);
        this.dataService.dismiss();
        this.router.navigateByUrl('/letter-of-consent/case');
      }
    });
  }
  saveChanges() {
    this.dataService.present().then(loader => {
      loader.present();
      const date = new Date();
      this.case.lastUpdateDate = date;
      this.case.lastUpdateTimestamp = new Date(date).getTime();
      if (this.case.name === '') {
        this.hideLoaderAndShowAlert('Please enter case name!');
      } else if (this.case.description === '') {
        this.hideLoaderAndShowAlert('Please enter case description!');
      } else {
        if (this.pageMode === 'add-case') {
          if (this.checkbox1) {
            this.case.createdDate = date;
            this.firebase.addCase(this.case).then(resp => {
              if (resp.id) {
                this.case.id = resp.id;
                this.createCaseDetails(this.case);
                this.firebase.getclientDetails(this.case.clientId).subscribe(data => {
                  let clientData;
                  data.docs.forEach(resp => {
                    clientData = resp.data();
                    clientData.id = resp.id;
                  });
                  const today = new Date();
                  const timelineStatus: any = {
                    date: today,
                    activity: 'Case Created',
                    userType: this.user.type,
                    userId: this.user.id,
                    caseId: resp.id
                  };
                  clientData.timeline.push(timelineStatus);
                  this.dataService.updateTimelineData(timelineStatus, clientData.id);
                  this.hideLoaderShowAlertAndRoute("Case added successfully!");
                });
              }
            });
          } else {
            this.hideLoaderAndShowAlert('Please agree to privacy policy to proceed!');
          }
        } else if (this.pageMode === 'edit-case') {
          this.dataService.dismiss();
        }
      }
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
        if (!this.clientDetails.homeContactNo) {
          this.clientDetails.homeContactNo = '';
        }
        const booklet = {
          caseId: caseData.id,
          profile: this.clientDetails,
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
    this.dataService.presentAlertThenRoute(alertMsg, '/client-case-list/' + this.clientId);
  }
  openCaseTypeDropdown() {
    this.showCaseTypeDropdown = !this.showCaseTypeDropdown;
  }
  selectCaseType(casetype) {
    this.case.type = casetype;
    this.hideCaseTypeDropdown();
  }
  hideCaseTypeDropdown() {
    this.showCaseTypeDropdown = false;
  }
  showEditCase() {
    this.pageMode = 'edit-case';
    const obj = {
      title: 'Edit Case Information',
      backPage: 'client-case-home'
    };
    this.dataService.setHeaderTitle(obj);
  }
  ionViewWillLeave() {
    if (this.caseSnapshotSub) {
      this.caseSnapshotSub.unsubscribe();
    }
  }
}
