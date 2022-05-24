/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/prefer-for-of */
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import * as _ from 'lodash';
import { AppDataService } from 'src/app/services/app-data.service';
import { FirebaseService } from 'src/app/services/firebase.service';
@Component({
  selector: 'app-claims-management',
  templateUrl: './claims-management.page.html',
  styleUrls: ['./claims-management.page.scss'],
})
export class ClaimsManagementPage implements OnInit {
  public allAdmissions = [];
  public allCases = [];
  public allPatients = [];
  public allClaims: any = [];
  public statusFilters = [];
  public zeroizedFilters = [];
  public claimsDateFrom;
  public claimsDateTo;
  public nameToSearch = '';
  public claimsPresent = true;
  public filters = [];
  dateRange: any = {};
  public isInitialPageLoad;
  public isFilterStartDateclicked = false;
  public loggedInUser;
  public isFilterEndDateclicked = false;
  admissionSnapshotSub: any;
  allAdmSnapshotSub: any;
  allCaseIds = [];
  allPatientIds = [];
  claimsFilters = [];
  constructor(private dataService: AppDataService, private firebaseService: FirebaseService, private router: Router) { }
  public ionViewDidEnter() {
    this.loggedInUser = this.dataService.getUserData();
    const obj = {
      title: 'Claims Management',
      backPage: '/user-home/' + this.loggedInUser.id,
    };
    this.dataService.setHeaderTitle(obj);
    this.allCaseIds = [];
    this.allPatientIds = [];
    const date = new Date();
    const lastDay = new Date(date.getFullYear(), date.getMonth(), 0);
    const date1ToString = lastDay.toString();
    const newDate1 = date1ToString.split(' ')[2] + ' ' + date1ToString.split(' ')[1] + ' ' + date1ToString.split(' ')[3];
    this.claimsDateFrom = newDate1;
    const firstDay = new Date(date.getFullYear(), date.getMonth() + 1, 1);
    const date2ToString = firstDay.toString();
    const newDate2 = date2ToString.split(' ')[2] + ' ' + date2ToString.split(' ')[1] + ' ' + date2ToString.split(' ')[3];
    this.claimsDateTo = newDate2;
    if (this.isInitialPageLoad) {
      this.isInitialPageLoad = false;
      this.getAllData();
    } else {
      this.isFilterStartDateclicked = true;
    }
  }
  ionViewDidLeave() {
    if (this.admissionSnapshotSub) {
      this.admissionSnapshotSub.unsubscribe();
    }
    if (this.allAdmSnapshotSub) {
      this.allAdmSnapshotSub.unsubscribe();
    }
    this.nameToSearch = '';
    this.statusFilters = [];
    this.zeroizedFilters = [];
    const allInputCheckboxes = document.getElementsByClassName('status-checkbox');
    _.forEach(allInputCheckboxes, (box: any) => {
      box.checked = false;
    });
    this.claimsDateFrom = null;
    this.claimsDateTo = null;
    this.isFilterStartDateclicked = false;
    this.isFilterEndDateclicked = false;
    for (let i = 0; i < this.allClaims.length; i++) {
      this.allClaims[i].show = true;
    }
  }
  public getAllData() {
    this.dataService.present().then((loader) => {
      loader.present();
      const startAt = new Date(this.claimsDateFrom).getTime();
      const endAt = new Date(this.claimsDateTo).getTime() + 86400000;
      this.firebaseService.getDatewiseAdmissions(startAt, endAt).subscribe((resp: any) => {
        this.allAdmissions = [];
        this.allCases = [];
        this.allPatients = [];
        this.allClaims = [];
        if (resp.size > 0) {
          let admCount = 0;
          resp.docs.forEach(data => {
            const admData = data.data();
            admData.admissionId = data.id;
            this.allAdmissions.push(admData);
            this.firebaseService.getCaseForClaimsManagement(admData.caseId).subscribe((response: any) => {
              const caseData = response.data();
              caseData.id = response.id;
              admCount++;
              this.allCases.push(caseData);
              const idAlreadyPresent = _.findIndex(this.allPatientIds, (patient) => patient.id === caseData.clientId) === -1 ? false : true;
              if (!idAlreadyPresent) {
                this.allPatientIds.push({ id: caseData.clientId, data: null });
              }
              if (admCount === this.allAdmissions.length) {
                this.getPatientDetails();
              }
            });
          });
          // let count = 0;
          // for (let i = 0; i < this.allAdmissions.length; i++) {
          //   this.firebaseService.getCaseForClaimsManagement(this.allAdmissions[i].caseId).subscribe((response) => {
          //     const caseData = response.data();
          //     caseData.id = response.id;
          //     this.allCases.push(caseData);
          //     count++;
          //     if (count === this.allAdmissions.length) {
          //       let patientCount = 0;
          //       for (let j = 0; j < this.allCases.length; j++) {
          //         const casedata = this.allCases[j];
          //         this.firebaseService.getUserDetails(casedata.clientId).subscribe((result) => {
          //           const patient = result.data();
          //           patient.id = result.id;
          //           this.allPatients.push(patient);
          //           patientCount++;
          //           if (patientCount === this.allCases.length) {
          //             this.checkAndMergeAllData();
          //           }
          //         });
          //       }
          //       this.dataService.dismiss();
          //     }
          //   });
          // }
        } else {
          this.claimsPresent = false;
          this.dataService.dismiss();
        }
      });
    });
  }
  // public getAllData() {
  //   this.dataService.present().then((loader) => {
  //     loader.present();
  //     const startAt = new Date(this.claimsDateFrom).getTime();
  //     const endAt = new Date(this.claimsDateTo).getTime() + 86400000;
  //     this.firebaseService.getDatewiseAdmissions(startAt, endAt).subscribe((resp) => {
  //       this.allAdmissions = [];
  //       this.allCases = [];
  //       this.allPatients = [];
  //       this.allClaims = [];
  //       if (resp.size > 0) {
  //         resp.docs.forEach(data => {
  //           const admData = data.data();
  //           admData.admissionId = data.id;
  //           this.allAdmissions.push(admData);
  //         });
  //         let count = 0;
  //         for (let i = 0; i < this.allAdmissions.length; i++) {
  //           this.firebaseService.getCaseForClaimsManagement(this.allAdmissions[i].caseId).subscribe((response) => {
  //             const caseData = response.data();
  //             caseData.id = response.id;
  //             this.allCases.push(caseData);
  //             count++;
  //             if (count === this.allAdmissions.length) {
  //               let patientCount = 0;
  //               for (let j = 0; j < this.allCases.length; j++) {
  //                 const casedata = this.allCases[j];
  //                 this.firebaseService.getUserDetails(casedata.clientId).subscribe((result) => {
  //                   const patient = result.data();
  //                   patient.id = result.id;
  //                   this.allPatients.push(patient);
  //                   patientCount++;
  //                   if (patientCount === this.allCases.length) {
  //                     this.checkAndMergeAllData();
  //                   }
  //                 });
  //               }
  //               this.dataService.dismiss();
  //             }
  //           });
  //         }
  //       } else {
  //         this.claimsPresent = false;
  //         this.dataService.dismiss();
  //       }
  //     });
  //   });
  // }
  public ngOnInit() {
    this.isInitialPageLoad = true;
  }
  getPatientDetails() {
    let count = 0;
    for (let i = 0; i < this.allPatientIds.length; i++) {
      const patient = this.allPatientIds[i];
      this.firebaseService.getPatients(patient.id).subscribe((result: any) => {
        count++;
        if (result.docs.length) {
          // patient.data = result.data();
          patient.data = result.docs[0].data();
          patient.data.id = result.docs[0].id;
          this.allPatients.push(patient.data);
        }
        if (count === this.allPatientIds.length) {
          this.checkAndMergeAllData();
        }
      });
    }
  }
  // mergeData(admission, casedata, patient, count) {
  //   if (_.size(_.find(this.allClaims, ['caseId', casedata.id])) === 0) {
  //     if (admission.caseId === casedata.id) {
  //       for (let k = 0; k < admission.policy.length; k++) {
  //         const policy = admission.policy[k];
  //         if (admission.claims.length > 0) {
  //           const claim = admission.claims[k];
  //           this.allClaims.push({
  //             patientName: patient.name,
  //             caseId: casedata.id,
  //             clientId: casedata.clientId,
  //             case: casedata.name,
  //             policy: policy.nameOfPolicy,
  //             insurer: policy.insurer,
  //             dateOfAdm: admission.case.admissionDate.replace(/,/g, ' ') || '-',
  //             facilities: admission.case.facilities,
  //             status: (claim && claim.claimsStatus) ? claim.claimsStatus : '-',
  //             approvalDate: (claim && claim.approvedDate !== '' && claim.approvedDate !== '-') ? this.dataService.formatMonth(claim.approvedDate) : '-',
  //             zeroized: ((claim && claim.zeroized) && k === 0) ? claim.zeroized : '-',
  //             show: true
  //           });
  //         } else {
  //           this.allClaims.push({
  //             caseId: casedata.id,
  //             clientId: casedata.clientId,
  //             patientName: patient.name,
  //             case: casedata.name || '-',
  //             policy: policy.nameOfPolicy || '-',
  //             insurer: policy.insurer || '-',
  //             dateOfAdm: admission.case.admissionDate.replace(/,/g, ' ') || '-',
  //             facilities: admission.case.facilities || '-',
  //             status: 'Pending',
  //             approvalDate: '-',
  //             zeroized: k === 0 ? 'Pending' : '-',
  //             show: true
  //           });
  //         }
  //       }
  //     }
  //   }
  //   if (count === this.allAdmissions.length) {
  //     console.log('this.allClaims: ', this.allClaims);
  //     if (this.allClaims.length === 0) {
  //       this.claimsPresent = false;
  //     } else {
  //       this.allClaims = _.orderBy(this.allClaims, [(claim) => new Date(claim.dateOfAdm)], ['desc']);
  //       this.claimsPresent = true;
  //       // this.getDateRange();
  //       this.applyFilter();
  //     }
  //     this.dataService.dismiss();
  //   }
  // }
  public checkAndMergeAllData() {
    this.allClaims = [];
    if (this.allAdmissions.length > 0 && this.allCases.length > 0 && this.allPatients.length > 0) {
      for (let i = 0; i < this.allAdmissions.length; i++) {
        const admission = this.allAdmissions[i];
        for (let j = 0; j < this.allCases.length; j++) {
          const casedata = this.allCases[j];
          if (_.size(_.find(this.allClaims, ['caseId', casedata.id])) === 0) {
            if (admission.caseId === casedata.id) {
              for (let k = 0; k < admission.policy.length; k++) {
                const policy = admission.policy[k];
                if (admission.claims.length > 0) {
                  const claim = admission.claims[k];
                  this.allClaims.push({
                    caseId: casedata.id,
                    clientId: casedata.clientId,
                    patientName: '',
                    case: casedata.name,
                    policy: policy.nameOfPolicy,
                    insurer: policy.insurer,
                    dateOfAdm: admission.case.admissionDate.replace(/,/g, ' ') || '-',
                    facilities: admission.case.facilities,
                    status: (claim && claim.claimsStatus) ? claim.claimsStatus : '-',
                    approvalDate: (claim && claim.approvedDate !== '' && claim.approvedDate !== '-') ? this.dataService.formatMonth(claim.approvedDate) : '-',
                    zeroized: ((claim && claim.zeroized) && k === 0) ? claim.zeroized : '-',
                  });
                } else {
                  this.allClaims.push({
                    caseId: casedata.id,
                    clientId: casedata.clientId,
                    patientName: '',
                    case: casedata.name || '-',
                    policy: policy.nameOfPolicy || '-',
                    insurer: policy.insurer || '-',
                    dateOfAdm: admission.case.admissionDate.replace(/,/g, ' ') || '-',
                    facilities: admission.case.facilities || '-',
                    status: 'Pending',
                    approvalDate: '-',
                    zeroized: k === 0 ? 'Pending' : '-',
                  });
                }
              }
            }
          }
        }
      }
      for (let i = 0; i < this.allClaims.length; i++) {
        for (let j = 0; j < this.allPatients.length; j++) {
          if (this.allClaims[i].clientId === this.allPatients[j].id) {
            this.allClaims[i].patientName = this.allPatients[j].name;
            this.allClaims[i].show = true;
          }
        }
      }
      if (this.allClaims.length === 0) {
        this.claimsPresent = false;
      } else {
        this.allClaims = _.orderBy(this.allClaims, [(claim) => new Date(claim.dateOfAdm)], ['desc']);
        this.claimsPresent = true;
        // this.getDateRange();
        this.applyFilter();
      }
      this.dataService.dismiss();
    } else if (this.allAdmissions.length > 0 && this.allCases.length > 0 && this.allPatients.length === 0) {
      this.claimsPresent = false;
      this.dataService.dismiss();
    }
    return;
  }
  public showStatuswise(type, selectedFilter) {
    if (type === 'status') {
      const isStatusPresent = _.findIndex(this.statusFilters, (o) => o === selectedFilter);
      if (isStatusPresent === -1) {
        this.statusFilters.push(selectedFilter);
      } else if (isStatusPresent !== -1) {
        this.statusFilters.splice(isStatusPresent, 1);
      }
      this.applyFilter();
    } else if (type === 'zeroized') {
      const isZeroizedPresent = _.findIndex(this.zeroizedFilters, (o) => o === selectedFilter);
      if (isZeroizedPresent === -1) {
        this.zeroizedFilters.push(selectedFilter);
      } else if (isZeroizedPresent !== -1) {
        this.zeroizedFilters.splice(isZeroizedPresent, 1);
      }
      this.applyFilter();
    } else if (type === 'claims') {
      const isClaimsPresent = _.findIndex(this.claimsFilters, (o) => o === selectedFilter);
      if (isClaimsPresent === -1) {
        this.claimsFilters.push(selectedFilter);
      } else if (isClaimsPresent !== -1) {
        this.claimsFilters.splice(isClaimsPresent, 1);
      }
      this.applyFilter();
    }
  }
  public dateClicked(type) {
    if (type === 'start-date') {
      this.isFilterStartDateclicked = true;
    } else {
      this.isFilterEndDateclicked = true;
    }
  }
  public getDateRange() {
    if (new Date(this.claimsDateFrom).getTime() <= new Date(this.claimsDateTo).getTime()) {
      if (this.isFilterStartDateclicked || this.isFilterEndDateclicked) {
        this.isFilterStartDateclicked = false;
        this.isFilterEndDateclicked = false;
        this.getAllData();
      }
    } else {
      let msg;
      if (new Date(this.claimsDateFrom).getTime() > new Date(this.claimsDateTo).getTime()) {
        msg = 'Start date must be less than end date!';
      } else {
        msg = 'Invalid date range!';
      }
      this.dataService.presentAlert(msg);
      this.isFilterStartDateclicked = false;
      this.isFilterEndDateclicked = false;
    }
  }
  applyFilter() {
    let searchFlag = false;
    if (this.nameToSearch.length === 0) {
      searchFlag = false;
      this.allClaims.forEach(element => {
        element.show = false;
      });
    } else {
      this.nameToSearch = this.nameToSearch.trim().replace(/\s\s+/g, ' ');
      this.searchCase();
      searchFlag = true;
    }
    if (_.size(this.statusFilters) === 0 && _.size(this.zeroizedFilters) === 0 && _.size(this.claimsFilters) === 0) {
      if (searchFlag) {
        this.searchCase();
      } else {
        this.allClaims.forEach(x => {
          x.show = true;
        });
      }
    } else {
      if (_.size(this.statusFilters) !== 0 && _.size(this.zeroizedFilters) === 0 && _.size(this.claimsFilters) === 0) {
        this.allClaims.forEach(x => {
          const check = _.includes(this.statusFilters, x.status);
          if (searchFlag) {
            if (x.show) {
              if (check) {
                x.show = true;
              } else {
                x.show = false;
              }
            }
          } else {
            if (check) {
              x.show = true;
            }
          }
        });
      } else if (_.size(this.statusFilters) !== 0 && _.size(this.claimsFilters) === 0 && _.size(this.zeroizedFilters) !== 0) {
        this.allClaims.forEach(x => {
          const check = _.includes(this.zeroizedFilters, x.zeroized);
          const check1 = _.includes(this.statusFilters, x.status);
          if (searchFlag) {
            if (x.show) {
              if (check && check1) {
                x.show = true;
              } else {
                x.show = false;
              }
            }
          } else {
            if (check && check1) {
              x.show = true;
            }
          }
        });
      } else if (_.size(this.statusFilters) !== 0 && _.size(this.claimsFilters) !== 0 && _.size(this.zeroizedFilters) === 0) {
        this.allClaims.forEach(x => {
          let check1; let check2;
          const check = _.includes(this.statusFilters, x.status);
          if (this.claimsFilters.length === 1 && this.claimsFilters.includes('Hospitalisation (Shield) Plan')) {
            check1 = x.policy.includes('Hospitalisation (Shield) Plan');
          } else if (this.claimsFilters.length === 1 && this.claimsFilters.includes('Other Claims')) {
            check1 = !x.policy.includes('Hospitalisation (Shield) Plan');
          } else if (this.claimsFilters.length === 2) {
            check1 = x.policy.includes('Hospitalisation (Shield) Plan');
            check2 = !x.policy.includes('Hospitalisation (Shield) Plan');
          }
          if (searchFlag) {
            if (x.show) {
              if (check && (check1 || check2)) {
                x.show = true;
              } else {
                x.show = false;
              }
            }
          } else {
            if (check && (check1 || check2)) {
              x.show = true;
            }
          }
        });
      } else if (_.size(this.statusFilters) === 0 && _.size(this.claimsFilters) === 0 && _.size(this.zeroizedFilters) !== 0) {
        this.allClaims.forEach(x => {
          const check = _.includes(this.zeroizedFilters, x.zeroized);
          if (searchFlag) {
            if (x.show) {
              if (check) {
                x.show = true;
              } else {
                x.show = false;
              }
            }
          } else {
            if (check) {
              x.show = true;
            }
          }
        });
      } else if (_.size(this.statusFilters) === 0 && _.size(this.claimsFilters) !== 0 && _.size(this.zeroizedFilters) !== 0) {
        this.allClaims.forEach(x => {
          let check1; let check2;
          const check = _.includes(this.zeroizedFilters, x.zeroized);
          if (this.claimsFilters.length === 1 && this.claimsFilters.includes('Hospitalisation (Shield) Plan')) {
            check1 = x.policy.includes('Hospitalisation (Shield) Plan');
          } else if (this.claimsFilters.length === 1 && this.claimsFilters.includes('Other Claims')) {
            check1 = !x.policy.includes('Hospitalisation (Shield) Plan');
          } else if (this.claimsFilters.length === 2) {
            check1 = x.policy.includes('Hospitalisation (Shield) Plan');
            check2 = !x.policy.includes('Hospitalisation (Shield) Plan');
          }
          if (searchFlag) {
            if (x.show) {
              if (check && (check1 || check2)) {
                x.show = true;
              } else {
                x.show = false;
              }
            }
          } else {
            if (check && (check1 || check2)) {
              x.show = true;
            }
          }
        });
      } else if (_.size(this.statusFilters) !== 0 && _.size(this.claimsFilters) === 0 && _.size(this.zeroizedFilters) !== 0) {
        this.allClaims.forEach(x => {
          const check = _.includes(this.zeroizedFilters, x.zeroized);
          const check1 = _.includes(this.statusFilters, x.status);
          if (searchFlag) {
            if (x.show) {
              if (check && check1) {
                x.show = true;
              } else {
                x.show = false;
              }
            }
          } else {
            if (check && check1) {
              x.show = true;
            }
          }
        });
      } else if (_.size(this.statusFilters) === 0 && _.size(this.claimsFilters) !== 0 && _.size(this.zeroizedFilters) === 0) {
        this.allClaims.forEach(x => {
          let check; let check1;
          if (this.claimsFilters.length === 1 && this.claimsFilters.includes('Hospitalisation (Shield) Plan')) {
            check = x.policy.includes('Hospitalisation (Shield) Plan');
          } else if (this.claimsFilters.length === 1 && this.claimsFilters.includes('Other Claims')) {
            check = !x.policy.includes('Hospitalisation (Shield) Plan');
          } else if (this.claimsFilters.length === 2) {
            check = x.policy.includes('Hospitalisation (Shield) Plan');
            check1 = !x.policy.includes('Hospitalisation (Shield) Plan');
          }
          if (searchFlag) {
            if (x.show) {
              if (check || check1) {
                x.show = true;
              } else {
                x.show = false;
              }
            }
          } else {
            if (check || check1) {
              x.show = true;
            }
          }
        });
      }
      else {
        this.allClaims.forEach(x => {
          const check1 = _.includes(this.statusFilters, x.status);
          const check2 = _.includes(this.zeroizedFilters, x.zeroized);
          let check3; let check4;
          if (this.claimsFilters.length === 1 && this.claimsFilters.includes('Hospitalisation (Shield) Plan')) {
            check3 = x.policy.includes('Hospitalisation (Shield) Plan');
          } else if (this.claimsFilters.length === 1 && this.claimsFilters.includes('Other Claims')) {
            check3 = !x.policy.includes('Hospitalisation (Shield) Plan');
          } else if (this.claimsFilters.length === 2) {
            check3 = x.policy.includes('Hospitalisation (Shield) Plan');
            check4 = !x.policy.includes('Hospitalisation (Shield) Plan');
          }
          if (searchFlag) {
            if (x.show) {
              if (check1 && check2 && (check3 || check4)) {
                x.show = true;
              } else {
                x.show = false;
              }
            }
          } else {
            if (check1 && check2 && (check3 || check4)) {
              x.show = true;
            }
          }
        });
      }
    }
  }
  public setCaseAndRedirect(claimData) {
    let caseData;
    for (let i = 0; i < this.allCases.length; i++) {
      if (this.allCases[i].id === claimData.caseId) {
        caseData = this.allCases[i];
      }
    }
    let clientData = _.find(this.allPatients, ['id', caseData.clientId]);
    this.dataService.present().then((loader) => {
      loader.present();
      if (_.size(clientData) > 0) {
        this.dataService.setPatientData(clientData);
        this.getAdmissionAndRoute(caseData);
      } else {
        this.firebaseService.getUserDetails(caseData.clientId).subscribe((res: any) => {
          if (res && res.docs[0] && res.docs[0].data()) {
            clientData = res.docs[0].data();
            clientData.id = res.docs[0].id;
            this.getAdmissionAndRoute(caseData);
          } else {
            this.dataService.presentAlert('Could not get client. Try again!');
          }
        });
      }
    });
  }
  public getAdmissionAndRoute(caseData) {
    let isClicked = true;
    let admission: any;
    this.admissionSnapshotSub = this.firebaseService.getAdmission(caseData.id).subscribe((resp) => {
      if (isClicked) {
        isClicked = false;
        admission = resp[0];
        if (!admission) {
          admission = {
            caseId: caseData.id,
            case: {
              admissionNumber: '-',
              hospitalCaseName: '-',
              diagnosis: '-',
              facilities: '-',
              surgicalCode: '-',
              patientType: '',
              admissionDate: '',
              admissionTime: '',
              dischargeDate: '',
              dischargeTime: '',
              wardNumber: '',
            },
            policy: [
              {
                nameOfPolicy: '',
                insurer: '',
                basicInceptionDate: '',
                nameOfRider: '',
                riderInceptionDate: '',
                paymentMode: [],
              },
            ],
            revenue: {
              individualBill: [{
                type: 'Hospital',
                code: '-',
                hospitalBill: '',
                revenue: '',
                pcareAmount: '',
                tolAmount: '',
                totalAmount: '',
                tranche: '',
              },
              {
                type: 'Doctor',
                code: '-',
                hospitalBill: '',
                revenue: '',
                pcareAmount: '',
                tolAmount: '',
                totalAmount: '',
                tranche: '',
              }],
              totalHospitalBill: '',
              totalRevenue: '',
              totalPcareAmount: '',
              hospitalBill: '',
            },
            claims: [],
          };
        }
        this.dataService.setAdmissionData(admission);
        this.dataService.setSelectedCase(caseData);
        this.dataService.dismiss();
        this.router.navigateByUrl('/client-case-details/claims');
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
    }
    this.applyFilter();
  }
  public searchCase() {
    this.allClaims.forEach((c) => {
      if (c.patientName.toLowerCase().includes(this.nameToSearch.toLowerCase()) || this.nameToSearch === '') {
        c.show = true;
      } else {
        c.show = false;
      }
    });
  }
}
