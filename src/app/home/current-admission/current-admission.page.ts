/* eslint-disable radix */
/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/prefer-for-of */
import { Component, OnInit } from '@angular/core';
import * as _ from 'lodash';
import { AppDataService } from 'src/app/services/app-data.service';
import { FirebaseService } from 'src/app/services/firebase.service';
@Component({
  selector: 'app-current-admission',
  templateUrl: './current-admission.page.html',
  styleUrls: ['./current-admission.page.scss'],
})
export class CurrentAdmissionPage implements OnInit {
  public allAdmissions = [];
  public sortingObject = {
    type: '',
    order: '',
  };
  public admissionsPresent = true;
  public admissionDateFrom: any;
  public admissionDateTo: any;
  public isFilterStartDateclicked = false;
  public isFilterEndDateclicked = false;
  loggedInUser: any;
  constructor(private firebase: FirebaseService, private dataService: AppDataService) { }
  public ionViewDidEnter() {
    this.loggedInUser = this.dataService.getUserData();
    // ? publish the header title you want to display in header
    const obj = {
      title: 'Current Admission',
      backPage: '/user-home/' + this.loggedInUser.id,
    };
    this.dataService.setHeaderTitle(obj);
    const date = new Date();
    const lastDay = new Date(date.getFullYear(), date.getMonth(), 0);
    // const lastDay = new Date('2020-11-01');
    const date1ToString = lastDay.toString();
    const newDate1 = date1ToString.split(' ')[2] + ' ' + date1ToString.split(' ')[1] + ' ' + date1ToString.split(' ')[3];
    this.admissionDateFrom = newDate1;
    const firstDay = new Date(date.getFullYear(), date.getMonth() + 1, 1);
    const date2ToString = firstDay.toString();
    const newDate2 = date2ToString.split(' ')[2] + ' ' + date2ToString.split(' ')[1] + ' ' + date2ToString.split(' ')[3];
    this.admissionDateTo = newDate2;
    // ? set only isFilterStartDateclicked to true because getData() is called twice on ionChange for both dates
    this.isFilterStartDateclicked = true;
  }
  ionViewDidLeave() {
    this.admissionDateFrom = null;
    this.admissionDateTo = null;
  }
  public getAllData() {
    this.dataService.present().then((loader) => {
      loader.present();
      const startAt = new Date(this.admissionDateFrom).getTime();
      const endAt = new Date(this.admissionDateTo).getTime() + 86400000;
      this.firebase.getDatewiseAdmissionsOnly(startAt, endAt).subscribe((resp) => {
        const allCases = [];
        const admissionData = [];
        const allPatients = [];
        const allPatientIds = [];
        if (resp.size > 0) {
          let count = 0;
          resp.docs.forEach((data: any) => {
            const admData = data.data();
            admData.admissionId = data.id;
            admissionData.push(admData);
            if (this.loggedInUser.type === 'agent') {
              this.firebase.getDateWiseCasesAssignedToAgent(this.loggedInUser.id, admData.caseId).subscribe((response: any) => {
                if (response.docs.length > 0) {
                  const caseData = response.docs[0].data();
                  caseData.id = response.docs[0].id;
                  allCases.push(caseData);
                  const idAlreadyPresent = _.findIndex(allPatientIds, (patient) => patient.id === caseData.clientId) === -1 ? false : true;
                  if (!idAlreadyPresent) {
                    allPatientIds.push({ id: caseData.clientId, data: null });
                  }
                }
                count++;
                if (count === admissionData.length) {
                  this.getPatientDetails(allPatientIds, allCases, admissionData, allPatients);
                  // for (let j = 0; j < allCases.length; j++) {
                  //   const casedata = allCases[j];
                  // this.firebase.getUserDetails(casedata.clientId).subscribe((result) => {
                  //   let patient;
                  //   patient = result.data();
                  //   patient.id = result.id;
                  //   allPatients.push(patient);
                  //   patientCount++;
                  //   if (patientCount === allCases.length) {
                  //     this.getAllAdmissionsData(allCases, admissionData, allPatients);
                  //   }
                  // });
                  // }
                  // this.dataService.dismiss();
                }
              }, (err) => {
                this.dataService.dismiss();
              });
            } else {

              this.firebase.getCaseForClaimsManagement(admData.caseId).subscribe((response: any) => {
                const caseData = response.data();
                caseData.id = response.id;
                allCases.push(caseData);
                const idAlreadyPresent = _.findIndex(allPatientIds, (patient) => patient.id === caseData.clientId) === -1 ? false : true;
                if (!idAlreadyPresent) {
                  allPatientIds.push({ id: caseData.clientId, data: null });
                }
                count++;
                if (count === admissionData.length) {
                  this.getPatientDetails(allPatientIds, allCases, admissionData, allPatients);
                  // for (let j = 0; j < allCases.length; j++) {
                  //   const casedata = allCases[j];
                  // this.firebase.getUserDetails(casedata.clientId).subscribe((result) => {
                  //   let patient;
                  //   patient = result.data();
                  //   patient.id = result.id;
                  //   allPatients.push(patient);
                  //   patientCount++;
                  //   if (patientCount === allCases.length) {
                  //     this.getAllAdmissionsData(allCases, admissionData, allPatients);
                  //   }
                  // });
                  // }
                  // this.dataService.dismiss();
                }
              }, (err) => {
                this.dataService.dismiss();
              });
            }
          });
        } else {
          this.admissionsPresent = false;
          this.dataService.dismiss();
        }
      }, (err) => {
        console.log('err: ', err);
        this.dataService.dismiss();
      });
    });
  }
  getPatientDetails(allPatientIds, allCases, admissionData, allPatients) {
    let patientCount = 0;
    if (allPatientIds.length > 0) {
      for (let i = 0; i < allPatientIds.length; i++) {
        const patient = allPatientIds[i];
        this.firebase.getPatients(patient.id).subscribe((result: any) => {
          // patient.data = result.data();
          // patient.data.id = result.id;
          if (result.docs.length) {
            patient.data = result.docs[0].data();
            patient.data.id = result.docs[0].id;
            allPatients.push(patient.data);
          }
          patientCount++;
          if (patientCount === allPatientIds.length) {
            this.getAllAdmissionsData(allCases, admissionData, allPatients);
          }
        });
      }
    } else {
      this.admissionsPresent = false;
    this.dataService.dismiss();
    }
  }
  public getAllAdmissionsData(allCases, allAdmissions, allPatients) {
    console.log('allAdmissions: ', allAdmissions);
    console.log('allCases: ', allCases);
    console.log('allPatients: ', allPatients);
    this.allAdmissions = [];
    let caseObj: any;
    // tslint:disable-next-line: prefer-for-of
    for (let i = 0; i < allCases.length; i++) {
      // tslint:disable-next-line: prefer-for-of
      for (let j = 0; j < allAdmissions.length; j++) {
        if (allAdmissions[j].caseId === allCases[i].id) {
          let tempDocArr = [];
          caseObj = {
            patientName: '',
            case: allCases[i].name,
            type: allCases[i].type,
            facilities: '',
            wardNumber: '',
            admissionDate: '',
            admissionTime: '',
            dischargeDate: '',
            dischargeTime: '',
            patientType: '',
            doctors: tempDocArr,
            highlight: false,
          };
          // ? get all doctors' code from allAdmissions[j].revenue.individualBill[]
          // ? starting index of for loop is 1 because in individualBill[], there is 'hospital' at index 0
          // tslint:disable-next-line: prefer-for-of
          for (let l = 1; l < allAdmissions[j].revenue.individualBill.length; l++) {
            const element = allAdmissions[j].revenue.individualBill[l];
            if (element.code !== '-') {
              tempDocArr.push(element.code);
            }
          }
          tempDocArr = _.orderBy(tempDocArr, [(user) => user.toLowerCase()], ['asc']);
          caseObj.facilities = allAdmissions[j].case.facilities;
          caseObj.wardNumber = allAdmissions[j].case.wardNumber;
          caseObj.admissionDate = allAdmissions[j].case.admissionDate.replace(/, /g, ' ');
          const newdate = new Date(allAdmissions[j].case.admissionDate + ' ' + allAdmissions[j].case.admissionTime);
          const admTime = newdate.toLocaleString('en-SG', { hour: 'numeric', minute: 'numeric', hour12: true });
          caseObj.admissionTime = admTime;
          caseObj.dischargeDate = allAdmissions[j].case.dischargeDate;
          caseObj.dischargeTime = allAdmissions[j].case.dischargeTime;
          caseObj.patientType = allAdmissions[j].case.patientType;
          caseObj.doctors = tempDocArr;
          // ? find patient in allPatients
          const patient = _.find(allPatients, (o) => {
            if (o.id === allCases[i].clientId) {
              return o;
            }
          });
          caseObj.patientName = patient ? patient.name : '';
          if (patient) {
            this.allAdmissions.push(caseObj);
          }
        }
      }
    }
    // this.highlightAdmission();       // ? no need of this function as query on only admitted cases
    this.sortByFacilitiesAsc();
    if (allAdmissions.length === 0) {
      this.admissionsPresent = false;
    } else {
      this.admissionsPresent = true;
    }
    this.dataService.dismiss();
  }
  public dateClicked(type) {
    if (type === 'start-date') {
      this.isFilterStartDateclicked = true;
    } else {
      this.isFilterEndDateclicked = true;
    }
  }
  public getDateRange() {
    // !todo: optimize
    // ! select both dates, go to home, go to claims-management => ionChange of both dates are called
    // ! hence getAllData() is also called twice
    if (new Date(this.admissionDateFrom).getTime() <= new Date(this.admissionDateTo).getTime()) {
      if (this.isFilterStartDateclicked || this.isFilterEndDateclicked) {
        this.isFilterStartDateclicked = false;
        this.isFilterEndDateclicked = false;
        this.getAllData();
      }
    } else {
      let msg;
      if (new Date(this.admissionDateFrom).getTime() > new Date(this.admissionDateTo).getTime()) {
        msg = 'Start date must be less than end date!';
      } else {
        msg = 'Invalid date range!';
      }
      this.dataService.presentAlert(msg);
      this.isFilterStartDateclicked = false;
      this.isFilterEndDateclicked = false;
    }
  }
  public highlightAdmission() {
    // tslint:disable-next-line: prefer-for-of
    for (let i = 0; i < this.allAdmissions.length; i++) {
      const admission = this.allAdmissions[i];
      if (admission.patientType === 'day-surgery') {
        const date1: any = new Date(admission.dischargeDate + ' ' + admission.dischargeTime);
        const date2: any = new Date();
        const diffTime = Math.abs(date2 - date1);
        // tslint:disable-next-line: max-line-length
        // tslint:disable-next-line: radix
        admission.highlight = parseInt((diffTime / (1000 * 60 * 60)).toFixed(0)) > 8 ? true : false;
      } else {
        const date1: any = new Date(admission.dischargeDate + ' ' + admission.dischargeTime);
        const date2: any = new Date();
        const diffTime = date1 - date2;
        admission.highlight = diffTime < 0 ? true : false;
      }
    }
    return;
  }
  public ngOnInit() { }
  public sortByPatientNameAsc() {
    this.allAdmissions = _.orderBy(this.allAdmissions, [(user) => user.patientName.toLowerCase()], ['asc']);
    this.sortingObject.type = 'patientName';
    this.sortingObject.order = 'asc';
  }
  public sortByPatientNameDesc() {
    this.allAdmissions = _.orderBy(this.allAdmissions, [(user) => user.patientName.toLowerCase()], ['desc']);
    this.sortingObject.type = 'patientName';
    this.sortingObject.order = 'desc';
  }
  public sortByCaseAsc() {
    this.allAdmissions = _.orderBy(this.allAdmissions, [(user) => user.case.toLowerCase()], ['asc']);
    this.sortingObject.type = 'case';
    this.sortingObject.order = 'asc';
  }
  public sortByCaseDesc() {
    this.allAdmissions = _.orderBy(this.allAdmissions, [(user) => user.case.toLowerCase()], ['desc']);
    this.sortingObject.type = 'case';
    this.sortingObject.order = 'desc';
  }
  public sortByTypeAsc() {
    this.allAdmissions = _.orderBy(this.allAdmissions, [(user) => user.type.toLowerCase()], ['asc']);
    this.sortingObject.type = 'type';
    this.sortingObject.order = 'asc';
  }
  public sortByTypeDesc() {
    this.allAdmissions = _.orderBy(this.allAdmissions, [(user) => user.type.toLowerCase()], ['desc']);
    this.sortingObject.type = 'type';
    this.sortingObject.order = 'desc';
  }
  public sortByFacilitiesAsc() {
    this.allAdmissions = _.orderBy(this.allAdmissions, [(user) => user.facilities.toLowerCase(), (user) => user.wardNumber.toLowerCase()], ['asc', 'asc']);
    this.sortingObject.type = 'facilities';
    this.sortingObject.order = 'asc';
  }
  public sortByFacilitiesDesc() {
    this.allAdmissions = _.orderBy(this.allAdmissions, [(user) => user.facilities.toLowerCase(), (user) => user.wardNumber.toLowerCase()], ['desc', 'desc']);
    this.sortingObject.type = 'facilities';
    this.sortingObject.order = 'desc';
  }
  public sortByWardNoAsc() {
    this.allAdmissions = _.orderBy(this.allAdmissions, [(user) => user.wardNumber.toLowerCase()], ['asc']);
    this.sortingObject.type = 'wardNo';
    this.sortingObject.order = 'asc';
  }
  public sortByWardNoDesc() {
    this.allAdmissions = _.orderBy(this.allAdmissions, [(user) => user.wardNumber.toLowerCase()], ['desc']);
    this.sortingObject.type = 'wardNo';
    this.sortingObject.order = 'desc';
  }
  public sortByDoctorsAsc() {
    this.allAdmissions = _.orderBy(this.allAdmissions, [(user) => user.doctors.toLowerCase()], ['asc']);
    this.sortingObject.type = 'doctors';
    this.sortingObject.order = 'asc';
  }
  public sortByDoctorsDesc() {
    this.allAdmissions = _.orderBy(this.allAdmissions, [(user) => user.doctors.toLowerCase()], ['desc']);
    this.sortingObject.type = 'doctors';
    this.sortingObject.order = 'desc';
  }
  public sortByAdmissionDateAsc() {
    this.allAdmissions = _.orderBy(this.allAdmissions, [(user) => new Date(user.admissionDate + ' ' + user.admissionTime)], ['asc']);
    this.sortingObject.type = 'date';
    this.sortingObject.order = 'asc';
  }
  public sortByAdmissionDateDesc() {
    this.allAdmissions = _.orderBy(this.allAdmissions, [(user) => new Date(user.admissionDate + ' ' + user.admissionTime)], ['desc']);
    this.sortingObject.type = 'date';
    this.sortingObject.order = 'desc';
  }
}
