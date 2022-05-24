import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NamedTimeZoneImpl } from '@fullcalendar/core';
import { AppDataService } from 'src/app/services/app-data.service';
import { FirebaseService } from 'src/app/services/firebase.service';
import * as _ from 'lodash';
@Component({
  selector: 'app-pre-extg-condition',
  templateUrl: './pre-extg-condition.page.html',
  styleUrls: ['./pre-extg-condition.page.scss'],
})
export class PreExtgConditionPage implements OnInit {
  nameToSearch = '';
  public conditions = ['condition1', 'condition2', 'condition3'];
  public hospitals = [];
  public hospitalType = 'Private';
  public polyclinic = ['Tampines', 'Punggol'];
  public histories = [];
  // tslint:disable-next-line: max-line-length
  public institutions = [
    {
      institution: 'Public',
      show: true
    },
    {
      institution: 'Private',
      show: true
    },
    {
      institution: 'Polyclinic',
      show: true
    },
    {
      institution: 'GP',
      show: true
    },
    {
      institution: 'Others',
      show: true
    },
  ];
  public clientId;
  public case;
  public mode = 'preview';
  public loggedInuser: any;
  public commonEhealthData;
  public prexisting: any = {
    preExistingCondition: [
      {
        showConditionDropdown: false,
        showInstitutionDropdown: false,
        showDeclared: true,
        bloodPressure: '',
        bloodPressureMedication: '',
        diabetes: '',
        diabetesMedication: '',
        highCholesterol: '',
        cholesterolMedication: '',
        otherMedication: '',
        otherMedicationAnswer: '',
        otherMedicationsArr: [{ medication: '' }],
        pregnant: '',
        months: '',
        pregnantDate: '',
        aidsHivStd: '',
        hivRemarks: '',
        familyHistory: '',
        date: '',
        nameOfInstitution: '',
        declared: 'Yes',
        remarks: '',
        condition: '',
        institutionType: '',
        history: 'Pre-Existing Condition (Before purchase of policy)',
      },
    ],
  };
  public internetCheckFlag = false;
  public reloadAgain = true;
  // tslint:disable-next-line: max-line-length
  constructor(private activeRoute: ActivatedRoute, private firebase: FirebaseService, public dataService: AppDataService, private router: Router) { }
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
        this.router.routeReuseStrategy.shouldReuseRoute = () => {
          return false;
        };
        if (this.reloadAgain) {
          this.ionViewDidEnter();
        }
        this.dataService.toastPresent('Internet Connected');
        this.internetCheckFlag = false;
      }
    });
  }
  // tslint:disable-next-line: use-lifecycle-interface
  public ngOnDestroy() {
    if (this.dataService.mySubscription) {
      this.dataService.mySubscription.unsubscribe();
    }
  }
  public ionViewDidEnter() {
    this.mode = 'preview';
    this.dataService.present().then((a) => {
      a.present();
      this.activeRoute.paramMap.subscribe((params) => {
        this.clientId = params.get('id');
        this.case = this.dataService.getSelectedCase();
        this.firebase.getMedicalHistory().subscribe((resp: any) => {
          this.histories = [];
          if (resp.size > 0) {
            _.forEach(resp.docs, (doc) => {
              this.histories.push({ history: doc.data().history, show: true });
            });
          } else {
            this.histories = [
              { history: 'Pre-Existing Condition (Before purchase of policy)', show: true },
              { history: 'Past Medical', show: true }
            ];
          }
        });
        this.firebase.getCommonEheallthData(this.clientId).subscribe((resp) => {
          if (resp && resp.docs && resp.docs.length > 0) {
            this.commonEhealthData = resp.docs[0].data();
            this.commonEhealthData.id = resp.docs[0].id;
          }
        })
        // this.firebase.getEhealth(this.case.id).subscribe((resp) => {
        //   resp.docs.forEach((temp) => {
        //     this.prexisting = temp.data();
        //     this.prexisting.id = temp.id;
        //     
        //   });
        this.prexisting = this.dataService.getEhealthData();
        this.loggedInuser = this.dataService.getUserData();
        if (this.prexisting.preExistingCondition.length === 0) {
          this.prexisting.preExistingCondition.push(
            {
              showHistory: 'No',
              showConditionDropdown: false,
              showInstitutionDropdown: false,
              showInstitutionNameDropdown: false,
              showHistoryDropdown: false,
              showDeclared: true,
              bloodPressure: '',
              bloodPressureMedication: '',
              diabetes: '',
              diabetesMedication: '',
              highCholesterol: '',
              cholesterolMedication: '',
              otherMedication: '',
              otherMedicationAnswer: '',
              otherMedicationsArr: [{ medication: '' }],
              pregnant: '',
              months: '',
              pregnantDate: '',
              aidsHivStd: '',
              hivRemarks: '',
              familyHistory: '',
              familyHistoryAnswer: '',
              familyHistoryArr: [{ history: '' }],
              date: '',
              nameOfInstitution: '',
              declared: 'Yes',
              history: 'Pre-Existing Condition (Before purchase of policy)',
              remarks: '',
              condition: '',
              institutionType: '',
            },
          );
        } else {
          if (this.prexisting.preExistingCondition[0].showHistory === undefined) {
            this.prexisting.preExistingCondition[0].showHistory = 'No';
          }
          if (this.prexisting.preExistingCondition[0].otherMedicationAnswer === undefined) {
            this.prexisting.preExistingCondition[0].otherMedicationAnswer = '';
            this.prexisting.preExistingCondition[0].otherMedicationsArr = [{ medication: '' }];
          }
          if (this.prexisting.preExistingCondition[0].familyHistoryAnswer === undefined) {
            this.prexisting.preExistingCondition[0].familyHistoryAnswer = '';
            this.prexisting.preExistingCondition[0].familyHistoryArr = [{ history: '' }];
          }
        }
        this.dataService.dismiss();
        // });
      });
    });
  }
  public openConditionDropdown(event, preExistingCondition) {
    event.stopPropagation();
    this.nameToSearch = '';
    preExistingCondition.showInstitutionDropdown = false;
    preExistingCondition.showInstitutionNameDropdown = false;
    preExistingCondition.showHistoryDropdown = false;
    preExistingCondition.showConditionDropdown = !preExistingCondition.showConditionDropdown;
  }
  public openInstitutionDropdown(event, preExistingCondition) {
    event.stopPropagation();
    this.nameToSearch = '';
    this.institutions = this.dataService.searchFromDropdownList(this.institutions, this.nameToSearch, 'institution');
    preExistingCondition.showConditionDropdown = false;
    preExistingCondition.showInstitutionNameDropdown = false;
    preExistingCondition.showHistoryDropdown = false;
    preExistingCondition.showInstitutionDropdown = !preExistingCondition.showInstitutionDropdown;
  }
  public openHistoryDropdown(event, preExistingCondition) {
    event.stopPropagation();
    this.nameToSearch = '';
    this.histories = this.dataService.searchFromDropdownList(this.histories, this.nameToSearch, 'history');
    preExistingCondition.showConditionDropdown = false;
    preExistingCondition.showInstitutionDropdown = false;
    preExistingCondition.showInstitutionNameDropdown = false;
    preExistingCondition.showHistoryDropdown = !preExistingCondition.showHistoryDropdown;
  }
  public selectCondition(condition, preExistingCondition) {
    preExistingCondition.showConditionDropdown = false;
    preExistingCondition.condition = condition;
  }
  public selectHistory(history, preExistingCondition) {
    preExistingCondition.showHistoryDropdown = false;
    preExistingCondition.history = history;
    if (history === 'Past Medical') {
      preExistingCondition.showDeclared = false;
    } else {
      preExistingCondition.showDeclared = true;
    }
  }
  public async selectInstitution(institution, preExistingCondition) {
    preExistingCondition.showInstitutionDropdown = false;
    // if (institution === 'Public Hospital') {
    //   this.hospitalType = 'public';
    preExistingCondition.nameOfInstitution = '';
    this.hospitals = [];
    this.hospitalType = institution;

    preExistingCondition.institutionType = institution;
    // if (institution !== 'Others') {      // ? no need as getAllInstitutions() is called when open name of institution dropdown
    //   await this.getAllInstitutions(institution);
    // } else {
    //   preExistingCondition.nameOfInstitution = '';
    // }
  }
  getAllInstitutions(institution) {
    return new Promise((resolve) => {
      this.firebase.getInstitution(institution).subscribe((resp) => {
        this.hospitals = [];
        if (resp.size !== 0) {
          resp.docs.forEach((element) => {
            const temp: any = element.data();
            temp.id = element.id;
            this.hospitals.push({ name: temp.name, show: true });
          });
        }
        resolve(true);
      });
    });
  }
  public async openInstitutionNameDropdown(event, preExistingCondition) {
    event.stopPropagation();
    this.nameToSearch = '';
    preExistingCondition.showInstitutionNameDropdown = !preExistingCondition.showInstitutionNameDropdown;
    if (preExistingCondition.institutionType !== 'Others') {
      if (preExistingCondition.showInstitutionNameDropdown) {
        await this.getAllInstitutions(preExistingCondition.institutionType);
      }
    } else {
      preExistingCondition.nameOfInstitution = '';
    }
    this.hospitals = this.dataService.searchFromDropdownList(this.hospitals, this.nameToSearch, 'name');
    preExistingCondition.showConditionDropdown = false;
    preExistingCondition.showInstitutionDropdown = false;
    preExistingCondition.showHistoryDropdown = false;
  }
  public selectInstitutionName(name, preExistingCondition) {
    preExistingCondition.showInstitutionNameDropdown = false;
    preExistingCondition.nameOfInstitution = name;
  }
  public add() {
    this.prexisting.preExistingCondition.push(
      {
        showHistory: 'Yes',
        showDeclared: true,
        date: '',
        nameOfInstitution: '',
        declared: 'Yes',
        remarks: '',
        condition: '',
        institutionType: '',
        history: 'Pre-Existing Condition (Before purchase of policy)',
      },
    );
  }
  public delete(index) {
    this.prexisting.preExistingCondition.splice(index, 1);
  }
  public edit() {
    this.mode = 'edit';
  }
  public saveChanges() {
    this.dataService.present().then((a) => {
      a.present();
      this.reloadAgain = false;
      this.mode = 'preview';
      // tslint:disable-next-line: prefer-for-of
      for (let i = 0; i < this.prexisting.preExistingCondition.length; i++) {
        if (this.prexisting.preExistingCondition[i].bloodPressure === 'No') {
          this.prexisting.preExistingCondition[i].bloodPressureMedication = '';
        }
        if (this.prexisting.preExistingCondition[i].diabetes === 'No') {
          this.prexisting.preExistingCondition[i].diabetesMedication = '';
        }
        if (this.prexisting.preExistingCondition[i].highCholesterol === 'No') {
          this.prexisting.preExistingCondition[i].cholesterolMedication = '';
        }
      }
      // tslint:disable-next-line: prefer-for-of
      for (let i = 0; i < this.prexisting.preExistingCondition.length; i++) {
        delete this.prexisting.preExistingCondition[i].showConditionDropdown;
        delete this.prexisting.preExistingCondition[i].showInstitutionDropdown;
        delete this.prexisting.preExistingCondition[i].showInstitutionNameDropdown;
        delete this.prexisting.preExistingCondition[i].showHistoryDropdown;
      }
      this.prexisting.preview.signatureFlag = true;
      this.prexisting.preview.preExistingCondition = this.prexisting.preExistingCondition;
      this.prexisting.checkboxValue.preExtgConditionTab = true;
      if (!this.internetCheckFlag) {
        if (this.dataService.isLatestCase && this.commonEhealthData) {
          this.commonEhealthData.medicalHistory = this.prexisting.preExistingCondition;
          this.firebase.editCommonEheathData(this.commonEhealthData).then(() => {
            this.firebase.editEhealth(this.prexisting).then(() => {
              const obj = {
                tabName: 'medical-history',
                value: true,
              };
              this.dataService.setCheckboxValue(obj);
              this.dataService.setEhealthData(this.prexisting);
              this.dataService.dismiss();
              this.dataService.presentAlert('Medical History updated successfully!');
            }).catch(() => {
              this.dataService.dismiss();
            });
          }).catch(() => {
            this.dataService.dismiss();
          });
        } else {
          this.firebase.editEhealth(this.prexisting).then(() => {
            const obj = {
              tabName: 'medical-history',
              value: true,
            };
            this.dataService.setCheckboxValue(obj);
            this.dataService.setEhealthData(this.prexisting);
            this.dataService.dismiss();
            this.dataService.presentAlert('Medical History updated successfully!');
          }).catch(() => {
            this.dataService.dismiss();
          });
        }
      } else {
        this.dataService.dismiss();
        this.dataService.presentAlert('Please check your internet connection!');
      }
    });
  }
  public closeDropdown() {
    // tslint:disable-next-line: prefer-for-of
    for (let i = 0; i < this.prexisting.preExistingCondition.length; i++) {
      this.prexisting.preExistingCondition[i].showConditionDropdown = false;
      this.prexisting.preExistingCondition[i].showInstitutionDropdown = false;
      this.prexisting.preExistingCondition[i].showInstitutionNameDropdown = false;
      this.prexisting.preExistingCondition[i].showHistoryDropdown = false;
    }
  }
  public addInputs(type, obj) {
    if (type === 'other-medication') {
      obj.otherMedicationsArr.push({ medication: '' });
    } else if (type === 'family-history') {
      obj.familyHistoryArr.push({ history: '' });
    }
  }
  public removeInputs(type, obj, index) {
    if (type === 'other-medication') {
      obj.otherMedicationsArr.splice(index, 1);
    } else if (type === 'family-history') {
      obj.familyHistoryArr.splice(index, 1);
    }
  }
  public showMedicalHistory(ans) {
    _.forEach(this.prexisting.preExistingCondition, (o) => {
      o.showHistory = ans;
    });
  }
  public openDatePicker(index) {
    document.getElementById('date-' + index).click();
  }
  public ionViewWillLeave() {
    document.getElementById('pre-extg-container').scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'start' });
  }
}
