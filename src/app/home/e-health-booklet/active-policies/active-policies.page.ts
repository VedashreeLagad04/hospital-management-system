/* eslint-disable @angular-eslint/use-lifecycle-interface */
/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/prefer-for-of */
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import * as _ from 'lodash';
import { AppDataService } from 'src/app/services/app-data.service';
import { FirebaseService } from 'src/app/services/firebase.service';
@Component({
  selector: 'app-active-policies',
  templateUrl: './active-policies.page.html',
  styleUrls: ['./active-policies.page.scss'],
})
export class ActivePoliciesPage implements OnInit {
  nameToSearch = '';
  // tslint:disable-next-line: max-line-length
  public plans = ['Corporate Plan', 'Critical Illness Plan', 'Early Critical Illness Plan', ' Global Medical Plan', 'Hospital Income Plan', 'Hospitalisation (Shield) Plan', 'Life Insurance', 'Personal Accident Plan', 'Term Plan', 'Wica Plan'];
  public frequencies = [];
  // tslint:disable-next-line: max-line-length
  public modes = [];
  // public modes = ['Medisave Only', 'Medisave + Cash', 'Medisave + Credit Card', 'Medisave + Cheque', 'Cash', 'Credit Card', 'Cheque', 'Giro', 'Company'];
  public ridermodes = [];
  // public ridermodes = ['Cash','Credit Card','Cheque','Giro','Company'];
  public allRiderNames = [];
  public insurers: any = [];
  public mainPlanNames = [];
  public aia = ['AIA MAX A', 'AIA MAX + ESSENTIAL'];
  public ntuc = ['NTUC VITALITY A', 'NTUC VITALITY B'];
  public GE = ['GE Health'];
  public clientId;
  public case;
  public mode = 'preview';
  public insurerDetails = [];
  public riderDetails = [];
  public commonEhealthData;
  public policy: any = {
    activePolicies: [
      {
        showPlanDropdown: false,
        showFrequencyDropdown: false,
        showRiderFrequencyDropdown: false,
        showModeDropdown: false,
        showRiderModeDropdown: false,
        showInsurerDropdown: false,
        showMainPlanDropdown: false,
        planType: '',
        insurer: '',
        mainPlanName: '',
        mainInceptionDate: '',
        mainPaidDate: '',
        mainFrequencyOfPayment: '',
        mainModeOfPayment: '',
        mainChangeOfInsurer: '',
        mainChangeOfInsurerReason: '',
        mainUpgradeOfPlan: '',
        mainUpgradeOfPlanReason: '',
        mainPendingClaim: '',
        mainExclusion: '',
        mainRemarks: '',
        riderPlanName: '',
        riderInceptionDate: '',
        riderPaidDate: '',
        riderFrequencyofPayment: '',
        riderModeOfPayment: '',
        riderCopyOfPolicy: '',
        riderCopyOfPolicyReason: '',
        riderPendingClaim: '',
        riderExclusion: '',
        riderChangeOfInsurer: '',
        riderChangeOfInsurerReason: '',
        riderUpgradeOfPlan: '',
        riderUpgradeOfPlanReason: '',
        riderRemarks: '',
      },
    ],
  };
  public loggedInUser;
  public eventInstance: any;
  public eventArray: any;
  public internetCheckFlag = false;
  public reloadAgain = true;
  public activeRouteSubscriber: any;
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
        this.router.routeReuseStrategy.shouldReuseRoute = () => false;
        if (this.reloadAgain) {
          this.ionViewDidEnter();
        }
        this.dataService.toastPresent('Internet Connected');
        this.internetCheckFlag = false;
      }
    });
  }
  public ngOnDestroy() {
    if (this.dataService.mySubscription) {
      this.dataService.mySubscription.unsubscribe();
    }
  }
  public ionViewDidEnter() {
    this.mode = 'preview';
    this.dataService.present().then((a) => {
      a.present();
      this.getDropdownValues();
      this.activeRouteSubscriber = this.activeRoute.paramMap.subscribe((params) => {
        this.clientId = params.get('id');
        this.loggedInUser = this.dataService.getUserData();
        this.case = this.dataService.getSelectedCase();
        this.firebase.getCommonEheallthData(this.clientId).subscribe((resp) => {
          if (resp && resp.docs && resp.docs.length > 0) {
            this.commonEhealthData = resp.docs[0].data();
            this.commonEhealthData.id = resp.docs[0].id;
          }
        })
        this.getInsurerDetails();
        // this.firebase.getEhealth(this.case.id).subscribe((resp) => {
        //   resp.docs.forEach((temp) => {
        //     this.policy = temp.data();
        //     this.policy.id = temp.id;
        //     
        //   });
        this.policy = this.dataService.getEhealthData();
        const textareas = document.getElementsByTagName('textarea');
        // tslint:disable-next-line: prefer-for-of
        for (let i = 0; i < textareas.length; i++) {
          const element = textareas[i];
          // element.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'start' });
          element.scrollTop = 0;
        }
        console.log('this.policy.activePolicies: ', this.policy.activePolicies);
        if (this.policy.activePolicies.length === 0) {
          this.policy.activePolicies = [
            {
              showPlanDropdown: false,
              showFrequencyDropdown: false,
              showRiderFrequencyDropdown: false,
              showModeDropdown: false,
              showRiderModeDropdown: false,
              showRiderNameDropdown: false,
              showInsurerDropdown: false,
              showMainPlanDropdown: false,
              planType: 'Hospitalisation (Shield) Plan',
              insurer: '',
              mainPlanName: '',
              mainInceptionDate: '',
              mainPaidDate: '',
              mainFrequencyOfPayment: 'Annual',
              mainModeOfPayment: 'Medisave Only',
              mainChangeOfInsurer: 'Yes',
              mainChangeOfInsurerReason: '',
              mainUpgradeOfPlan: 'Yes',
              mainUpgradeOfPlanReason: '',
              mainPendingClaim: '',
              mainPendingClaimAnswer: 'Yes',
              mainPendingClaimsArr: [{ claim: '' }],
              mainExclusion: '',
              mainExclusionAnswer: 'Yes',
              mainExclusionArr: [{ exclusion: '' }],
              mainRemarks: '',
              riderPlanName: '',
              riderInceptionDate: '',
              riderPaidDate: '',
              riderFrequencyOfPayment: 'Annual',
              riderModeOfPayment: 'Cash',
              riderCopyOfPolicy: 'No',
              riderCopyOfPolicyReason: '',
              riderPendingClaim: '',
              riderPendingClaimAnswer: 'Yes',
              riderPendingClaimArr: [{ claim: '' }],
              riderExclusion: '',
              riderExclusionAnswer: 'Yes',
              riderExclusionArr: [{ exclusion: '' }],
              riderChangeOfInsurer: 'Yes',
              riderChangeOfInsurerReason: '',
              riderUpgradeOfPlan: 'Yes',
              riderUpgradeOfPlanReason: '',
              riderRemarks: '',
            },
          ];
        } else {
          for (let i = 0; i < this.policy.activePolicies.length; i++) {
            const policy = this.policy.activePolicies[i];
            if (policy.mainPendingClaimAnswer === undefined) {
              policy.mainPendingClaimAnswer = 'Yes';
              policy.mainPendingClaimsArr = [{ claim: '' }];
            }
            if (policy.mainExclusionAnswer === undefined) {
              policy.mainExclusionAnswer = 'Yes';
              policy.mainExclusionArr = [{ exclusion: '' }];
            }
            if (i === 0 && policy.riderPendingClaimAnswer === undefined) {
              policy.riderPendingClaimAnswer = 'Yes';
              policy.riderPendingClaimArr = [{ claim: '' }];
            }
            if (i === 0 && policy.riderExclusionAnswer === undefined) {
              policy.riderExclusionAnswer = 'Yes';
              policy.riderExclusionArr = [{ exclusion: '' }];
            }
          }
        }
        this.dataService.dismiss();
      });
      // });
    });
  }
  public getInsurerDetails() {
    this.firebase.getInsurer().subscribe((resp) => {
      const data = [];
      if (resp.size !== 0) {
        resp.docs.forEach((element) => {
          const temp: any = element.data();
          temp.id = element.id;
          data.push(temp);
        });
        const insurerDetails = [];
        const planTypeList = [];
        _.map(_.groupBy(data, 'planType'), (vals, planType) => {
          const plans: any = [];
          vals.forEach((el) => {
            plans.push(el);
          });
          const temp = {
            planType,
            plans,
            show: true
          };
          planTypeList.push(temp);
        });
        planTypeList.forEach(value => {
          const plan = this.getInsurerGroup(value.plans);
          value.plans = plan;
        });
        this.insurerDetails = planTypeList;
        this.getRiderPlans();
      }
      return;
    });
  }
  getInsurerGroup(plans) {
    const result = [];
    _.map(_.groupBy(plans, 'insurer'), (vals, insurer) => {
      const mainPlanName: any = [];
      vals.forEach((el) => {
        mainPlanName.push({ planName: el.mainPlanName, show: true });
      });
      const temp = {
        insurer,
        mainPlanName,
      };
      result.push(temp);
    });
    return result;
  }
  public getRiderPlans() {
    this.firebase.getRiderPlans().subscribe((resp) => {
      const plans = [];
      if (resp.size > 0) {
        resp.docs.forEach(element => {
          const temp: any = element.data();
          temp.id = element.id;
          plans.push(temp);
        });
        const riderPlanName = [];
        _.map(_.groupBy(plans, 'insurer'), (vals, insurer) => {
          const riderPlanName: any = [];
          vals.forEach((el) => {
            riderPlanName.push({ planName: el.riderPlanName, show: true });
          });
          const temp = {
            insurer,
            riderPlanName,
            show: true
          };
          this.riderDetails.push(temp);
        });
        // ? set mainPlanNames[] and riderPlanNames[] for dropdown
        _.forEach(this.policy.activePolicies, (policy) => {
          if (policy.insurer && policy.insurer !== '') {
            const insurerplanType = _.find(this.insurerDetails, ['planType', policy.planType]);
            const insurerplan = _.find(insurerplanType.plans, ['insurer', policy.insurer]);
            if (insurerplan) {
              this.mainPlanNames.push(insurerplan.mainPlanName);
              // this.mainPlanNames = insurerplan.mainPlanName;
            }
            const riderplan = _.find(this.riderDetails, ['insurer', policy.insurer]);
            if (riderplan) {
              this.allRiderNames = riderplan.riderPlanName || [];
            }
          }
        });
      }
      return;
    });
  }
  getDropdownValues() {
    this.firebase.getFrequencyOfPayment().subscribe((resp: any) => {
      this.frequencies = [];
      if (resp.size > 0) {
        _.forEach(resp.docs, (doc) => {
          this.frequencies.push({ frequency: doc.data().frequency, show: true });
        });
      } else {
        this.frequencies = [
          {
            frequency: 'Annual',
            show: true
          },
          {
            frequency: 'Quarterly',
            show: true
          },
          {
            frequency: 'Monthly',
            show: true
          },
        ];
      }
    });
    this.firebase.getMainModeOfPayment().subscribe((resp: any) => {
      this.modes = [];
      if (resp.size > 0) {
        _.forEach(resp.docs, (doc) => {
          this.modes.push({ mode: doc.data().mode, show: true });
        });
      } else {
        this.modes = [
          {
            mode: 'Medisave Only',
            show: true
          },
          {
            mode: 'Medisave + Cash',
            show: true
          },
          {
            mode: 'Medisave + Credit Card',
            show: true
          },
          {
            mode: 'Medisave + Cheque',
            show: true
          },
          {
            mode: 'Cash',
            show: true
          },
          {
            mode: 'Credit Card',
            show: true
          },
          {
            mode: 'Cheque',
            show: true
          },
          {
            mode: 'Giro',
            show: true
          },
          {
            mode: 'Company',
            show: true
          },
        ];
      }
    });
    this.firebase.getRiderModeOfPayment().subscribe((resp: any) => {
      this.ridermodes = [];
      if (resp.size > 0) {
        _.forEach(resp.docs, (doc) => {
          this.ridermodes.push({ mode: doc.data().mode, show: true });
        });
        console.log('this.ridermodes: ', this.ridermodes);
      } else {
        this.ridermodes = [
          {
            mode: 'Cash',
            show: true
          },
          {
            mode: 'Credit Card',
            show: true
          },
          {
            mode: 'Cheque',
            show: true
          },
          {
            mode: 'Giro',
            show: true
          },
          {
            mode: 'Company',
            show: true
          }
        ];
      }
    });
  }
  public openPlanDropdown(activePolicies, event) {
    event.stopPropagation();
    this.closeAllDropdowns();
    this.nameToSearch = '';
    this.insurerDetails = this.dataService.searchFromDropdownList(this.insurerDetails, this.nameToSearch, 'planType');
    activePolicies.showPlanDropdown = !activePolicies.showPlanDropdown;
  }
  public selectPlan(plan, activePolicies) {
    activePolicies.showPlanDropdown = false;
    activePolicies.planType = plan.planType;
  }
  public openFrequencyDropdown(activePolicies, event) {
    event.stopPropagation();
    this.closeAllDropdowns();
    this.nameToSearch = '';
    this.frequencies = this.dataService.searchFromDropdownList(this.frequencies, this.nameToSearch, 'frequency');
    activePolicies.showFrequencyDropdown = !activePolicies.showFrequencyDropdown;
  }
  public openRiderNameDropdown(activePolicies, event) {
    event.stopPropagation();
    this.closeAllDropdowns();
    this.nameToSearch = '';
    this.allRiderNames = this.dataService.searchFromDropdownList(this.allRiderNames, this.nameToSearch, 'planName');
    activePolicies.showRiderNameDropdown = !activePolicies.showRiderNameDropdown;
  }
  public selectFrequency(frequency, activePolicies) {
    activePolicies.showFrequencyDropdown = false;
    activePolicies.mainFrequencyOfPayment = frequency;
  }
  public selectRiderName(name, activePolicies) {
    activePolicies.showRiderNameDropdown = false;
    activePolicies.riderPlanName = name;
  }
  public openRiderFrequencyDropdown(activePolicies, event) {
    event.stopPropagation();
    this.closeAllDropdowns();
    this.nameToSearch = '';
    this.frequencies = this.dataService.searchFromDropdownList(this.frequencies, this.nameToSearch, 'frequency');
    activePolicies.showRiderFrequencyDropdown = !activePolicies.showRiderFrequencyDropdown;
  }
  public openInsurerDropdown(activePolicies, event, i) {
    event.stopPropagation();
    this.closeAllDropdowns();
    this.nameToSearch = '';
    const temp = _.find(this.insurerDetails, ['planType', activePolicies.planType]);
    if (temp && _.size(temp.plans) !== 0) {
      const data = [];
      temp.plans.forEach(el => {
        data.push({ insurer: el.insurer, show: true });
      });
      this.insurers[i] = data;
    } else {
      this.insurers = [];
    }
    activePolicies.showInsurerDropdown = !activePolicies.showInsurerDropdown;
  }
  public openNameDropdown(activePolicies, event) {
    event.stopPropagation();
    this.closeAllDropdowns();
    activePolicies.showNameDropdown = !activePolicies.showNameDropdown;
  }
  public selectRiderFrequency(frequency, activePolicies) {
    activePolicies.showRiderFrequencyDropdown = false;
    activePolicies.riderFrequencyOfPayment = frequency;
  }
  public selectName(mainPlanName, activePolicies) {
    activePolicies.showNameDropdown = false;
    activePolicies.mainPlanName = mainPlanName;
  }
  public selectInsurer(insurer, activePolicies, i) {
    activePolicies.showInsurerDropdown = false;
    activePolicies.insurer = insurer;
    activePolicies.mainPlanName = '';
    activePolicies.riderPlanName = '';
    const mainplan = _.find(this.insurerDetails, ['planType', activePolicies.planType]);
    const mainplanFinal = _.find(mainplan.plans, ['insurer', insurer]);
    if (mainplanFinal) {
      this.mainPlanNames[i] = mainplanFinal.mainPlanName;
    } else {
      this.mainPlanNames[i] = [];
    }
    const riderplan = _.find(this.riderDetails, ['insurer', insurer]);
    if (riderplan) {
      this.allRiderNames = riderplan.riderPlanName;
    } else {
      this.allRiderNames = [];
    }
    // if (insurer === 'AIA') {
    //   this.mainPlanNames = this.aia;
    // } else if (insurer === 'NTUC') {
    //   this.mainPlanNames = this.ntuc;
    // } else if (insurer === 'Great Eastern') {
    //   this.mainPlanNames = this.GE;
    // }
  }
  public openModeDropdown(activePolicies, event) {
    event.stopPropagation();
    this.closeAllDropdowns();
    this.nameToSearch = '';
    this.modes = this.dataService.searchFromDropdownList(this.modes, this.nameToSearch, 'mode');
    activePolicies.showModeDropdown = !activePolicies.showModeDropdown;
  }
  public openMainPlanDropdown(activePolicies, event, i) {
    event.stopPropagation();
    this.closeAllDropdowns();
    this.nameToSearch = '';
    this.mainPlanNames[i] = this.dataService.searchFromDropdownList(this.mainPlanNames[i], this.nameToSearch, 'planName');
    activePolicies.showMainPlanDropdown = !activePolicies.showMainPlanDropdown;
  }
  public selectMainPlan(mainPlanName, activePolicies) {
    activePolicies.showMainPlanDropdown = false;
    activePolicies.mainPlanName = mainPlanName;
  }
  public selectMode(mode, activePolicies) {
    activePolicies.showModeDropdown = false;
    activePolicies.mainModeOfPayment = mode;
  }
  public openRiderModeDropdown(activePolicies, event) {
    event.stopPropagation();
    this.closeAllDropdowns();
    this.nameToSearch = '';
    this.ridermodes = this.dataService.searchFromDropdownList(this.ridermodes, this.nameToSearch, 'mode');
    activePolicies.showRiderModeDropdown = !activePolicies.showRiderModeDropdown;
  }
  public selectRiderMode(mode, activePolicies) {
    activePolicies.showRiderModeDropdown = false;
    activePolicies.riderModeOfPayment = mode;
  }
  public add() {
    this.policy.activePolicies.push(
      {
        planType: '',
        insurer: '',
        mainPlanName: '',
        mainInceptionDate: '',
        mainPaidDate: '',
        mainFrequencyOfPayment: 'Annual',
        mainModeOfPayment: 'Cash',
        mainChangeOfInsurer: 'Yes',
        mainChangeOfInsurerReason: '',
        mainUpgradeOfPlan: 'Yes',
        mainUpgradeOfPlanReason: '',
        mainPendingClaim: '',
        mainPendingClaimAnswer: 'Yes',
        mainPendingClaimsArr: [{ claim: '' }],
        mainExclusionAnswer: 'Yes',
        mainExclusionArr: [{ exclusion: '' }],
        mainExclusion: '',
        mainRemarks: '',
      },
    );
    setTimeout(() => {
      const lastIndex = this.policy.activePolicies.length - 1;
      document.getElementById('policy-' + lastIndex).scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'start' });
    }, 100);
  }
  public closeAllDropdowns() {
    // tslint:disable-next-line: prefer-for-of
    for (let i = 0; i < this.policy.activePolicies.length; i++) {
      const element = this.policy.activePolicies[i];
      element.showFrequencyDropdown = false;
      element.showInsurerDropdown = false;
      element.showMainPlanDropdown = false;
      element.showModeDropdown = false;
      element.showNameDropdown = false;
      element.showPlanDropdown = false;
      element.showRiderFrequencyDropdown = false;
      element.showRiderModeDropdown = false;
      element.showRiderNameDropdown = false;
    }
  }
  public delete(index) {
    this.policy.activePolicies.splice(index, 1);
  }
  public edit() {
    this.mode = 'edit';
  }
  public saveChanges() {
    this.dataService.present().then((a) => {
      a.present();
      const textareas = document.getElementsByTagName('textarea');
      this.reloadAgain = false;
      // tslint:disable-next-line: prefer-for-of
      for (let i = 0; i < textareas.length; i++) {
        const element = textareas[i];
        element.scrollTop = 0;
      }
      this.mode = 'preview';
      this.policy.preview.signatureFlag = true;
      this.policy.preview.activePolicies = this.policy.activePolicies;
      // tslint:disable-next-line: prefer-for-of
      for (let i = 0; i < this.policy.activePolicies.length; i++) {
        const element = this.policy.activePolicies[i];
        delete element.showFrequencyDropdown;
        delete element.showRiderFrequencyDropdown;
        delete element.showModeDropdown;
        delete element.showRiderModeDropdown;
        delete element.showPlanDropdown;
        if (element.mainChangeOfInsurer && element.mainChangeOfInsurer === 'No') {
          element.mainChangeOfInsurerReason = '';
        }
        if (element.mainUpgradeOfPlan && element.mainUpgradeOfPlan === 'No') {
          element.mainUpgradeOfPlanReason = '';
        }
        if (element.riderCopyOfPolicy && element.riderCopyOfPolicy === 'Yes') {
          element.riderCopyOfPolicyReason = '';
        }
        if (element.riderChangeOfInsurer && element.riderChangeOfInsurer === 'No') {
          element.riderChangeOfInsurerReason = '';
        }
        if (element.riderUpgradeOfPlan && element.riderUpgradeOfPlan === 'No') {
          element.riderUpgradeOfPlanReason = '';
        }
      }
      this.policy.checkboxValue.activePoliciesTab = true;
      if (!this.internetCheckFlag) {
        if (this.dataService.isLatestCase && this.commonEhealthData) {
          this.commonEhealthData.activePolicies = this.policy.activePolicies;
          this.firebase.editCommonEheathData(this.commonEhealthData).then(() => {
            this.firebase.editEhealth(this.policy).then(() => {
              this.addPolicyDetailsToAdmission();
            }).catch(() => {
              this.dataService.dismiss();
            });
          }).catch(() => {
            this.dataService.dismiss();
          });
        } else {
          this.firebase.editEhealth(this.policy).then(() => {
            this.addPolicyDetailsToAdmission();
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
  addPolicyDetailsToAdmission() {
    this.firebase.getAdmissionOnce(this.case.id).subscribe((res: any) => {
      if (res.docs.length > 0) {
        const admission = res.docs[0].data();
        admission.id = res.docs[0].id;
        for (let i = 0; i < admission.policy.length; i++) {
          const policy = admission.policy[i];
          const claim = admission.claims[i];
          for (let j = 0; j < this.policy.activePolicies.length; j++) {
            const activepolicy = this.policy.activePolicies[j];
            if (policy.nameOfPolicy === activepolicy.planType) {
              policy.nameOfPolicy = activepolicy.planType;
              policy.insurer = activepolicy.insurer;
              policy.typeOfPolicy = activepolicy.mainPlanName;
              policy.nameOfBasic = activepolicy.mainPlanName;
              if (activepolicy.mainInceptionDate) {
                let date;
                let inceptionDate;
                date = new Date(activepolicy.mainInceptionDate);
                const today = this.dataService.formatDateAndMonth(date);
                inceptionDate = today.split('/')[0];
                if (i == 0) {
                  policy.nameOfRider = activepolicy.riderPlanName.length !== 0 ? activepolicy.riderPlanName : '-';
                  policy.basicInceptionDate = inceptionDate;
                } else {
                  policy.policyInceptionDate = inceptionDate;
                }
                if (i === 0 && activepolicy.riderInceptionDate) {
                  // tslint:disable-next-line: no-shadowed-variable
                  let date;
                  let riderInceptionDate;
                  date = new Date(activepolicy.riderInceptionDate);
                  const today = this.dataService.formatDateAndMonth(date);
                  riderInceptionDate = today.split('/')[0];
                  policy.riderInceptionDate = riderInceptionDate;
                }
              }
              // ? change policy name and type in claims
              if (claim) {
                claim.policyType = policy.nameOfPolicy;
                if (i === 0) {
                  claim.policyName = policy.nameOfBasic + ' + ' + policy.nameOfRider;
                } else {
                  claim.policyName = policy.nameOfBasic;
                }
              }
            }
          }
        }
        this.editPoliciesInAdmission(admission)
      } else {
        const obj = {
          tabName: 'active-policies',
          value: true,
        };
        this.dataService.setCheckboxValue(obj);
        this.dataService.setEhealthData(this.policy);
        this.dataService.dismiss();
        this.dataService.presentAlert('Policies updated successfully!');
      }
    });
  }
  editPoliciesInAdmission(admission) {
    this.firebase.editAdmission(admission).then((resp) => {
      const obj = {
        tabName: 'active-policies',
        value: true,
      };
      this.dataService.setCheckboxValue(obj);
      this.dataService.setEhealthData(this.policy);
      this.dataService.dismiss();
      this.dataService.presentAlert('Policies updated successfully!');
    });
  }
  public addPendingClaim(type, policy) {
    if (type === 'main') {
      policy.mainPendingClaimsArr.push({ claim: '' });
    } else if (type === 'rider') {
      policy.riderPendingClaimArr.push({ claim: '' });
    }
  }
  public removePendingClaim(type, policy, index) {
    if (type === 'main') {
      policy.mainPendingClaimsArr.splice(index, 1);
    } else if (type === 'rider') {
      policy.riderPendingClaimArr.splice(index, 1);
    }
  }
  public addExclusion(type, policy) {
    if (type === 'main') {
      policy.mainExclusionArr.push({ exclusion: '' });
    } else if (type === 'rider') {
      policy.riderExclusionArr.push({ exclusion: '' });
    }
  }
  public removeExclusion(type, policy, index) {
    if (type === 'main') {
      policy.mainExclusionArr.splice(index, 1);
    } else if (type === 'rider') {
      policy.riderExclusionArr.splice(index, 1);
    }
  }
  public ionViewWillLeave() {
    document.getElementById('activePoliciesContainer').scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'start' });
    if (this.activeRouteSubscriber) {
      this.activeRouteSubscriber.unsubscribe();
    }
  }
}
