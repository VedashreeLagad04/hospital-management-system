/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/prefer-for-of */
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import * as _ from 'lodash';
import { AppDataService } from 'src/app/services/app-data.service';
import { FirebaseService } from 'src/app/services/firebase.service';
@Component({
  selector: 'app-case-management',
  templateUrl: './case-management.page.html',
  styleUrls: ['./case-management.page.scss'],
})
export class CaseManagementPage implements OnInit {
  public casesPresent = true;
  dateType = 'admission';
  public nameToSearch = '';
  public allCases = [];
  public clientUsers = [];
  public agentUsers = [];
  public pendingSubmissionCount = 0;
  public pendingApprovalCount = 0;
  public pendingAdmissionCount = 0;
  public admittedCount = 0;
  public dischargeCount = 0;
  public verifiedCount = 0;
  public pendingAppointmentCount = 0;
  public temporaryApprovalCount = 0;
  public pendingConsultationCount = 0;
  public approvedCount = 0;
  public dischargeDocNotSubmittedCount = 0;
  public completedDocumentCount = 0;
  public outpatientCount = 0;
  public pendingAdmissionDocumentCount = 0;
  public resubmissionApprovalCount = 0;
  public pendingFollowUpCount = 0;
  public droppOffAfterConsultCount = 0;
  public droppOffBeforeConsultCount = 0;
  public filters = [];
  public sortingObject = {
    patientName: 'asc',
    caseName: 'asc',
    consultant: 'asc',
    caseNumber: 'asc',
    dateOfStatusChange: 'asc',
  };
  public loggedInUser;
  public showCases: any = [];
  public selectedStatus;
  public filterDateFrom;
  public filterDateTo;
  public isFilterStartDateclicked = false;
  public isFilterEndDateclicked = false;
  userSnapshotSub: any;
  multiUserSnapshotSub: any;
  ehealthSnapshotSub: any;
  allPatientIds = [];
  allAdmissions = [];
  constructor(private firebase: FirebaseService, private dataService: AppDataService, private router: Router, private cd: ChangeDetectorRef) { }
  public ngOnInit() {
  }
  public ionViewDidEnter() {
    this.nameToSearch = '';
    this.casesPresent = true;
    this.loggedInUser = this.dataService.getUserData();
    const obj = {
      title: 'Case Management',
      backPage: '/user-home/' + this.loggedInUser.id,
    };
    this.dataService.setHeaderTitle(obj);
    const allInputCheckboxes = document.getElementsByClassName('status-checkbox');
    //
    _.forEach(allInputCheckboxes, (box: any) => {
      box.checked = false;
    });
    this.filters = [];
    this.allPatientIds = [];
    const date = new Date();
    const first = date.getDate() - date.getDay();
    const last = first + 6;
    const firstDay = new Date(date.setDate(first)).toUTCString();
    const lastDay = new Date(new Date().setDate(last)).toUTCString();
    const date1ToString = firstDay.toString();
    const newDate1 = date1ToString.split(' ')[2] + ' ' + date1ToString.split(' ')[1] + ' ' + date1ToString.split(' ')[3];
    this.filterDateFrom = newDate1;
    const date2ToString = lastDay.toString();
    const newDate2 = date2ToString.split(' ')[2] + ' ' + date2ToString.split(' ')[1] + ' ' + date2ToString.split(' ')[3];
    this.filterDateTo = newDate2;
    // ? set only isFilterStartDateclicked to true because getData() is called twice on ionChange for both dates
    this.isFilterStartDateclicked = true;
    // this.getData();
  }
  public getData() {
    this.dataService.present().then((loader) => {
      loader.present();
      const startAt = new Date(this.filterDateFrom).getTime();
      const endAt = (new Date(this.filterDateTo).getTime()) + 86400000;
      // this.userSnapshotSub = this.firebase.getUsers('client').subscribe((data) => {
      //   this.clientUsers = data;
      // });
      this.multiUserSnapshotSub = this.firebase.getMultipleUsers(['agent', 'Finance Manager', 'Claims Manager']).subscribe((data) => {
        this.agentUsers = data;
      });
      let admData;
      this.allCases = [];
      this.allPatientIds = [];
      this.showCases = [];
      this.allAdmissions = [];
      this.clientUsers = [];
      const tempAdm = [];
      if (this.dateType === 'admission') {
        this.firebase.getDatewiseAdmissions(startAt, endAt).subscribe((resp: any) => {
          if (resp.size > 0) {
            let count = 0;
            const patientCount = 0;
            resp.docs.forEach(data => {
              admData = data.data();
              admData.admissionId = data.id;
              this.allAdmissions.push(admData);
              tempAdm.push({
                caseId: admData.caseId,
                patientType: admData.case.patientType
              });
              if (this.loggedInUser.type === 'agent') {
                this.firebase.getDateWiseCasesAssignedToAgent(this.loggedInUser.id, admData.caseId).subscribe((res: any) => {
                  count++;
                  if (res.docs.length > 0) {
                    const temp: any = res.docs[0].data();
                    temp.id = res.docs[0].id;
                    const patientType: any = _.find(tempAdm, (patient: any) => patient.caseId === temp.id);
                    temp.patientType = patientType.patientType;
                    this.allCases.push(temp);
                    const idAlreadyPresent = _.findIndex(this.allPatientIds, (patient) => patient.id === temp.clientId) === -1 ? false : true;
                    if (!idAlreadyPresent) {
                      this.allPatientIds.push({ id: temp.clientId, found: false, data: null });
                    }
                  }
                  if (resp.docs.length === count) {
                    // this.mergeArrays();
                    this.getPatientsFromCases(patientCount);
                  }
                });
              } else {
                this.firebase.getCaseForClaimsManagement(admData.caseId).subscribe((res) => {
                  count++;
                  const temp: any = res.data();
                  temp.id = res.id;
                  const patientType: any = _.find(tempAdm, (patient: any) => patient.caseId === temp.id);
                  temp.patientType = patientType.patientType;
                  this.allCases.push(temp);
                  const idAlreadyPresent = _.findIndex(this.allPatientIds, (patient) => patient.id === temp.clientId) === -1 ? false : true;
                  if (!idAlreadyPresent) {
                    this.allPatientIds.push({ id: temp.clientId, found: false, data: null });
                  }
                  if (resp.docs.length === count) {
                    // this.mergeArrays();
                    this.getPatientsFromCases(patientCount);
                  }
                });
              }
            });

          } else {
            this.casesPresent = this.showCases.length > 0 ? true : false;
            this.dataService.dismiss();
          }
        });
      } else {
        const patientCount = 0;
        if (this.loggedInUser.type === 'agent') {
          this.firebase.getCaseByDateAssignedToAgent(this.loggedInUser.id, startAt, endAt).subscribe((res: any) => {
            if (res.docs.length > 0) {
              res.docs.forEach(element => {
                const temp: any = element.data();
                temp.id = element.id;
                // const patientType: any = _.find(tempAdm, (patient: any) => patient.caseId === temp.id)
                // temp.patientType = patientType.patientType
                this.allCases.push(temp);
                const idAlreadyPresent = _.findIndex(this.allPatientIds, (patient) => patient.id === temp.clientId) === -1 ? false : true;
                if (!idAlreadyPresent) {
                  this.allPatientIds.push({ id: temp.clientId, found: false, data: null });
                }
              });
            } else {
              this.casesPresent = this.showCases.length > 0 ? true : false;
              this.dataService.dismiss();
            }
            this.getPatientsFromCases(patientCount);
          }, (err) => {

          });
        } else {
          this.firebase.getCaseByDate(startAt, endAt).subscribe((res) => {
            if (res.docs.length > 0) {
              res.docs.forEach(element => {
                const temp: any = element.data();
                temp.id = element.id;
                // const patientType: any = _.find(tempAdm, (patient: any) => patient.caseId === temp.id)
                // temp.patientType = patientType.patientType
                this.allCases.push(temp);
                const idAlreadyPresent = _.findIndex(this.allPatientIds, (patient) => patient.id === temp.clientId) === -1 ? false : true;
                if (!idAlreadyPresent) {
                  this.allPatientIds.push({ id: temp.clientId, found: false, data: null });
                }
              });
            } else {
              this.casesPresent = this.showCases.length > 0 ? true : false;
              this.dataService.dismiss();
            }
            this.getPatientsFromCases(patientCount);
          });
        }
      }
    });
  }
  public dateClicked(type) {
    if (type === 'start-date') {
      this.isFilterStartDateclicked = true;
    } else {
      this.isFilterEndDateclicked = true;
    }
  }
  public getDateRange() {
    if (new Date(this.filterDateFrom).getTime() <= (new Date(this.filterDateTo).getTime() + 86400000)) {
      if (this.isFilterStartDateclicked || this.isFilterEndDateclicked) {
        this.isFilterStartDateclicked = false;
        this.isFilterEndDateclicked = false;
        this.getData();
      }
    } else {
      let msg;
      if (new Date(this.filterDateFrom).getTime() > (new Date(this.filterDateTo).getTime() + 86400000)) {
        msg = 'Start date must be less than end date!';
      } else {
        msg = 'Invalid date range!';
      }
      this.dataService.presentAlert(msg);
      this.isFilterStartDateclicked = false;
      this.isFilterEndDateclicked = false;
    }
  }
  public ionViewDidLeave() {
    if (this.userSnapshotSub) {
      this.userSnapshotSub.unsubscribe();
    }
    if (this.multiUserSnapshotSub) {
      this.multiUserSnapshotSub.unsubscribe();
    }
    if (this.ehealthSnapshotSub) {
      this.ehealthSnapshotSub.unsubscribe();
    }
    const allInputCheckboxes = document.getElementsByClassName('case-checkbox');
    _.forEach(allInputCheckboxes, (box: any) => {
      box.checked = false;
    });
    this.filters = [];
    this.filterDateFrom = null;
    this.filterDateTo = null;
    this.isFilterStartDateclicked = false;
    this.isFilterEndDateclicked = false;
    this.nameToSearch = '';
    for (let i = 0; i < this.showCases.length; i++) {
      this.showCases[i].show = true;
    }
    this.sortingObject = {
      patientName: 'asc',
      caseName: 'asc',
      consultant: 'asc',
      caseNumber: 'asc',
      dateOfStatusChange: 'asc',
    };
  }
  getPatientsFromCases(patientCount) {
    this.showCases = [];
    this.pendingSubmissionCount = 0;
    this.pendingApprovalCount = 0;
    this.pendingAdmissionCount = 0;
    this.admittedCount = 0;
    this.dischargeCount = 0;
    this.verifiedCount = 0;
    this.pendingAppointmentCount = 0;
    this.temporaryApprovalCount = 0;
    this.pendingConsultationCount = 0;
    this.approvedCount = 0;
    this.dischargeDocNotSubmittedCount = 0;
    this.completedDocumentCount = 0;
    this.pendingFollowUpCount = 0;
    this.outpatientCount = 0;
    this.resubmissionApprovalCount = 0;
    if (this.allPatientIds.length > 0) {
      for (let i = 0; i < this.allPatientIds.length; i++) {
        const patient = this.allPatientIds[i];
        this.firebase.getPatients(patient.id).subscribe((res) => {
          patientCount++;
          // if (res.data()) {
          if (res.docs.length > 0) {
            patient.found = true;
            // patient.data = res.data();
            // patient.data.id = res.id;
            patient.data = res.docs[0].data();
            patient.data.id = res.docs[0].id;
            this.clientUsers.push(patient.data);
            const casesArr = _.filter(this.allCases, (aCase) => aCase.clientId === patient.data.id);
            for (let j = 0; j < casesArr.length; j++) {
              const aCase = casesArr[j];
              const caseObj: any = {};
              caseObj.consultants = this.getConsultantNames(aCase);
              caseObj.show = true;
              // if (user.id === aCase.clientId) {
              caseObj.patientName = patient.data.name;
              if (aCase.currentStatus === 'Pending') {
                this.pendingSubmissionCount++;
              } else if (aCase.currentStatus === 'Pending Approval') {
                this.pendingApprovalCount++;
              } else if (aCase.currentStatus === 'Pending Admission') {
                this.pendingAdmissionCount++;
              } else if (aCase.currentStatus === 'Admitted' && aCase.patientType !== 'outpatient') {
                this.admittedCount++;
              } else if (aCase.currentStatus === 'Discharge') {
                this.dischargeCount++;
              } else if (aCase.currentStatus === 'Verified') {
                this.verifiedCount++;
              } else if (aCase.currentStatus === 'Pending Appointment') {
                this.pendingAppointmentCount++;
              } else if (aCase.currentStatus === 'Temporary Approval') {
                this.temporaryApprovalCount++;
              } else if (aCase.currentStatus === 'Pending Consultation') {
                this.pendingConsultationCount++;
              } else if (aCase.currentStatus === 'Approved') {
                this.approvedCount++;
              } else if (aCase.currentStatus === 'Open Date') {
                this.completedDocumentCount++;
              } else if (aCase.currentStatus === 'Pending Follow Up') {
                this.pendingFollowUpCount++;
              } else if (aCase.currentStatus === 'Drop off before consultation') {
                this.droppOffBeforeConsultCount++;
              } else if (aCase.currentStatus === 'Drop off after consultation') {
                this.droppOffAfterConsultCount++;
              }
              //  else if (aCase.currentStatus === 'Rejected') {
              //   this.resubmissionApprovalCount++;
              // }
              else if (aCase.currentStatus === 'Resubmitted for approval') {
                this.resubmissionApprovalCount++;
              }
              if (aCase.patientType === 'outpatient' || aCase.currentStatus.toLowerCase() === 'outpatient') {
                this.outpatientCount++;
              }
              caseObj.isDischargeDocsNotSubmitted = this.checkIfDischargeDocsNotSubmitted(aCase);
              if (caseObj.isDischargeDocsNotSubmitted) {
                this.dischargeDocNotSubmittedCount++;
              }
              const caseStatusLen = aCase.caseStatus.length;
              if (caseStatusLen > 0) {
                if (aCase.caseStatus[caseStatusLen - 1].date) {
                  const splitteddate = aCase.caseStatus[caseStatusLen - 1].date.split(' ');
                  caseObj.dateOfStatusChange = splitteddate[2] + ' ' + splitteddate[1] + ' ' + splitteddate[3];
                  caseObj.statusChangeTimestamp = aCase.caseStatus[caseStatusLen - 1].date;
                }
              } else {
                const splitteddate = aCase.lastUpdateDate.split(' ');
                caseObj.dateOfStatusChange = splitteddate[2] + ' ' + splitteddate[1] + ' ' + splitteddate[3];
                caseObj.statusChangeTimestamp = aCase.lastUpdateDate;
              }
              caseObj.name = aCase.name;
              caseObj.currentStatus = aCase.currentStatus === 'Pending' ? 'Pending Submission' : aCase.currentStatus;
              caseObj.caseNumber = aCase.caseNumber;
              caseObj.referralSource = aCase.referralSource;
              caseObj.assignTo = aCase.assignTo;
              caseObj.clientId = aCase.clientId;
              caseObj.caseId = aCase.id;
              caseObj.patientType = aCase.patientType;
              this.showCases.push(caseObj);
              // }
            }
          }
          if (patientCount === this.allPatientIds.length) {
            this.casesPresent = this.showCases.length > 0 ? true : false;
            this.sortByPatientNameAsc();
            this.applyFilters();
            this.dataService.dismiss();
          }
        }, (err) => {
          console.log('err: ', err);
          this.dataService.dismiss();
        });
      }
    } else {
      this.casesPresent = this.showCases.length > 0 ? true : false;
      this.dataService.dismiss();
    }
  }
  getConsultantNames(aCase) {
    const consultantNames = [];
    _.forEach(aCase.assignTo, (agentId) => {
      const agent = _.find(this.agentUsers, (user) => user.id === agentId);
      if (agent) {
        consultantNames.push(agent.name);
      }
    });
    return consultantNames;
  }
  // public mergeArrays() {
  //   
  //   this.showCases = [];
  //   this.pendingSubmissionCount = 0;
  //   this.pendingApprovalCount = 0;
  //   this.pendingAdmissionCount = 0;
  //   this.admittedCount = 0;
  //   this.dischargeCount = 0;
  //   this.verifiedCount = 0;
  //   this.pendingAppointmentCount = 0;
  //   this.temporaryApprovalCount = 0;
  //   this.pendingConsultationCount = 0;
  //   this.approvedCount = 0;
  //   this.dischargeDocNotSubmittedCount = 0;
  //   let caseObj: any;
  //   for (let i = 0; i < this.clientUsers.length; i++) {
  //     for (let j = 0; j < this.allCases.length; j++) {
  //       caseObj = {};
  //       caseObj.consultants = [];
  //       caseObj.show = true;
  //       if (this.clientUsers[i].id === this.allCases[j].clientId) {
  //         caseObj.patientName = this.clientUsers[i].name;
  //         if (this.allCases[j].currentStatus === 'Pending') {
  //           this.pendingSubmissionCount++;
  //         } else if (this.allCases[j].currentStatus === 'Pending Approval') {
  //           this.pendingApprovalCount++;
  //         } else if (this.allCases[j].currentStatus === 'Pending Admission') {
  //           this.pendingAdmissionCount++;
  //         } else if (this.allCases[j].currentStatus === 'Admitted') {
  //           this.admittedCount++;
  //         } else if (this.allCases[j].currentStatus === 'Discharge') {
  //           this.dischargeCount++;
  //         } else if (this.allCases[j].currentStatus === 'Verified') {
  //           this.verifiedCount++;
  //         } else if (this.allCases[j].currentStatus === 'Pending Appointment') {
  //           this.pendingAppointmentCount++;
  //         } else if (this.allCases[j].currentStatus === 'Temporary Approval') {
  //           this.temporaryApprovalCount++;
  //         } else if (this.allCases[j].currentStatus === 'Pending Consultation') {
  //           this.pendingConsultationCount++;
  //         } else if (this.allCases[j].currentStatus === 'Approved') {
  //           this.approvedCount++;
  //         }
  //         caseObj.isDischargeDocsNotSubmitted = this.checkIfDischargeDocsNotSubmitted(this.allCases[j]);
  //         if (caseObj.isDischargeDocsNotSubmitted) {
  //           this.dischargeDocNotSubmittedCount++;
  //         }
  //         const caseStatusLen = this.allCases[j].caseStatus.length;
  //         if (caseStatusLen > 0) {
  //           if (this.allCases[j].caseStatus[caseStatusLen - 1].date) {
  //             const splitteddate = this.allCases[j].caseStatus[caseStatusLen - 1].date.split(' ');
  //             caseObj.dateOfStatusChange = splitteddate[2] + ' ' + splitteddate[1] + ' ' + splitteddate[3];
  //             caseObj.statusChangeTimestamp = this.allCases[j].caseStatus[caseStatusLen - 1].date;
  //           }
  //         } else {
  //           const splitteddate = this.allCases[j].lastUpdateDate.split(' ');
  //           caseObj.dateOfStatusChange = splitteddate[2] + ' ' + splitteddate[1] + ' ' + splitteddate[3];
  //           caseObj.statusChangeTimestamp = this.allCases[j].lastUpdateDate;
  //         }
  //         caseObj.name = this.allCases[j].name;
  //         caseObj.currentStatus = this.allCases[j].currentStatus === 'Pending' ? 'Pending Submission' : this.allCases[j].currentStatus;
  //         caseObj.caseNumber = this.allCases[j].caseNumber;
  //         caseObj.referralSource = this.allCases[j].referralSource;
  //         caseObj.assignTo = this.allCases[j].assignTo;
  //         caseObj.clientId = this.allCases[j].clientId;
  //         caseObj.caseId = this.allCases[j].id;
  //         this.showCases.push(caseObj);
  //       }
  //     }
  //   }
  //   for (let l = 0; l < this.showCases.length; l++) {
  //     for (let k = 0; k < this.agentUsers.length; k++) {
  //       const assignToLen = this.showCases[l].assignTo.length;
  //       if (assignToLen > 0) {
  //         for (let m = 0; m < this.showCases[l].assignTo.length; m++) {
  //           if (this.agentUsers[k].id === this.showCases[l].assignTo[m]) {
  //             this.showCases[l].consultants.push(this.agentUsers[k].name);
  //           }
  //         }
  //       }
  //     }
  //     if (this.showCases[l].consultants.length === 0) {
  //       this.showCases[l].consultants.push('');
  //     }
  //   }
  //   this.casesPresent = this.showCases.length > 0 ? true : false;
  //   this.sortByPatientNameAsc();
  //   this.applyFilters();
  //   this.dataService.dismiss();
  // }
  public checkIfDischargeDocsNotSubmitted(selectedcase) {
    if (selectedcase.currentStatus.toLowerCase() !== 'outpatient') {
      const foundDischarged = _.find(selectedcase.caseStatus, (o) => {
        // if (o.status === 'Admitted' || o.status === 'Discharge') {
        if (o.status === 'Discharge') {     // ? only discharged cases
          return o;
        }
      });
      if (foundDischarged && selectedcase.patientType !== 'outpatient') {
        if (!selectedcase.dischargeDocsChecklistCheckbox.dischargeSummary ||
          !selectedcase.dischargeDocsChecklistCheckbox.interimBill) {
          return true;
        } else {
          return false;
        }
      } else {
        return false;
      }
    } else {
      return false;
    }
  }
  public setCaseAndRedirect(caseData, index) {
    let isClicked = true;
    const selectedCase = _.filter(this.allCases, (o) => {
      if (o.id === caseData.caseId || o.caseNumber === caseData.caseNumber) {
        return o;
      }
    });
    this.dataService.setSelectedCase(selectedCase[0]);

    const selectedClient = _.find(this.clientUsers, (user) => caseData.clientId === user.id);
    this.dataService.setPatientData(selectedClient);

    this.ehealthSnapshotSub = this.firebase.getEhealth(caseData.caseId).subscribe((resp) => {
      const ehealth = resp[0];
      this.dataService.setEhealthData(ehealth);
      if (isClicked) {
        isClicked = false;
        this.dataService.dismiss();
        if ((caseData.currentStatus === 'Pending' || caseData.currentStatus === 'Pending Submission' || caseData.currentStatus === 'Pending Approval') &&
          (this.loggedInUser.type === 'Management' || this.loggedInUser.type === 'Claims Manager')) {
          this.router.navigateByUrl('/e-health-booklet/approval-preview/' + caseData.clientId);
        } else {
          this.router.navigateByUrl('/e-health-booklet/case/' + caseData.clientId);
        }
      }
    });
  }
  public servicesSearchTextFocusOut() {
    if (this.nameToSearch !== '') {
      this.nameToSearch = '';
    }
  }
  public servicesSearchTextChanged() {
    if (this.nameToSearch !== '') {
      this.nameToSearch = '';
      this.applyFilters();
    }
  }
  public showStatuswise(selectedStatus) {
    const isStatusPresent = _.findIndex(this.filters, (o) => o === selectedStatus);
    if (isStatusPresent === -1) {
      this.filters.push(selectedStatus);
    } else if (isStatusPresent !== -1) {
      this.filters.splice(isStatusPresent, 1);
    }
    this.applyFilters();
  }
  public applyFilters() {
    if (this.filters.length === 0) {
      for (let i = 0; i < this.showCases.length; i++) {
        if (this.nameToSearch === '') {
          this.showCases[i].show = true;
        } else {
          this.nameToSearch = this.nameToSearch.trim().replace(/\s\s+/g, ' ');
          this.showCases.forEach((c) => {
            if (c.patientName.toLowerCase().includes(this.nameToSearch.toLowerCase()) || this.nameToSearch === '') {
              c.show = true;
            } else {
              c.show = false;
            }
          });
        }
      }
    } else {
      for (let i = 0; i < this.showCases.length; i++) {
        this.showCases[i].show = false;
        for (let j = 0; j < this.filters.length; j++) {
          if (this.showCases[i].patientName.toLowerCase().includes(this.nameToSearch.toLowerCase()) && this.filters[j] === 'discharge-docs-not-submitted') {
            if (this.showCases[i].isDischargeDocsNotSubmitted) {
              this.showCases[i].show = true;
            }
          }
          if (this.showCases[i].patientName.toLowerCase().includes(this.nameToSearch.toLowerCase()) && this.filters[j] === 'outpatient') {
            if (this.showCases[i].patientType === 'outpatient' || this.showCases[i].currentStatus.toLowerCase() === 'outpatient') {
              this.showCases[i].show = true;
            }
          }
          if (this.filters[j] !== 'discharge-docs-not-submitted' && this.filters[j] !== 'outpatient') {
            if ((this.showCases[i].patientName.toLowerCase().includes(this.nameToSearch.toLowerCase()) && this.showCases[i].currentStatus === this.filters[j]) || (this.showCases[i].patientName.toLowerCase().includes(this.nameToSearch.toLowerCase()) && this.filters[j] === 'All')) {
              this.showCases[i].show = true;
            }
          }
        }
      }

    }
  }
  public sortByPatientNameAsc() {
    this.showCases = _.orderBy(this.showCases, [(user) => user.patientName.toLowerCase()], ['asc']);
    this.sortingObject.patientName = 'asc';
  }
  public sortByPatientNameDesc() {
    this.showCases = _.orderBy(this.showCases, [(user) => user.patientName.toLowerCase()], ['desc']);
    this.sortingObject.patientName = 'desc';
  }
  public sortByCaseNameAsc() {
    this.showCases = _.orderBy(this.showCases, [(user) => user.name.toLowerCase()], ['asc']);
    this.sortingObject.caseName = 'asc';
  }
  public sortByCaseNameDesc() {
    this.showCases = _.orderBy(this.showCases, [(user) => user.name.toLowerCase()], ['desc']);
    this.sortingObject.caseName = 'desc';
  }
  public sortByConsultantAsc() {
    this.showCases = _.orderBy(this.showCases, [(user) => user.consultants[0].toLowerCase()], ['asc']);
    this.sortingObject.consultant = 'asc';
  }
  public sortByConsultantDesc() {
    this.showCases = _.orderBy(this.showCases, [(user) => user.consultants[0].toLowerCase()], ['desc']);
    this.sortingObject.consultant = 'desc';
  }
  public sortByCaseNumberAsc() {
    this.showCases = _.orderBy(this.showCases, [(user) => user.caseNumber], ['asc']);
    this.sortingObject.caseNumber = 'asc';
  }
  public sortByCaseNumberDesc() {
    this.showCases = _.orderBy(this.showCases, [(user) => user.caseNumber], ['desc']);
    this.sortingObject.caseNumber = 'desc';
  }
  public sortByDateOfStatusChangeAsc() {
    this.showCases = _.orderBy(this.showCases, [(user) => new Date(user.statusChangeTimestamp)], ['asc']);
    this.sortingObject.dateOfStatusChange = 'asc';
  }
  public sortByDateOfStatusChangeDesc() {
    this.showCases = _.orderBy(this.showCases, [(user) => new Date(user.statusChangeTimestamp)], ['desc']);
    this.sortingObject.dateOfStatusChange = 'desc';
  }
}
