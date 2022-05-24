/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @angular-eslint/use-lifecycle-interface */
/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/prefer-for-of */
import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { MenuController } from '@ionic/angular';
import * as _ from 'lodash';
import { AppDataService } from 'src/app/services/app-data.service';
import { FirebaseService } from 'src/app/services/firebase.service';
declare let SelectPure: any;
@Component({
  selector: 'app-case-approval',
  templateUrl: './case-approval.page.html',
  styleUrls: ['./case-approval.page.scss'],
})
export class CaseApprovalPage implements OnInit {
  nameToSearch = '';
  clientAssignedAgentsChanged = false;
  public isPopoverOpen = false;
  public showStatusDropdown = false;
  public showAmendmentSectionDropdown = false;
  public showAssignedAgentDropdown = false;
  public selectedAgents = [];
  public showConsultantDropdown = false;
  public showPrimaryAgentDropdown = false;
  public Status = [
    {
      status: 'Approved',
      show: true
    },
    {
      status: 'Temporary Approval',
      show: true
    },
    {
      status: 'Resubmission for temporary approval',
      show: true
    },
    {
      status: 'Rejected',
      show: true
    }
  ];
  // selectedAmendmentSection = '-';
  public selectedStatus = '';
  // selectedConsultant = '';
  // caseApproval: any = {};
  public agentList = [];
  public optionalItems = '';
  public agentSelector;
  public amendmentSelector;
  public case: any = {};
  public prevCaseServiceType;
  public prevCaseSalesCredit;
  prevPrimaryConsultant;
  public previousCaseStatus: any = {};
  public previouslyAssignedAgents = [];
  public caseStatus: any = {
    status: '',
    signature: '',
    signedBy: '',
    userType: '',
    userId: '',
    date: null,
    comments: '',
    amendmentSection: [],
  };
  public loggedInUser: any;
  public clientData: any;
  public isDrawing = false;
  public signature;
  public allAmendmentSection = [
    {
      id: 1,
      name: 'Profile',
      selected: false,
      show: true
    },
    {
      id: 2,
      name: 'Case',
      selected: false,
      show: true
    },
    {
      id: 3,
      name: 'Active Policies',
      selected: false,
      show: true
    },
    {
      id: 4,
      name: 'Insurance Docs',
      selected: false,
      show: true
    },
    {
      id: 5,
      name: 'Medical History',
      selected: false,
      show: true
    },
    {
      id: 6,
      name: 'Medical Condition',
      selected: false,
      show: true
    },
    {
      id: 7,
      name: 'Pre-adm Checklist',
      selected: false,
      show: true
    },
    {
      id: 8,
      name: 'Preview',
      selected: false,
      show: true
    },
    {
      id: 9,
      name: 'Case Submission',
      selected: false,
      show: true
    },
    {
      id: 10,
      name: 'Letter of Consent',
      selected: false,
      show: true
    },
    {
      id: 11,
      name: 'Travel Declaration',
      selected: false,
      show: true
    },
  ];
  public emptyList = '';
  public assignedConsultants = [];
  public selectedAgentIds = [];
  public removedAgents = [];
  public ehealth: any;
  // public allowAdminToEdit = true;
  public internetCheckFlag = false;
  public reloadAgain = true;
  public consultantComments: any;
  public selectedAmendmentSection = '';
  showServiceTypeDropdown = false;
  showSalesCreditDropdown = false;
  serviceTypes = [];
  // serviceTypes = ['OGD', 'Ortho', 'ENT', 'Others'];
  salesCredit = [];
  caseSnapshotSub: any;
  multiUserSnapshotSub: any;
  patient: any;
  selectedPrimaryConsultant = '';
  selectedSalesCredit = '';
  constructor(private firebaseService: FirebaseService,
    public dataService: AppDataService,
    private menuCtrl: MenuController,
    private router: Router) { }
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
    this.dataService.present().then((loader) => {
      loader.present();
      this.caseStatus = {
        status: '',
        signature: '',
        signedBy: '',
        userType: '',
        userId: '',
        date: null,
        comments: '',
        amendmentSection: [],
      };
      this.loggedInUser = this.dataService.getUserData();
      const casedata = this.dataService.getSelectedCase();
      this.case = _.cloneDeep(casedata);
      this.patient = this.dataService.getPatientData();
      this.clientAssignedAgentsChanged = false;
      this.selectedSalesCredit = '';
      this.consultantComments = '';
      this.firebaseService.getServiceType().subscribe((resp: any) => {
        this.serviceTypes = [];
        if (resp.size > 0) {
          _.forEach(resp.docs, (doc) => {
            this.serviceTypes.push({ type: doc.data().service, show: true });
          });
        } else {
          this.serviceTypes = [
            { type: 'OGD', show: true },
            { type: 'Ortho', show: true },
            { type: 'ENT', show: true },
            { type: 'Others', show: true }
          ];
        }
      });
      this.caseSnapshotSub = this.firebaseService.getOneCase(casedata.id).subscribe((resp) => {
        if (resp.id === casedata.id) {
          this.case = resp;
          this.case.serviceType = this.case.serviceType || '';
          this.prevCaseServiceType = _.cloneDeep(this.case.serviceType);
          this.prevCaseSalesCredit = _.cloneDeep(this.case.salesCredit);
          if (!this.case.primaryConsultant || this.case.primaryConsultant === '') {
            this.case.primaryConsultant = this.patient.assignedToAgentId;
          }
          this.prevPrimaryConsultant = _.cloneDeep(this.case.primaryConsultant);
          this.case.salesCredit = this.case.salesCredit || '';
          this.dataService.setSelectedCase(this.case);
          if (this.case.caseStatus.length > 0) {
            const index = this.case.caseStatus.length - 1;
            // ? for comparing info in db with currently showing case status info
            this.previousCaseStatus = this.case.caseStatus[index];
            if (!this.previousCaseStatus.amendmentSection) {
              this.previousCaseStatus.amendmentSection = [];
            }
            this.previouslyAssignedAgents = _.cloneDeep(this.case.assignTo);
            if (this.case.caseStatus[index].status === 'Pending Approval') {
              this.selectedStatus = '-';
            } else if (this.case.caseStatus[index].status === 'Resubmitted for approval') {
              this.selectedStatus = 'Resubmission for temporary approval';
              this.consultantComments = this.case.caseStatus[index].comments;
              this.caseStatus.comments = '';
            } else {
              this.selectedStatus = this.case.caseStatus[index].status;
              // this.caseApproval.comments = this.case.caseStatus[index].comments || '';
              this.caseStatus.comments = this.case.caseStatus[index].comments || '';
              this.caseStatus.amendmentSection = this.case.caseStatus[index].amendmentSection || [];
              this.caseStatus.signature = this.case.caseStatus[index].signature;
              this.caseStatus.signedBy = this.case.caseStatus[index].signedBy;
            }
            // this.caseApproval.status = this.case.caseStatus[index].currentStatus;
            this.caseStatus.status = this.case.caseStatus[index].status;
          } else {
            const status = this.case.currentStatus === 'Pending' ? 'Pending Submission' : this.case.currentStatus;
            this.caseStatus = {
              status,
              signature: '',
              signedBy: '',
              userType: '',
              userId: '',
              date: null,
              comments: '',
              amendmentSection: [],
            };
            this.selectedStatus = status;
            this.previousCaseStatus = this.caseStatus;
          }
          this.multiUserSnapshotSub = this.firebaseService.getMultipleUsers(['agent', 'Finance Manager', 'Finance User', 'Claims Manager', 'Claims User', 'Management']).subscribe((agents) => {
            // this.agentList = agents;
            // this.agentList = _.filter(agents, (agent) => {
            //   if (agent.type === 'agent' || agent.type === 'Finance Manager' || agent.type === 'Claims Manager') {
            //     return agent;
            //   }
            // });
            // ? client change:- show all users in consultants' dropdowns (dated 06-jan-2022)
            this.agentList = _.cloneDeep(agents);
            this.salesCredit = _.cloneDeep(agents);
            const selectedSalesCredit = _.find(agents, (agent) => agent.id === this.case.salesCredit);
            if (selectedSalesCredit) {
              this.selectedSalesCredit = selectedSalesCredit.name;
            }
            this.selectedAgents = [];
            // tslint:disable-next-line: prefer-for-of
            for (let i = 0; i < this.agentList.length; i++) {
              this.agentList[i].isSelected = false;
              for (let j = 0; j < this.case.assignTo.length; j++) {
                const element = this.case.assignTo[j];
                if (element === this.agentList[i].id) {
                  this.selectedAgents.push({ name: this.agentList[i].name, id: this.agentList[i].id, show: true });
                }
              }
              if (this.agentList[i].id === this.case.primaryConsultant) {
                this.selectedPrimaryConsultant = this.agentList[i].name;
              }
            }
            // ! get user with type='consultant'
            // tslint:disable-next-line: no-shadowed-variable
            // this.firebaseService.getUsers('consultant').subscribe((agents) => {
            //   // tslint:disable-next-line: prefer-for-of
            //   for (let i = 0; i < agents.length; i++) {
            //     agents[i].isSelected = false;
            //     this.agentList.push(agents[i]);
            //   }
            // this.assignedToAgent = this.agentList.filter(agent => {
            //   return agent.id === this.clientDetails.assignedToAgentId;
            // });
            // if (this.assignedToAgent && this.assignedToAgent.length === 1) {
            //   this.selectedAgent = this.assignedToAgent[0].name;
            //   this.selectedAgentId = this.assignedToAgent[0].id;
            // }
            // ? initialize select-pure dropdown for assigned agents
            // if (document.getElementsByClassName('select-pure__select').length === 0) {
            // if (document.getElementsByClassName('select-pure__select--multiple').length === 0) {
            //   const agentlist = this.createSelectPureInputFromArray(this.agentList, 'agent');
            //   const amendmentlist = this.createSelectPureInputFromArray(this.allAmendmentSection, 'amendment-section');
            //   // this.agentSelector = this.countryList('.agent-selector', this.selectedAgentIds, agentlist, 'agent');
            //   this.agentSelector = this.countryList('.agent-selector', this.case.assignTo, agentlist, 'agent');
            //   // tslint:disable-next-line: max-line-length
            //   // ? select pure not needed for amendment section
            //   // this.amendmentSelector = this.countryList('.amendment-selection', this.caseStatus.amendmentSection, amendmentlist, 'amendment-section');
            // }
            // });
            this.firebaseService.getclientDetails(casedata.clientId).subscribe((data) => {
              data.docs.forEach((resp) => {
                this.clientData = resp.data();
                this.clientData.id = resp.id;
              });
            });
          });
        }
      });
      // this.firebaseService.getEhealth(casedata.id).subscribe((data) => {
      //   this.ehealth = data.docs[0].data();
      //   this.ehealth.id = data.docs[0].id;
      // });
      this.ehealth = this.dataService.getEhealthData();
      if (loader) {
        this.dataService.dismiss();
      }
    });
  }
  public createSelectPureInputFromArray(array, type) {
    const tempArray = [];
    for (let i = 0; i < _.size(array); i++) {
      const newObj = {
        label: array[i].name,
        value: array[i].id,
      };
      if (type === 'amendment-section') {
        newObj.value = newObj.label;
      }
      tempArray.push(newObj);
    }
    return tempArray;
  }
  public getUsersNotPresentInGivenTypes(options, initialValue) {
    if (initialValue) {
      const notAssigendAgent = initialValue.filter(
        val => !options.some(opt => opt.value === val)
      );
      if (notAssigendAgent.length > 0) {
        return [];
      } else {
        return initialValue;
      }
    } else {
      return [];
    }
  }
  public countryList(className: any, initialValue: any, options: any, type) {
    if (type === 'agent') {
      initialValue = this.getUsersNotPresentInGivenTypes(options, initialValue);
    }
    return new SelectPure(className, {
      options,
      multiple: true,
      autocomplete: true,
      value: initialValue,
      icon: 'label-cross',
      classNames: {
        select: 'select-pure__select--case-approval',
        dropdownShown: 'select-pure__select--opened',
        multiselect: 'select-pure__select--multiple',
        label: 'select-pure__label',
        placeholder: 'select-pure__placeholder',
        dropdown: 'select-pure__options',
        option: 'select-pure__option',
        autocompleteInput: 'select-pure__autocomplete',
        selectedLabel: 'select-pure__selected-label',
        selectedOption: 'select-pure__option--selected',
        placeholderHidden: 'select-pure__placeholder--hidden',
        optionHidden: 'select-pure__option--hidden',
      },
      onChange: (value) => {
        // ? value is an array for multi-select
        if (type === 'agent') {
          // this.caseApproval.consultant = value;
          this.case.assignTo = value;
          this.signature = '';
          this.caseStatus.signature = '';
          // ? make array of object for assignedConsultants
          const date = new Date().toString();
          // if (this.selectedAgentIds.length !== value.length) {
          // _.forEach(value, consultant => {
          //   _.forEach(this.selectedAgentIds, agentid => {
          //     if (agentid !== consultant) {
          //       obj = {
          //         fromDate: date,
          //         toDate: '',
          //         agentId: consultant
          //       };
          //       this.assignedConsultants.push(obj);
          //     } else {
          //     }
          //   });
          // });
          // }
          // const diffArray = _.difference(this.selectedAgentIds, value)
          //
          // // ? 'difference(array1,array2)' returns the values present in array1 and not in array2
          // // ? if diffArray.length > 0, it means agent is/are removed;
          // // ? if diffArray.length = 0, it means agent is added again;
          // if (diffArray.length > 0) {
          //   for (let i = 0; i < diffArray.length; i++) {
          //     const element = diffArray[i];
          //     let foundAgent: any
          //     foundAgent = _.find(this.case.assignTo, element);
          //     foundAgent.toRemove = true;
          //   }
          // } else if (diffArray.length === 0) {
          //   this.case.assignTo.some(agent => {
          //     _.forEach(value, agentid => {
          //     })
          //   })
          // }
        } else if (type === 'amendment-section') {
          // this.caseApproval.amendmentSection = value;
          this.caseStatus.amendmentSection = value;
          this.signature = '';
        }
      },
    });
  }
  public openDropdown(event, type) {
    event.stopPropagation();
    this.nameToSearch = '';
    if (type === 'status') {
      this.Status = this.dataService.searchFromDropdownList(this.Status, this.nameToSearch, 'status');
      this.showAmendmentSectionDropdown = false;
      this.showServiceTypeDropdown = false;
      this.showSalesCreditDropdown = false;
      this.showAssignedAgentDropdown = false;
      this.showStatusDropdown = !this.showStatusDropdown;
    } else if (type === 'amendment-section') {
      this.allAmendmentSection = this.dataService.searchFromDropdownList(this.allAmendmentSection, this.nameToSearch, 'name');
      this.showStatusDropdown = false;
      this.showServiceTypeDropdown = false;
      this.showSalesCreditDropdown = false;
      this.showAssignedAgentDropdown = false;
      this.resetAmendmentDropdown();
      this.showAmendmentSectionDropdown = !this.showAmendmentSectionDropdown;
    } else if (type === 'service-type') {
      this.serviceTypes = this.dataService.searchFromDropdownList(this.serviceTypes, this.nameToSearch, 'type');
      this.showStatusDropdown = false;
      this.showAssignedAgentDropdown = false;
      this.showAmendmentSectionDropdown = false;
      this.showSalesCreditDropdown = false;
      this.showServiceTypeDropdown = !this.showServiceTypeDropdown;
    } else if (type === 'sales-credit') {
      this.salesCredit = this.dataService.searchFromDropdownList(this.salesCredit, this.nameToSearch, 'name');
      this.showStatusDropdown = false;
      this.showAmendmentSectionDropdown = false;
      this.showServiceTypeDropdown = false;
      this.showAssignedAgentDropdown = false;
      this.showSalesCreditDropdown = !this.showSalesCreditDropdown;
    } else if (type === 'assigned-agent') {
      this.agentList = this.dataService.searchFromDropdownList(this.agentList, this.nameToSearch, 'type');
      this.showStatusDropdown = false;
      this.showAmendmentSectionDropdown = false;
      this.showServiceTypeDropdown = false;
      this.showSalesCreditDropdown = false;
      this.resetAgentDropdown();
      this.showAssignedAgentDropdown = !this.showAssignedAgentDropdown;
    } else if (type === 'primary-agent') {
      this.agentList = this.dataService.searchFromDropdownList(this.agentList, this.nameToSearch, 'type');
      this.showStatusDropdown = false;
      this.showAmendmentSectionDropdown = false;
      this.showServiceTypeDropdown = false;
      this.showSalesCreditDropdown = false;
      this.showAssignedAgentDropdown = false;
      this.showPrimaryAgentDropdown = !this.showPrimaryAgentDropdown;
    }
  }
  public openConsultantDropdown() {
    this.showConsultantDropdown = !this.showConsultantDropdown;
  }
  public selectStatus(status) {
    this.selectedStatus = status;
    this.showStatusDropdown = false;
    // this.caseApproval.status = status;
    this.caseStatus.status = status;
    this.case.currentStatus = status;
    if (status === 'Approved') {
      this.caseStatus.amendmentSection = [];
      this.resetAmendmentDropdown();
      // if (this.ehealth.caseResubmission) {
      //   this.ehealth.caseResubmission.comments = '-';
      //   this.ehealth.caseResubmission.date = '-';
      // }
    }
    if (this.selectedStatus !== this.previousCaseStatus.status) {
      this.caseStatus.signature = '';
      this.caseStatus.signedBy = '';
    }
  }
  selectServiceType(type) {
    this.case.serviceType = type;
    this.showServiceTypeDropdown = false;
  }
  selectSalesCredit(credit) {
    this.case.salesCredit = credit.id;
    this.selectedSalesCredit = credit.name;
    this.showSalesCreditDropdown = false;
  }
  done(type) {
    if (type === 'amend-section') {
      this.caseStatus.amendmentSection = [];
      _.forEach(this.allAmendmentSection, (o) => {
        if (o.selected) {
          this.caseStatus.amendmentSection.push(o.name);
        }
      });
      this.showAmendmentSectionDropdown = false;
      const val = this.checkIfAmendmentSectionChanged();
      if (val) {
        this.caseStatus.signature = '';
        this.caseStatus.signedBy = '';
      }
    } else {
      this.selectedAgents = [];
      _.forEach(this.agentList, (o) => {
        if (o.selected) {
          this.selectedAgents.push({ name: o.name, id: o.id });
        }
      });
      this.showAssignedAgentDropdown = false;
      this.case.assignTo = [];
      _.forEach(this.selectedAgents, (agent) => {
        this.case.assignTo.push(agent.id);
      });
      const val = this.checkIfAgentsChanged();
      if (val) {
        this.caseStatus.signature = '';
        this.caseStatus.signedBy = '';
      }
    }
  }
  cancel(type) {
    if (type === 'amend-section') {
      this.showAmendmentSectionDropdown = false;
      this.resetAmendmentDropdown();
    } else {
      this.showAssignedAgentDropdown = false;
      this.resetAgentDropdown();
    }
  }
  selectPrimaryConsultant(event, agent) {
    event.stopPropagation();
    this.case.primaryConsultant = agent.id;
    this.selectedPrimaryConsultant = agent.name;
    this.showPrimaryAgentDropdown = false;
    // ? change assignedConsultant
    if (!this.case.assignTo.includes(agent.id)) {
      this.case.assignTo.push(agent.id);
      this.selectedAgents.push({ name: agent.name, id: agent.id });
    }
    if (this.case.primaryConsultant !== this.prevPrimaryConsultant) {
      this.caseStatus.signature = '';
      this.caseStatus.signedBy = '';
    }
  }
  checkIfAgentIsPrimaryConsultant(agent, event) {
    event.stopPropagation();
    if (agent.id === this.case.primaryConsultant) {
      this.dataService.presentAlert('Cannot remove primary consultant from \'Assigned Consultants\'');
      agent.selected = true;
    } else {
      agent.selected = !agent.selected;
    }
  }
  resetAmendmentDropdown() {
    for (let i = 0; i < this.allAmendmentSection.length; i++) {
      const data = this.allAmendmentSection[i];
      data.selected = false;
    }
    for (let i = 0; i < this.allAmendmentSection.length; i++) {
      const data = this.allAmendmentSection[i];
      for (let j = 0; j < this.caseStatus.amendmentSection.length; j++) {
        const section = this.caseStatus.amendmentSection[j];
        if (data.name === section) {
          data.selected = true;
        }
      }
    }
  }
  resetAgentDropdown() {
    for (let i = 0; i < this.agentList.length; i++) {
      const data = this.agentList[i];
      data.selected = false;
    }
    for (let i = 0; i < this.agentList.length; i++) {
      const data = this.agentList[i];
      for (let j = 0; j < this.selectedAgents.length; j++) {
        const section = this.selectedAgents[j];
        if (data.id === section.id) {
          data.selected = true;
        }
      }
    }
    this.agentList = _.orderBy(this.agentList, 'selected', 'desc');
  }
  stopEvent(event) {
    event.stopPropagation();
  }
  checkForAdditionOrRemovalOfAgents() {
    return new Promise((resolve) => {
      _.forEach(this.case.assignTo, (agentId) => {
        if (!this.patient.assignedTo.includes(agentId)) {
          this.patient.assignedTo.push(agentId);
          this.clientAssignedAgentsChanged = true;
        }
      });
      const caselist = [];
      this.firebaseService.getCase(this.patient.id).subscribe((resp) => {
        resp.docs.forEach((doc) => {
          const casedata: any = doc.data();
          casedata.id = doc.id;
          caselist.push(casedata);
        });
        this.addOrRemoveAgentIds(caselist);
        resolve(true);
      });
    });
  }
  addOrRemoveAgentIds(caselist) {
    caselist = _.map(caselist, (casedata => {
      if (casedata.id === this.case.id) {
        casedata = _.cloneDeep(this.case);
      }
      return casedata;
    }));
    const nonExistAgentId = [];
    _.forEach(this.patient.assignedTo, (agentId) => {
      let exist = false;
      _.forEach(caselist, (casedata) => {
        if (casedata.assignTo.includes(agentId)) {
          exist = true;
        }
      });
      if (!exist) {
        const foundAt = _.findIndex(this.patient.assignedTo, (e) => e === agentId);
        if (foundAt > -1) {
          this.clientAssignedAgentsChanged = true;
          this.patient.assignedTo.splice(foundAt, 1);
        }
      }
    });
    return;
  }
  public saveChanges() {
    if (this.previousCaseStatus.status === 'Drop off before consultation' || this.previousCaseStatus.status === 'Drop off after consultation') {
      this.dataService.presentAlertMessage('Case Dropped Off!', 'Cannot update info');
    } else {
      this.dataService.present().then(async (loader) => {
        loader.present();
        this.reloadAgain = false;
        // ? shifted below lines to done(); to make user sign when assignedAgents are changed
        // this.case.assignTo = [];
        // _.forEach(this.selectedAgents, (agent) => {
        //   this.case.assignTo.push(agent.id);
        // });
        const isAgentsChanged = this.checkIfAgentsChanged();
        if (isAgentsChanged) {
          // ? check whether new agent is assigned or previous agent is removed in client doc
          await this.checkForAdditionOrRemovalOfAgents();
        }
        const isAmendmentSectionChanged = this.checkIfAmendmentSectionChanged();
        // ! check if anything is changed, if yes then only fire query?
        if (this.previousCaseStatus
          && (this.previousCaseStatus.status === this.caseStatus.status
            && (this.previousCaseStatus.comments === this.caseStatus.comments)
            && !isAgentsChanged
            && !isAmendmentSectionChanged
            && (this.case.serviceType === '' || (this.case.serviceType !== '' && this.case.serviceType === this.prevCaseServiceType))
            && (this.case.salesCredit !== '' && this.case.salesCredit === this.prevCaseSalesCredit)
            && (this.case.primaryConsultant !== '' && this.case.primaryConsultant === this.prevPrimaryConsultant)
          )) {
          this.dataService.presentAlert('Nothing to update!');
          this.dataService.dismiss();
        } else if (this.selectedStatus === 'Select' || this.selectedStatus === '' || this.selectedStatus === '-') {
          this.dataService.presentAlert('Please select status!');
          this.dataService.dismiss();
        } else if (this.case.assignTo.length === 0) {
          this.dataService.presentAlert('Please select atleast 1 agent!');
          this.dataService.dismiss();
        } else if (this.case.primaryConsultant === '') {
          this.dataService.presentAlert('Please select primary consultant!');
          this.dataService.dismiss();
        } else if (this.case.salesCredit === '') {
          this.dataService.presentAlert('Please select sales credit agent!');
          this.dataService.dismiss();
        } else if ((this.caseStatus.status === 'Pending' ||
          this.caseStatus.status === 'Temporary Approval' ||
          this.caseStatus.status === 'Pending Approval' ||
          this.caseStatus.status === 'Submitted for approval' ||
          this.caseStatus.status === 'Resubmission for temporary approval' ||
          this.caseStatus.status === 'Rejected') &&
          this.caseStatus.amendmentSection.length === 0) {
          this.dataService.presentAlert('Please select amendment section!');
          this.dataService.dismiss();
        } else {
          // this.openConfirmationModal();
          this.setCaseDataToFirebase();
        }
      });
    }
  }
  public setCaseDataToFirebase() {
    let date;
    date = new Date().toString();
    this.caseStatus.date = date;
    this.case.lastUpdateDate = date;
    this.case.lastUpdateTimestamp = new Date(date).getTime();
    // this.checkIfAgentRemoved(date);
    // this.case.assignTo.push(this.assignedConsultants);
    // for (let i = 0; i < this.assignedConsultants.length; i++) {
    //   this.case.assignTo.push(this.assignedConsultants[i]);
    // }
    this.caseStatus.userType = this.loggedInUser.type;
    this.caseStatus.userId = this.loggedInUser.id;
    // this.caseStatus.comments = this.caseApproval.comments;
    // this.caseStatus.amendmentSection = this.caseApproval.amendmentSection;
    this.case.caseStatus.push(this.caseStatus);
    // ! update 'assignedToAgentId' in ehealth.profile? => not needed
    // ? update case status in case collection
    if (!this.internetCheckFlag) {
      // ? update primary consultant as 'assignedToAgentId' in user doc only if primary consultant in case is changed
      if (this.patient.assignedToAgentId !== this.case.primaryConsultant) {
        // ? update 'assignedToAgentId' in user doc
        this.patient.assignedToAgentId = this.case.primaryConsultant;
        this.editPatientData();
      } else if (this.clientAssignedAgentsChanged) {
        // ? update assignedConsultants in user doc
        this.editPatientData();
      } else {
        this.editCaseData();
      }
    } else {
      this.dataService.dismiss();
      this.dataService.presentAlert('Please check your internet connection!');
    }
  }
  editPatientData() {
    this.firebaseService.editUser(this.patient).then(() => {
      this.dataService.setPatientData(this.patient);
      this.clientAssignedAgentsChanged = false;
      this.editCaseData();
    }).catch(() => {
      // ? present alert that says 'something went wrong. try again'
      this.dataService.dismiss();
    });
  }
  editCaseData() {
    this.firebaseService.editCase(this.case).then(() => {
      this.dataService.setSelectedCase(this.case);
      this.previousCaseStatus = this.caseStatus;
      this.previouslyAssignedAgents = this.case.assignTo;
      // ? update this case status in timeline
      // this.updateTimeline();
      const timelineStatus: any = {
        date: new Date().toString(),
        activity: 'Case ' + this.caseStatus.status,
        userType: this.loggedInUser.type,
        userId: this.loggedInUser.id,
        caseId: this.case.id,
      };
      this.clientData.timeline.push(timelineStatus);
      // if (this.case.currentStatus === 'Approved') {
      //   // ? if case.cuurentStatus is 'approved', comments and date in ehealth.resubmission should be '-'
      //   // ? hence fire edit query for ehealth collection;
      // this.firebaseService.editEhealth(this.ehealth).then(() => {
      this.dataService.updateTimelineData(timelineStatus, this.clientData.clientId);
      this.dataService.dismiss();
      this.dataService.presentAlert('Case status updated successfully!');
      // });
      // } else {
      //   this.dataService.updateTimelineData(timelineStatus, this.clientData.clientId);
      //   this.dataService.dismiss();
      //   this.dataService.presentAlert('Case status updated successfully!');
      // }
    }).catch(() => {
      // ? present alert that says 'something went wrong. try again'
      this.dataService.dismiss();
    });
  }
  public checkIfAgentRemoved(date) {
    // ! check if any agent is removed; then add toDate
    // ? if length of selectedAgentIds > that of assignedConsultants, it means agent is removed;
    // ? so add 'toDate' to that obj in case.assignTo
    // if (this.selectedAgentIds.length > this.assignedConsultants.length) {
    const diffArray = _.differenceBy(this.selectedAgentIds, this.assignedConsultants, 'agentId');
    // }
  }
  // public checkIfAgentsChanged() {
  //   let isAgentChanged = false;
  //   if (this.previouslyAssignedAgents.length !== this.assignedConsultants.length) {
  //     isAgentChanged = true;
  //   } else {
  //     let agentPresentCount = 0;
  //     _.forEach(this.previouslyAssignedAgents, (prevAgent) => {
  //       // if (_.includes(this.case.assignTo, prevAgent)) {
  //       //   agentPresentCount++;
  //       // }
  //       _.forEach(this.assignedConsultants, (newAgent) => {
  //         if (prevAgent.agentId === newAgent.agentId) {
  //           agentPresentCount++;
  //         }
  //       });
  //     });
  //     if (this.previouslyAssignedAgents.length !== agentPresentCount) {
  //       isAgentChanged = true;
  //     }
  //   }
  //   return isAgentChanged;
  // }
  public checkIfAgentsChanged() {
    let isAgentChanged = false;
    if (this.previouslyAssignedAgents.length !== this.case.assignTo.length) {
      isAgentChanged = true;
    } else {
      let agentPresentCount = 0;
      _.forEach(this.previouslyAssignedAgents, (prevAgent) => {
        if (_.includes(this.case.assignTo, prevAgent)) {
          agentPresentCount++;
        }
      });
      if (this.previouslyAssignedAgents.length !== agentPresentCount) {
        isAgentChanged = true;
      }
    }
    return isAgentChanged;
  }
  public checkIfAmendmentSectionChanged() {
    let isAmendmentChanged = false;
    if (this.previousCaseStatus.amendmentSection.length !== this.caseStatus.amendmentSection.length) {
      isAmendmentChanged = true;
    } else {
      let amendmentPresentCount = 0;
      _.forEach(this.previousCaseStatus.amendmentSection, (prevAmendment) => {
        if (_.includes(this.caseStatus.amendmentSection, prevAmendment)) {
          amendmentPresentCount++;
        }
      });
      if (this.previousCaseStatus.amendmentSection.length !== amendmentPresentCount) {
        isAmendmentChanged = true;
      }
    }
    return isAmendmentChanged;
  }
  public openPopover() {
    this.dataService.openCaseApprovalTimelineSidebar();
  }
  public openSignatureModal() {
    this.dataService.signatureModal(this.caseStatus.signature).then((resp) => {
      const response: any = resp;
      if (response.status === 'success') {
        this.caseStatus.signature = response.signature;
        this.caseStatus.signedBy = this.loggedInUser.name;
      } else {
        this.caseStatus.signature = '';
      }
    });
  }
  public closeAllDropdowns() {
    this.showStatusDropdown = false;
    this.showServiceTypeDropdown = false;
    this.showSalesCreditDropdown = false;
    this.showAmendmentSectionDropdown = false;
  }
  public ionViewWillLeave() {
    // this.menuCtrl.close('case-status-timeline');
    this.agentSelector = undefined;
    this.closeAllDropdowns();
    this.dataService.closeCaseApprovalTimelineSidebar();
    if (this.caseSnapshotSub) {
      this.caseSnapshotSub.unsubscribe();
    }
    if (this.multiUserSnapshotSub) {
      this.multiUserSnapshotSub.unsubscribe();
    }
  }
}
