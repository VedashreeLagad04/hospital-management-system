import { Component, OnInit } from "@angular/core";
import { ModalController } from "@ionic/angular";
import { log } from "console";
import * as _ from "lodash";
import html2pdf from 'html2pdf.js';
import { AppDataService } from "src/app/services/app-data.service";
import { FirebaseService } from "src/app/services/firebase.service";
import { CalculatorPage } from "./calculator/calculator.page";
import { SocialSharing } from '@ionic-native/social-sharing/ngx';
import { environment } from "src/environments/environment";
@Component({
  selector: "app-insurance-calculator",
  templateUrl: "./insurance-calculator.page.html",
  styleUrls: ["./insurance-calculator.page.scss"],
})
export class InsuranceCalculatorPage implements OnInit {
  public capLimit = 7550;
  public fileName: any;
  public value = { values: [] };
  public internetCheckFlag = false;
  public inputs = [];
  public total;
  public insurance: any = {
    patientName: "",
    consultantName: "",
    surgicalCodes: [
      {
        code: "",
        showSurgicalCodeDropdown: false,
      },
      {
        code: "",
        showSurgicalCodeDropdown: false,
      },
      {
        code: "",
        showSurgicalCodeDropdown: false,
      },
    ],
    additionalPlans: [
      {
        planName: "",
        deductible: "",
      },
    ],
    additionalPlanTotal: 0,
    insurerInformation: {
      insurer: "",
      policyActivated: "",
      numberOfDayStay: "",
      medisaveLimit: "",
    },
    basic: {
      totalBill: "",
      proRatioFactor: "",
      deductible: "",
      subTotal: "",
    },
    rider: {
      basicDeductible: "",
      riderDeductible: "",
      subTotal: "",
    },
    payout: {
      totalPayout: "",
      exposure: "",
    },
  };
  public isWeb = environment.isWeb;
  public file: any;
  aCount = 0;
  bCount = 0;
  cCount = 0;
  public patientNames = ["Patient1", "Patient2", "Patient3"];
  public consultantNames = [];
  public insurers = [
    // 'insurer1' , 'insurer2' , 'insurer3'
  ];
  public policies = [
    // 'policy1' , 'policy2' , 'policy3'
  ];
  public riderPolicies = [];
  public selectedPolicyType = 'main';
  public allSurgicalCodes = [];
  public showSurgicalCodes = [];
  public showPatientDropdown = false;
  public showConsultantDropdown = false;
  public showInsurerDropdown = false;
  public showPolicyDropdown = false;
  public parameters: any = {};
  public isBasicExclaimOpen = false;
  public isRiderExclaimOpen = false;
  public isPayoutExclaimOpen = false;
  public codeToSearch = '';
  public medisaveData: any;
  userSnapshotSub: any;
  constructor(
    private modalController: ModalController,
    private firebase: FirebaseService,
    private dataService: AppDataService,
    private socialSharing: SocialSharing
  ) {
    // dataService.subscribeMainPlanName.subscribe((mainPlanName) => {
    //   
    //   this.mainPlanName = mainPlanName;
    //   this.getInsurer();
    // });
  }
  ngOnInit() { }
  ionViewDidEnter() {
    // this.getInsurer();
    this.dataService.present().then((loader) => {
      loader.present();
      this.insurance = {
        patientName: "",
        consultantName: "",
        surgicalCodes: [
          {
            code: "",
            showSurgicalCodeDropdown: false,
          },
          {
            code: "",
            showSurgicalCodeDropdown: false,
          },
          {
            code: "",
            showSurgicalCodeDropdown: false,
          },
        ],
        additionalPlans: [
          {
            planName: "",
            deductible: "",
          },
        ],
        additionalPlanTotal: 0,
        insurerInformation: {
          insurer: "",
          policyActivated: "",
          numberOfDayStay: "",
          medisaveLimit: "",
        },
        basic: {
          totalBill: "",
          proRatioFactor: "",
          deductible: "",
          subTotal: "",
        },
        rider: {
          basicDeductible: "",
          riderDeductible: "",
          subTotal: "",
        },
        payout: {
          totalPayout: "",
          exposure: "",
        },
      };
      const loggedInUser = this.dataService.getUserData();
      // ? publish the header title you want to display in header
      const obj = {
        title: 'ISP Calculation',
        backPage: '/user-home/' + loggedInUser.id,
      };
      this.dataService.setHeaderTitle(obj);
      this.dataService.setHeaderTitle(obj);
      this.firebase.getInsurer().subscribe((resp) => {
        const data = [];
        if (resp.size !== 0) {
          resp.docs.forEach((element) => {
            const temp: any = element.data();
            temp.id = element.id;
            data.push(temp);
          });
          const insurerDetails = [];
          _.map(_.groupBy(data, "insurer"), (vals, insurer) => {
            const mainPlanName: any = [];
            let planType = 'other';
            vals.forEach((el) => {
              mainPlanName.push({ mainPlanName: el.mainPlanName, id: el.id });
              if (el.planType === 'Hospitalisation (Shield) Plan') {
                planType = 'Hospitalisation (Shield) Plan';
              }
            });
            const temp = {
              insurer,
              mainPlanName,
              planType,
              upArrow: true,
              riderPlans: []
            };
            insurerDetails.push(temp);
          });
          this.insurers = insurerDetails;
        }
        this.getAllRiderPlans();
        return;
      });
    });
  }
  public getAllRiderPlans() {
    this.firebase.getRiderPlans().subscribe((resp) => {
      if (resp.size !== 0) {
        const data = [];
        const riderPlans = [];
        resp.docs.forEach((element) => {
          const temp: any = element.data();
          temp.id = element.id;
          data.push(temp);
        });
        _.map(_.groupBy(data, 'insurer'), (vals, insurer) => {
          const riderPlanName: any = [];
          vals.forEach((el) => {
            // mainPlanName.push(el.mainPlanName);
            // ? we need id here for firebase query in add-insurance-parameter page
            riderPlanName.push({ riderPlanName: el.riderPlanName, id: el.id });
          });
          const temp = {
            insurer,
            riderPlanName
          }
          riderPlans.push(temp);
        });
        for (let i = 0; i < this.insurers.length; i++) {
          const insurer = this.insurers[i];
          for (let j = 0; j < riderPlans.length; j++) {
            const rider = riderPlans[j];
            if (insurer.insurer === rider.insurer) {
              insurer.riderPlans = rider.riderPlanName
            }
          }
        }
      }
      this.getSurgicalCodes();
      return;
    });
  }
  public getSurgicalCodes() {
    const surgicalCodes = this.dataService.getAllSurgicalCodes();
    if (_.size(surgicalCodes) > 0) {
      this.allSurgicalCodes = surgicalCodes;
    } else {
      this.firebase.getSurgicalCode().subscribe((resp) => {
        const data = [];
        if (resp.size !== 0) {
          resp.docs.forEach((element) => {
            const temp: any = element.data();
            temp.id = element.id;
            temp.show = true;
            temp.isSelected = false;
            data.push(temp);
          });
          // data.push('Others');
          this.allSurgicalCodes = data;
          this.dataService.setAllSurgicalCodes(this.allSurgicalCodes);
        }
      });
    }
    this.getConsultants();
  }
  public getConsultants() {
    this.userSnapshotSub = this.firebase.getUsers('agent').subscribe((agents) => {
      this.consultantNames = agents;
      this.dataService.dismiss();
      return;
    });
  }
  // public getInsurer() {
  //   this.firebase.getInsuranceParameter(this.mainPlanName.id).subscribe((resp) =>{
  //     
  //     if (resp.size === 0) {
  //       this.parameters = {
  //         mainPlanNameId : '',
  //         basicParameters : [],
  //         riderParameters : [],
  //         payoutParameters : []
  //        }
  //     } else {
  //       this.parameters = resp.docs[0].data();
  //       this.parameters.id = resp.docs[0].id;
  //     }
  //   });
  //   
  // }
  public openPatientDropdown() {
    this.showPatientDropdown = !this.showPatientDropdown;
  }
  public selectPatientName(name) {
    this.insurance.patientName = name;
    this.showPatientDropdown = false;
  }
  public openConsultantDropdown(event) {
    event.stopPropagation();
    this.showPolicyDropdown = false;
    this.showInsurerDropdown = false;
    if (this.parameters && this.parameters.basicParameters && this.parameters.riderParameters && this.parameters.payoutParameters) {
      for (let i = 0; i < this.parameters.basicParameters.length; i++) {
        this.parameters.basicParameters[i].showDropdown = false;
        this.parameters.basicParameters[i].isExclaimOpen = false;
      }
      for (let i = 0; i < this.parameters.riderParameters.length; i++) {
        this.parameters.riderParameters[i].showDropdown = false;
        this.parameters.riderParameters[i].isExclaimOpen = false;
      }
      for (let i = 0; i < this.parameters.payoutParameters.length; i++) {
        this.parameters.payoutParameters[i].showDropdown = false;
        this.parameters.payoutParameters[i].isExclaimOpen = false;
      }
    }
    this.showConsultantDropdown = !this.showConsultantDropdown;
  }
  public selectConsultantName(name) {
    this.insurance.consultantName = name;
    this.showConsultantDropdown = false;
  }
  public openInsurerDropdown(event) {
    event.stopPropagation();
    this.showPolicyDropdown = false;
    this.showConsultantDropdown = false;
    if (this.parameters && this.parameters.basicParameters && this.parameters.riderParameters && this.parameters.payoutParameters) {
      for (let i = 0; i < this.parameters.basicParameters.length; i++) {
        this.parameters.basicParameters[i].showDropdown = false;
        this.parameters.basicParameters[i].isExclaimOpen = false;
      }
      for (let i = 0; i < this.parameters.riderParameters.length; i++) {
        this.parameters.riderParameters[i].showDropdown = false;
        this.parameters.riderParameters[i].isExclaimOpen = false;
      }
      for (let i = 0; i < this.parameters.payoutParameters.length; i++) {
        this.parameters.payoutParameters[i].showDropdown = false;
        this.parameters.payoutParameters[i].isExclaimOpen = false;
      }
    }
    this.showInsurerDropdown = !this.showInsurerDropdown;
  }
  public selectInsurer(insurer) {
    this.selectedPolicyType = insurer.planType;
    this.insurance.insurerInformation.policyActivated = '';
    this.insurance.insurerInformation.insurer = insurer.insurer;
    const mainplan = _.find(this.insurers, ["insurer", insurer.insurer]);
    if (mainplan) {
      this.policies = mainplan.mainPlanName;
      if (mainplan.planType === 'Hospitalisation (Shield) Plan') {
        this.riderPolicies = mainplan.riderPlans;
      } else {
        this.riderPolicies = [];
      }
    } else {
      this.policies = [];
      this.riderPolicies = [];
    }
    this.showInsurerDropdown = false;
  }
  public openPolicyDropdown(event) {
    event.stopPropagation();
    this.showInsurerDropdown = false;
    this.showConsultantDropdown = false;
    if (this.parameters && this.parameters.basicParameters && this.parameters.riderParameters && this.parameters.payoutParameters) {
      for (let i = 0; i < this.parameters.basicParameters.length; i++) {
        this.parameters.basicParameters[i].showDropdown = false;
        this.parameters.basicParameters[i].isExclaimOpen = false;
      }
      for (let i = 0; i < this.parameters.riderParameters.length; i++) {
        this.parameters.riderParameters[i].showDropdown = false;
        this.parameters.riderParameters[i].isExclaimOpen = false;
      }
      for (let i = 0; i < this.parameters.payoutParameters.length; i++) {
        this.parameters.payoutParameters[i].showDropdown = false;
        this.parameters.payoutParameters[i].isExclaimOpen = false;
      }
    }
    this.showPolicyDropdown = !this.showPolicyDropdown;
  }
  public selectPolicy(type, policy) {
    if (type === 'rider') {
      this.insurance.insurerInformation.policyActivated = policy.riderPlanName;
    } else {
      this.insurance.insurerInformation.policyActivated = policy.mainPlanName;
    }
    this.firebase.getInsuranceParameter(policy.id).subscribe((resp) => {
      if (resp.size === 0) {
        this.parameters = {
          mainPlanNameId: "",
          basicParameters: [],
          riderParameters: [],
          payoutParameters: [],
        };
      } else {
        this.parameters = resp.docs[0].data();
        this.parameters.id = resp.docs[0].id;
        for (let i = 0; i < this.parameters.basicParameters.length; i++) {
          this.parameters.basicParameters[i].formulaId = _.cloneDeep(this.parameters.basicParameters[i].formula);
        }
        for (let i = 0; i < this.parameters.riderParameters.length; i++) {
          this.parameters.riderParameters[i].formulaId = _.cloneDeep(this.parameters.riderParameters[i].formula);
        }
        for (let i = 0; i < this.parameters.payoutParameters.length; i++) {
          this.parameters.payoutParameters[i].formulaId = _.cloneDeep(this.parameters.payoutParameters[i].formula);
        }
      }
      this.firebase.getGlobalParameters().subscribe((resp) => {
        if (resp.size !== 0) {
          resp.docs.forEach((el) => {
            const data: any = el.data();
            data.id = el.id;
            this.value.values.push(data);
          });
        }
        this.value.values.forEach(input => {
          var re = new RegExp("\\b" + input.id + "\\b", 'g');
          for (let i = 0; i < this.parameters.basicParameters.length; i++) {
            this.parameters.basicParameters[i].formulaId = this.parameters.basicParameters[i].formulaId.replace(re, input.fieldName);
            if (this.parameters.basicParameters[i].globalParameterId === input.id) {
              this.parameters.basicParameters[i].parameter = input.fieldName;
              this.parameters.basicParameters[i].selected = '';
              if (input.type === 'variable') {
                this.parameters.basicParameters[i].type = input.variableType;
              } else {
                this.parameters.basicParameters[i].type = input.type;
              }
              if (input.type === 'dropdown') {
                this.parameters.basicParameters[i].fieldValues = input.fieldValue;
              }
            }
          }
          for (let i = 0; i < this.parameters.riderParameters.length; i++) {
            this.parameters.riderParameters[i].formulaId = this.parameters.riderParameters[i].formulaId.replace(re, input.fieldName);
            if (this.parameters.riderParameters[i].globalParameterId === input.id) {
              this.parameters.riderParameters[i].parameter = input.fieldName;
              this.parameters.riderParameters[i].selected = '';
              if (input.type === 'variable') {
                this.parameters.riderParameters[i].type = input.variableType;
              } else {
                this.parameters.riderParameters[i].type = input.type;
              }
              if (input.type === 'dropdown') {
                this.parameters.riderParameters[i].fieldValues = input.fieldValue;
              }
            }
          }
          for (let i = 0; i < this.parameters.payoutParameters.length; i++) {
            this.parameters.payoutParameters[i].formulaId = this.parameters.payoutParameters[i].formulaId.replace(re, input.fieldName);
            if (this.parameters.payoutParameters[i].globalParameterId === input.id) {
              this.parameters.payoutParameters[i].parameter = input.fieldName;
              this.parameters.payoutParameters[i].selected = '';
              if (input.type === 'variable') {
                this.parameters.payoutParameters[i].type = input.variableType;
              } else {
                this.parameters.payoutParameters[i].type = input.type;
              }
              if (input.type === 'dropdown') {
                this.parameters.payoutParameters[i].fieldValues = input.fieldValue;
              }
            }
          }
        });
      });
    });
    this.showPolicyDropdown = false;
  }
  public openSurgicalCodeDropdown(event, surgicalCode, arrIndex) {
    event.stopPropagation();
    if (!surgicalCode.showSurgicalCodeDropdown) {
      this.codeToSearch = '';
      this.resetSurgicalCodeDropdownArr(arrIndex);
      this.resetSelectedCode();
      this.updateSelectedCode(arrIndex);
    }
    for (let i = 0; i < this.insurance.surgicalCodes.length; i++) {
      if (i === arrIndex) {
        surgicalCode.showSurgicalCodeDropdown = !surgicalCode.showSurgicalCodeDropdown;
      } else {
        this.insurance.surgicalCodes[i].showSurgicalCodeDropdown = false;
      }
    }
  }
  public resetSelectedCode() {
    for (let i = 0; i < this.showSurgicalCodes.length; i++) {
      const element = this.showSurgicalCodes[i];
      element.isSelected = false;
    }
    this.insurance.surgicalCodes[0].selectedRowIndex = -1;
    this.insurance.surgicalCodes[1].selectedRowIndex = -1;
    this.insurance.surgicalCodes[2].selectedRowIndex = -1;
    return;
  }
  public updateSelectedCode(selectedCodeIndex) {
    for (let i = 0; i < this.showSurgicalCodes.length; i++) {
      const element = this.showSurgicalCodes[i];
      // ? match element.code with self
      if (element.code === this.insurance.surgicalCodes[selectedCodeIndex].code) {
        element.isSelected = true;
        this.insurance.surgicalCodes[selectedCodeIndex].selectedRowIndex = i;
      }
      // ? match with remaining two
      else {
        if (selectedCodeIndex === 0) {
          if (element.code === this.insurance.surgicalCodes[1].code) {
            element.isSelected = true;
            this.insurance.surgicalCodes[1].selectedRowIndex = i;
          } else if (element.code === this.insurance.surgicalCodes[2].code) {
            element.isSelected = true;
            this.insurance.surgicalCodes[2].selectedRowIndex = i;
          }
        } else if (selectedCodeIndex === 1) {
          if (element.code === this.insurance.surgicalCodes[0].code) {
            element.isSelected = true;
            this.insurance.surgicalCodes[0].selectedRowIndex = i;
          } else if (element.code === this.insurance.surgicalCodes[2].code) {
            element.isSelected = true;
            this.insurance.surgicalCodes[2].selectedRowIndex = i;
          }
        } else if (selectedCodeIndex === 2) {
          if (element.code === this.insurance.surgicalCodes[0].code) {
            element.isSelected = true;
            this.insurance.surgicalCodes[0].selectedRowIndex = i;
          } else if (element.code === this.insurance.surgicalCodes[1].code) {
            element.isSelected = true;
            this.insurance.surgicalCodes[1].selectedRowIndex = i;
          }
        }
      }
    }
    return;
  }
  public resetSurgicalCodeDropdownArr(arrIndex) {
    const index = 0;
    // ! case 3: value is selected in 1st & 2nd dropdown
    // ! show all codes for 1st & 2nd dropdowns;
    // ! for 3rd dropdown show all codes excluding the ones present in 1st & 2nd
    if (this.insurance.surgicalCodes[index].code !== ''
      && this.insurance.surgicalCodes[index + 1].code !== ''
      && this.insurance.surgicalCodes[index + 2].code === '') {
      // call(dp1, dp2,dp3)
      // this.call(index, index+1, index+2)
      // ? if 1st dropdown is opened;
      if (arrIndex === index) {
        this.showSurgicalCodes = _.cloneDeep(this.allSurgicalCodes);
      }
      // ? if 2nd dropdown is opened;
      else if (arrIndex === (index + 1)) {
        this.showSurgicalCodes = _.cloneDeep(this.allSurgicalCodes);
      }
      if (arrIndex === (index + 2)) {
        // ! if 1st dropdown value === 2nd dropdown value; show all codes
        if (this.insurance.surgicalCodes[index].code.substring(0, 2) === this.insurance.surgicalCodes[index + 1].code.substring(0, 2)) {
          // ? if 3rd dropdown is opened;
          this.showSurgicalCodes = _.filter(this.allSurgicalCodes, (code) => {
            return code.code.substring(0, 2) !== this.insurance.surgicalCodes[index + 1].code.substring(0, 2)
          });
        }
        // ! if 1st dropdown value !== 2nd dropdown value; show codes of 1st dropdown and 2nd dropdown only
        else {
          this.showSurgicalCodes = _.filter(this.allSurgicalCodes, (code) => {
            return code.code.substring(0, 2) === this.insurance.surgicalCodes[index].code.substring(0, 2)
              || code.code.substring(0, 2) === this.insurance.surgicalCodes[index + 1].code.substring(0, 2)
          });
        }
      }
    }
    // ! case 5: value is selected in 2nd & 3rd dropdown
    // ! show all codes for 2nd & 3rd dropdowns;
    // ! for 1st dropdown show all codes excluding the ones present in 2nd & 3rd
    else if (this.insurance.surgicalCodes[index].code === ''
      && this.insurance.surgicalCodes[index + 1].code !== ''
      && this.insurance.surgicalCodes[index + 2].code !== '') {
      // ? if 1st dropdown is opened;
      if (arrIndex === index) {
        // ! if 2nd dropdown value === 3rd dropdown value; show all codes
        if (this.insurance.surgicalCodes[index + 1].code.substring(0, 2) === this.insurance.surgicalCodes[index + 2].code.substring(0, 2)) {
          // ? if 1st dropdown is opened;
          this.showSurgicalCodes = _.filter(this.allSurgicalCodes, (code) => {
            return code.code.substring(0, 2) !== this.insurance.surgicalCodes[index + 1].code.substring(0, 2)
          });
        }
        // ! if 2nd dropdown value !== 3rd dropdown value; show codes of 2nd dropdown and 3rd dropdown only
        else {
          this.showSurgicalCodes = _.filter(this.allSurgicalCodes, (code) => {
            return code.code.substring(0, 2) === this.insurance.surgicalCodes[index + 1].code.substring(0, 2)
              || code.code.substring(0, 2) === this.insurance.surgicalCodes[index + 2].code.substring(0, 2)
          });
        }
      }
      // ? if 2nd dropdown is opened;
      else if (arrIndex === (index + 1)) {
        this.showSurgicalCodes = _.cloneDeep(this.allSurgicalCodes);
      }
      // ? if 3rd dropdown is opened;
      else if (arrIndex === (index + 2)) {
        this.showSurgicalCodes = _.cloneDeep(this.allSurgicalCodes);
      }
    }
    // ! case 6: 1st, 2nd & 3rd dropdowns are selected;
    // ! show combinations of 1&3, 1&2 and 1&2
    else if (this.insurance.surgicalCodes[index].code !== ''
      && this.insurance.surgicalCodes[index + 1].code !== ''
      && this.insurance.surgicalCodes[index + 2].code !== '') {
      // ! if 1st dropdown value === 2nd dropdown value
      if (this.insurance.surgicalCodes[index].code.substring(0, 2) === this.insurance.surgicalCodes[index + 1].code.substring(0, 2)) {
        // ? for 1st & 2nd dropdowns show codes in combination of 1st and 3rd
        if (arrIndex === index || (arrIndex === index + 1)) {
          this.showSurgicalCodes = _.filter(this.allSurgicalCodes, (code) => {
            return code.code.substring(0, 2) === this.insurance.surgicalCodes[index].code.substring(0, 2)
              || code.code.substring(0, 2) === this.insurance.surgicalCodes[index + 2].code.substring(0, 2)
          });
        }
        // ? for 3rd dropdown show codes excluding 1st & 2nd
        else if (arrIndex === index + 2) {
          this.showSurgicalCodes = _.filter(this.allSurgicalCodes, (code) => {
            return code.code.substring(0, 2) !== this.insurance.surgicalCodes[index].code.substring(0, 2)
          });
        }
      }
      // ! if 2nd dropdown value === 3rd dropdown value
      if (this.insurance.surgicalCodes[index + 1].code.substring(0, 2) === this.insurance.surgicalCodes[index + 2].code.substring(0, 2)) {
        // ? for 1st dropdown,
        if (arrIndex === index) {
          this.showSurgicalCodes = _.filter(this.allSurgicalCodes, (code) => {
            return code.code.substring(0, 2) !== this.insurance.surgicalCodes[index + 1].code.substring(0, 2)
          });
        }
        // ? for 2nd & 3rd dropdowns show codes in combination of 1st and 2nd
        else if ((arrIndex === index + 1) || (arrIndex === index + 2)) {
          this.showSurgicalCodes = _.filter(this.allSurgicalCodes, (code) => {
            return code.code.substring(0, 2) === this.insurance.surgicalCodes[index].code.substring(0, 2)
              || code.code.substring(0, 2) === this.insurance.surgicalCodes[index + 1].code.substring(0, 2)
          });
        }
      }
      // ! if 1st dropdown value === 3rd dropdown value
      if (this.insurance.surgicalCodes[index].code.substring(0, 2) === this.insurance.surgicalCodes[index + 2].code.substring(0, 2)) {
        // ? for 1st dropdown,
        if (arrIndex === index + 1) {
          this.showSurgicalCodes = _.filter(this.allSurgicalCodes, (code) => {
            return code.code.substring(0, 2) !== this.insurance.surgicalCodes[index].code.substring(0, 2)
          });
        }
        // ? for 1st & 3rd dropdowns show codes in combination of 1st and 2nd
        else if ((arrIndex === index) || (arrIndex === index + 2)) {
          this.showSurgicalCodes = _.filter(this.allSurgicalCodes, (code) => {
            return code.code.substring(0, 2) === this.insurance.surgicalCodes[index].code.substring(0, 2)
              || code.code.substring(0, 2) === this.insurance.surgicalCodes[index + 1].code.substring(0, 2)
          });
        }
      }
    }
    // ! case 1: initial condition;
    // ! show all codes for all dropdowns;
    // ! case 2: value is selected in 1st dropdown
    // ! show all codes for all dropdowns;
    // ! case 4: 1st & 2nd dropdown empty, 3rd dropdown is filled
    // ! show all codes for all dropdowns
    else {
      this.showSurgicalCodes = _.cloneDeep(this.allSurgicalCodes);
    }
    return;
  }
  public selectSurgicalCode(code, surgicalCode, codeIndex, rowIndex) {
    code.isSelected = true;
    if (this.insurance.surgicalCodes[rowIndex].code !== '') {
      const foundIndex = _.findIndex(this.showSurgicalCodes, (code) => {
        return code.code === this.insurance.surgicalCodes[rowIndex].code
      });
      if (foundIndex !== -1) {
        this.showSurgicalCodes[foundIndex].isSelected = false;
      }
    }
    this.insurance.surgicalCodes[rowIndex].selectedRowIndex = codeIndex;
    surgicalCode.code = code.code;
    surgicalCode.showSurgicalCodeDropdown = false;
  }
  public addPlan() {
    this.insurance.additionalPlans.push({
      planName: "",
      deductible: "",
    });
  }
  public deletePlan(i) {
    this.insurance.additionalPlans.splice(i, 1);
    this.calculateTotal();
  }
  public async openCalculator() {
    const modal = await this.modalController
      .create({
        component: CalculatorPage,
        componentProps: { noOfDays: this.insurance.insurerInformation.numberOfDayStay },
        cssClass: "calculator-modal",
        keyboardClose: true,
        // showBackdrop: true,
        backdropDismiss: false,
      })
      .then((modalEl1) => {
        modalEl1.present();
        modalEl1.onDidDismiss().then((resp) => {
          if (resp.data) {
            this.medisaveData = resp.data;
            if (resp.data.type) {
              this.insurance.insurerInformation.medisaveLimit =
                resp.data.withdrawalLimit;
              // this.calculatorData = resp.data;
            }
            if (resp.data.noOfDays) {
              this.insurance.insurerInformation.numberOfDayStay = resp.data.noOfDays;
            }
          }
        });
      });
  }
  public calculateMedisaveTotal() {
    let totalSelect = 0;
    if (this.medisaveData) {
      totalSelect = Number(this.medisaveData.table1.selectedAmt + this.medisaveData.table2.selectedAmt + this.medisaveData.table3.selectedAmt);
      if (!this.insurance.insurerInformation.numberOfDayStay || this.insurance.insurerInformation.numberOfDayStay === 0) {
        this.insurance.insurerInformation.medisaveLimit = '';
      } else if (this.insurance.insurerInformation.numberOfDayStay && this.insurance.insurerInformation.numberOfDayStay !== '') {
        // const tempTotal = Number(this.noOfDays) * totalSelect;
        // const tempTotal = Number(this.noOfDays) * totalSelect;
        if (this.medisaveData.type === 'Inpatient') {
          const tempTotal = (this.insurance.insurerInformation.numberOfDayStay * 450) + (Number(totalSelect));
          if (tempTotal < this.capLimit) {
            this.insurance.insurerInformation.medisaveLimit = tempTotal;
          } else {
            this.insurance.insurerInformation.medisaveLimit = this.capLimit;
          }
        } else {
          const tempTotal = (this.insurance.insurerInformation.numberOfDayStay * 300) + (Number(totalSelect));
          if (tempTotal < this.capLimit) {
            this.insurance.insurerInformation.medisaveLimit = tempTotal;
          } else {
            this.insurance.insurerInformation.medisaveLimit = this.capLimit;
          }
        }
      }
    }
  }
  public openPopover(event, obj, index, type) {
    event.stopPropagation();
    this.showInsurerDropdown = false;
    this.showConsultantDropdown = false;
    this.showPolicyDropdown = false;
    for (let i = 0; i < this.parameters.basicParameters.length; i++) {
      this.parameters.basicParameters[i].showDropdown = false;
      if (i === index && type === 'basic') {
        obj.isExclaimOpen = !obj.isExclaimOpen;
      } else {
        this.parameters.basicParameters[i].isExclaimOpen = false;
      }
    }
    for (let i = 0; i < this.parameters.riderParameters.length; i++) {
      this.parameters.riderParameters[i].showDropdown = false;
      if (i === index && type === 'rider') {
        obj.isExclaimOpen = !obj.isExclaimOpen;
      } else {
        this.parameters.riderParameters[i].isExclaimOpen = false;
      }
    }
    for (let i = 0; i < this.parameters.payoutParameters.length; i++) {
      this.parameters.payoutParameters[i].showDropdown = false;
      if (i === index && type === 'payout') {
        obj.isExclaimOpen = !obj.isExclaimOpen;
      } else {
        this.parameters.payoutParameters[i].isExclaimOpen = false;
      }
    }
  }
  public openDropdown(event, obj, index, type) {
    event.stopPropagation();
    this.showInsurerDropdown = false;
    this.showConsultantDropdown = false;
    this.showPolicyDropdown = false;
    for (let i = 0; i < this.parameters.basicParameters.length; i++) {
      this.parameters.basicParameters[i].isExclaimOpen = false;
      if (i === index && type === 'basic') {
        obj.showDropdown = !obj.showDropdown;
      } else {
        this.parameters.basicParameters[i].showDropdown = false;
      }
    }
    for (let i = 0; i < this.parameters.riderParameters.length; i++) {
      this.parameters.riderParameters[i].isExclaimOpen = false;
      if (i === index && type === 'rider') {
        obj.showDropdown = !obj.showDropdown;
      } else {
        this.parameters.riderParameters[i].showDropdown = false;
      }
    }
    for (let i = 0; i < this.parameters.payoutParameters.length; i++) {
      this.parameters.payoutParameters[i].isExclaimOpen = false;
      if (i === index && type === 'payout') {
        obj.showDropdown = !obj.showDropdown;
      } else {
        this.parameters.payoutParameters[i].showDropdown = false;
      }
    }
  }
  public selectValue(obj, value, type) {
    obj.selected = value.value;
    obj.showDropdown = false;
    this.calculate(type);
  }
  public close() {
    this.showPolicyDropdown = false;
    this.showInsurerDropdown = false;
    this.showConsultantDropdown = false;
    if (this.parameters && this.parameters.basicParameters && this.parameters.riderParameters && this.parameters.payoutParameters) {
      for (let i = 0; i < this.parameters.basicParameters.length; i++) {
        this.parameters.basicParameters[i].showDropdown = false;
        this.parameters.basicParameters[i].isExclaimOpen = false;
      }
      for (let i = 0; i < this.parameters.riderParameters.length; i++) {
        this.parameters.riderParameters[i].showDropdown = false;
        this.parameters.riderParameters[i].isExclaimOpen = false;
      }
      for (let i = 0; i < this.parameters.payoutParameters.length; i++) {
        this.parameters.payoutParameters[i].showDropdown = false;
        this.parameters.payoutParameters[i].isExclaimOpen = false;
      }
    }
    for (let i = 0; i < this.insurance.surgicalCodes.length; i++) {
      const element = this.insurance.surgicalCodes[i];
      element.showSurgicalCodeDropdown = false;
    }
  }
  public calculate(type) {
    let inputCalculator;
    // if (type === "rider") {
    this.parameters.riderParameters.forEach((input) => {
      this.calculateFormula(input, inputCalculator);
    });
    // } else if (type === "basic") {
    this.parameters.basicParameters.forEach((input) => {
      this.calculateFormula(input, inputCalculator);
    });
    // } else if (type === "payout") {
    this.parameters.payoutParameters.forEach((input) => {
      this.calculateFormula(input, inputCalculator);
    });
    // }
  }
  public calculateFormula(input, inputCalculator) {
    if (input.type === "Formula") {
      inputCalculator = input.formula;
      this.parameters.basicParameters.forEach((variable) => {
        var re = new RegExp("\\b" + variable.globalParameterId + "\\b", 'g');
        inputCalculator = inputCalculator.replace(re, variable.selected);
        try {
          const temp = eval(inputCalculator);
          input.selected = temp.toFixed(2);
        } catch (e) {
          if (input.selected === undefined) {
            alert("Enter correct formula");
          }
        }
      });
      this.parameters.riderParameters.forEach((variable) => {
        var re = new RegExp("\\b" + variable.globalParameterId + "\\b", 'g');
        inputCalculator = inputCalculator.replace(re, variable.selected);
        try {
          const temp = eval(inputCalculator);
          input.selected = temp.toFixed(2);
        } catch (e) {
          if (input.selected === undefined) {
            alert("Enter correct formula");
          }
        }
      });
      this.parameters.payoutParameters.forEach((variable) => {
        var re = new RegExp("\\b" + variable.globalParameterId + "\\b", 'g');
        inputCalculator = inputCalculator.replace(re, variable.selected);
        try {
          const temp = eval(inputCalculator);
          input.selected = temp.toFixed(2);
        } catch (e) {
          if (input.selected === undefined) {
            alert("Enter correct formula");
          }
        }
      });
    }
  }
  public generatePdfAndShare() {
    this.dataService.present().then((a) => {
      a.present();
      this.fileName = 'ISP_Calculation.pdf';
      const element = document.getElementById('isp-pdf-wrap');
      const opt = {
        margin: [30, 10],
        filename: this.fileName,
        html2canvas: {
          useCORS: true,
          // backgroundColor: null,
          scale: 1,
        },
        image: { type: 'jpg', quality: 0.95 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        // pagebreak: { mode: ['css', 'legacy'] }
      };
      const that = this;
      html2pdf()
        .set(opt)
        .from(element)
        .toPdf()
        .get('pdf')
        .then((pdf) => {
          const totalPages = pdf.internal.getNumberOfPages();
          // tslint:disable-next-line: max-line-length
          const watermarkBase64 = 'data:image/png;base64,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'
            + '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'
            + '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'
            + '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';
          for (let i = 0; i < totalPages; i++) {
            pdf.setPage(i);
            const width = pdf.internal.pageSize.getWidth();
            const height = pdf.internal.pageSize.getHeight();
            // pdf.addImage(that.watermarkImg, 'PNG', 0, 0, width, height);
            pdf.addImage(watermarkBase64, 'PNG', 0, 0);
          }
        })
        .output('datauristring').then((resp) => {
          // 
          this.file = resp;
          this.shareSocialMedia();
        });
    });
  }
  public generatePdfAndDownload() {
    this.fileName = 'ISP_Calculation.pdf';
    const element = document.getElementById('isp-pdf-wrap');
    const opt = {
      margin: [30, 10],
      filename: this.fileName,
      html2canvas: {
        useCORS: true,
        // backgroundColor: null,
        scale: 1,
      },
      image: { type: 'jpg', quality: 0.95 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      // pagebreak: { mode: ['css', 'legacy'] }
    };
    const that = this;
    html2pdf()
      .set(opt)
      .from(element)
      .toPdf()
      .get('pdf')
      .then((pdf) => {
        const totalPages = pdf.internal.getNumberOfPages();
        // tslint:disable-next-line: max-line-length
        const watermarkBase64 = 'data:image/png;base64,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';
        for (let i = 0; i < totalPages; i++) {
          pdf.setPage(i);
          const width = pdf.internal.pageSize.getWidth();
          const height = pdf.internal.pageSize.getHeight();
          // pdf.addImage(that.watermarkImg, 'PNG', 0, 0, width, height);
          pdf.addImage(watermarkBase64, 'PNG', 0, 0, width, height);
        }
      }).save();
  }
  public shareSocialMedia() {
    if (this.file.includes('filename=generated.pdf;')) {
      this.file = this.file.replace('filename=generated.pdf;', 'filename=' + this.fileName + ';');
    }
    if (this.file.includes('filename=attachment.pdf;')) {
      this.file = this.file.replace('filename=attachment.pdf;', 'filename=' + this.fileName + ';');
    }
    if (!this.internetCheckFlag) {
      this.socialSharing.share('ISP Calculation', 'ISP Calculation', this.file, null)
        .then((resp) => {
          this.dataService.dismiss();
        })
        .catch((err) => {
          this.dataService.dismiss();
        });
    } else {
      this.dataService.dismiss();
      this.dataService.presentAlert('Please check your internet connection!');
    }
  }
  calculateTotal() {
    this.insurance.additionalPlanTotal = 0;
    for (let i = 0; i < this.insurance.additionalPlans.length; i++) {
      this.insurance.additionalPlanTotal = this.insurance.additionalPlanTotal + this.insurance.additionalPlans[i].deductible;
    }
  }
  searchSurgicalCode() {
    this.showSurgicalCodes.forEach((code) => {
      if (code.code.toLowerCase().includes(this.codeToSearch.toLowerCase()) || this.codeToSearch === '') {
        code.show = true;
      } else {
        code.show = false;
      }
    });
  }
  public enterValue(event) {
    event.stopPropagation();
  }
  ionViewWillLeave() {
    if (this.userSnapshotSub) {
      this.userSnapshotSub.unsubscribe();
    }
  }
}
