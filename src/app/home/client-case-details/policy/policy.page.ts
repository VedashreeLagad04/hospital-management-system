import { Component, OnInit } from '@angular/core';
import { AppDataService } from 'src/app/services/app-data.service';
declare var SelectPure: any;
import * as _ from 'lodash';
import { FirebaseService } from 'src/app/services/firebase.service';
@Component({
  selector: 'app-policy',
  templateUrl: './policy.page.html',
  styleUrls: ['./policy.page.scss'],
})
export class PolicyPage implements OnInit {
  public paymentType = [
    {
      key: 'Self-Pay',
      selected: false,
    },
    {
      key: 'Medisave',
      selected: false,
    },
    {
      key: 'eFiling',
      selected: false,
    },
    {
      key: 'Manual File',
      selected: false,
    },
  ];
  public admission: any = {
    policy: [
      {
        nameOfPolicy: '',
        insurer: '',
        basicInceptionDate: '',
        riderInceptionDate: '',
        paymentMode: this.paymentType,
        showPolicyNameDropdown: false,
        // selectedRowIndex: -1
      },
    ],
  };
  public policyNameSelectors = [];
  public initialValuesList: any = [
    {
      value: undefined,
    },
    {
      value: undefined,
    },
    {
      value: undefined,
    },
  ];
  public mode = 'preview';
  public allPolicyNames = [];
  // allPolicyNamesClone = [];
  // ? name to be searched in dropdowns
  public nameToSearch = 'Search';
  ehealthSnapshotSub: any;
  constructor(private dataService: AppDataService, private firebaseService: FirebaseService) { }
  // tslint:disable-next-line: use-lifecycle-interface
  public ngAfterViewInit() {
    this.dataService.present().then((loader) => {
      loader.present();
      // ? publish the header title you want to display in header
      const obj = {
        // title: 'Administration',
        title: 'Case Details',
        backPage: '/client-case-profile',
      };
      this.dataService.setHeaderTitle(obj);
      this.admission = this.dataService.getAdmissionData();
      console.log('this.admission: ', this.admission);
      // tslint:disable-next-line: prefer-for-of
      for (let i = 0; i < this.admission.policy.length; i++) {
        const policy = this.admission.policy[i];
        policy.nameOfPolicy = policy.nameOfPolicy || '-';
        // this.initialValuesList[i].value = policy.nameOfPolicy;
        policy.insurer = policy.insurer || '-';
        policy.nameOfBasic = policy.nameOfBasic || '-';
        policy.basicInceptionDate = policy.basicInceptionDate || '-';
        policy.nameOfRider = policy.nameOfRider || '-';
        policy.riderInceptionDate = policy.riderInceptionDate || '-';
        // policy.paymentMode = policy.paymentMode || [];
        if (_.size(policy.paymentMode) === 0) {
          policy.paymentMode = this.paymentType;
        }
        policy.showPolicyNameDropdown = false;
        // tslint:disable-next-line: prefer-for-of
        for (let j = 0; j < policy.paymentMode.length; j++) {
          // tslint:disable-next-line: prefer-for-of
          for (let k = 0; k < this.paymentType.length; k++) {
            if (policy.paymentMode[j] === this.paymentType[k].key) {
              this.paymentType[k].selected = true;
            }
          }
        }
      }
      const caseData = this.dataService.getSelectedCase();
      this.ehealthSnapshotSub = this.firebaseService.getEhealth(caseData.id).subscribe((resp) => {
        let ehealth: any;
        const tempEhealth = resp;
        ehealth = tempEhealth[0];
        this.dataService.setEhealthData(ehealth);
        this.allPolicyNames = ehealth.activePolicies;
        // ? make isSelected = true of policies that are already added
        for (let i = 0; i < this.admission.policy.length; i++) {
          // tslint:disable-next-line: prefer-for-of
          for (let j = 0; j < this.allPolicyNames.length; j++) {
            this.allPolicyNames[j].show = true;
            // this.allPolicyNames[j].isSelected = false;
            if (this.admission.policy[i].nameOfPolicy === this.allPolicyNames[j].planType) {
              this.allPolicyNames[j].isSelected = true;
              this.admission.policy[i].selectedRowIndex = j;
            }
          }
        }
        this.dataService.dismiss();
      });
    });
  }
  public ngOnInit() {
  }
  public selectCheckbox(event, policy, type) {
    if (this.mode === 'edit') {
      type.selected = event.target.checked;
    }
  }
  public editInfo() {
    this.mode = 'edit';
  }
  public addNewPolicy() {
    if (this.admission.policy.length < this.allPolicyNames.length) {
      this.admission.policy.push({
        nameOfPolicy: '-',
        nameOfBasic: '',
        insurer: '-',
        typeOfPolicy: '-',
        policyInceptionDate: '-',
        showPolicyNameDropdown: false,
        paymentMode: [
          {
            key: 'eFiling',
            selected: false,
          },
          {
            key: 'Manual File',
            selected: false,
          },
        ],
      });
      // ? push obj in admission.claims
      this.admission.claims.push({
        policyName: '',
        claimDateLast: '30-11-2020',
        amountMedisave: '',
        amountCash: '',
        claimsStatus: '',
        zeroized: '',
        approvedDate: '-',
        zeroizedDate: '',
        remarks: '-',
        totalHospitalBill: this.admission.revenue.hospitalBill,
        toUploadFile: false,
      });
    }
  }
  public openDropdown(event, policy: { showPolicyNameDropdown: boolean; }) {
    event.stopPropagation();
    this.closeAllDropdown(policy);
    this.nameToSearch = '';
    policy.showPolicyNameDropdown = !policy.showPolicyNameDropdown;
    this.showAllPolicyNames();
  }
  public enterValue(event) {
    event.stopPropagation();
  }
  public servicesSearchTextChanged() {
    if (this.nameToSearch === 'Search') {
      this.nameToSearch = '';
    }
  }
  public servicesSearchTextFocusOut() {
      this.nameToSearch = '';
      this.showAllPolicyNames();
  }
  public showAllPolicyNames() {
    for (let i = 0; i < this.allPolicyNames.length; i++) {
      const element = this.allPolicyNames[i];
      element.show = true;
    }
  }
  public searchPolicyName() {
    this.nameToSearch = this.nameToSearch.trim().replace(/\s\s+/g, ' ');
    this.allPolicyNames.forEach((policy) => {
      if (policy.planType.toLowerCase().includes(this.nameToSearch.toLowerCase()) || this.nameToSearch === '') {
        policy.show = true;
      } else {
        policy.show = false;
      }
    });
  }
  // tslint:disable-next-line: max-line-length
  public selectDoc(policy: { insurer; riderPlanName; riderInceptionDate; isSelected: boolean; planType: any; mainPlanName: any; mainInceptionDate: string | number | Date; }, policyNameIndex: any, rowIndex: string | number) {
    policy.isSelected = true;
    this.admission.policy[rowIndex].selectedRowIndex = policyNameIndex;
    if (this.admission.policy[rowIndex].nameOfPolicy !== '' && this.admission.policy[rowIndex].nameOfPolicy !== '-') {
      const findPolicyNameIndex = _.findIndex(this.allPolicyNames, (o) => o.planType === this.admission.policy[rowIndex].nameOfPolicy);
      if (findPolicyNameIndex !== -1) {
        this.allPolicyNames[findPolicyNameIndex].isSelected = false;
      }
    }
    this.admission.policy[rowIndex].nameOfPolicy = policy.planType;
    this.admission.policy[rowIndex].insurer = policy.insurer;
    this.admission.policy[rowIndex].typeOfPolicy = policy.mainPlanName;
    // if (this.admission.policy[rowIndex].nameOfBasic) {
      this.admission.policy[rowIndex].nameOfBasic = policy.mainPlanName;
    // }
    if (policy.mainInceptionDate) {
      let date;
      let inceptionDate;
      date = new Date(policy.mainInceptionDate);
      const today = this.dataService.formatDateAndMonth(date);
      inceptionDate = today.split('/')[0];
      if (rowIndex === 0) {
        this.admission.policy[rowIndex].nameOfRider = policy.riderPlanName.length !== 0 ? policy.riderPlanName : '-';
        this.admission.policy[rowIndex].basicInceptionDate = inceptionDate;
      } else {
        this.admission.policy[rowIndex].policyInceptionDate = inceptionDate;
      }
    }
    if (rowIndex === 0 && policy.riderInceptionDate) {
      // tslint:disable-next-line: no-shadowed-variable
      let date;
      let riderInceptionDate;
      date = new Date(policy.riderInceptionDate);
      const today = this.dataService.formatDateAndMonth(date);
      riderInceptionDate = today.split('/')[0];
      this.admission.policy[rowIndex].riderInceptionDate = riderInceptionDate;
    }
    this.admission.policy[rowIndex].showPolicyNameDropdown = false;
  }
  public saveChanges() {
    this.dataService.present().then((loader) => {
      loader.present();
      // ? delete unwanted keys
      // tslint:disable-next-line: prefer-for-of
      for (let i = 0; i < this.admission.policy.length; i++) {
        delete (this.admission.policy[i].showPolicyNameDropdown);
        delete (this.admission.policy[i].selectedRowIndex);
      }
      // ? delete claims whose policyName === ''
      _.remove(this.admission.claims, (o: any) => {
        return o.policyName.length === 0;
      });
      this.mode = 'preview';
      const msg = 'Policy information';
      this.dataService.saveAdmissionDataToFirebase(this.admission, msg);
    });
  }
  public closeAllDropdown(policy) {
    // tslint:disable-next-line: prefer-for-of
    for (let i = 0; i < this.admission.policy.length; i++) {
      const element = this.admission.policy[i];
      if (policy) {
        if (element !== policy) {
          element.showPolicyNameDropdown = false;
        }
      } else {
        element.showPolicyNameDropdown = false;
      }
    }
  }
  ionViewWillLeave() {
    if (this.ehealthSnapshotSub) {
      this.ehealthSnapshotSub.unsubscribe();
    }
  }
}
