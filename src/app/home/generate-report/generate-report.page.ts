/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/prefer-for-of */
import { Component, OnInit } from '@angular/core';
import { AppDataService } from 'src/app/services/app-data.service';
import { FirebaseService } from 'src/app/services/firebase.service';
import * as _ from 'lodash';
import { Workbook } from 'exceljs';
import * as fs from 'file-saver';
import { DownloadFileService } from 'src/app/services/download-file.service';
import { environment } from 'src/environments/environment';
import { SocialSharing } from '@ionic-native/social-sharing/ngx';
@Component({
  selector: 'app-generate-report',
  templateUrl: './generate-report.page.html',
  styleUrls: ['./generate-report.page.scss'],
})
export class GenerateReportPage implements OnInit {
  excelWorkbook = new Workbook();
  excelWorksheet: any;
  public admissionDateFrom: any;
  public admissionDateTo: any;
  public isFilterStartDateclicked = false;
  public isFilterEndDateclicked = false;
  reportData: any = [];
  admissionsPresent: any;
  reportColumns = [
    { header: 'Case Number', key: 'caseNumber', width: 10 },
    { header: 'Admission number', key: 'admissionNumber', width: 20 },
    { header: 'Client Name', key: 'clientName', width: 30 },
    { header: 'NRIC/FIN/Foreign ID', key: 'nric', width: 30 },
    { header: 'Gender', key: 'gender', width: 15 },
    { header: 'Date of Birth', key: 'dob', width: 15 },
    { header: 'Contact', key: 'contact', width: 15 },
    { header: 'Address', key: 'address', width: 80 },
    { header: 'Email', key: 'email', width: 40 },
    { header: 'Policy Activated', key: 'policyActivated', width: 60 },
    { header: 'Type of Admission', key: 'typeOfAdmission', width: 30 },
    { header: 'Date of Admission', key: 'dateOfAdmission', width: 30 },
    { header: 'Date of Discharge', key: 'dateOfDischarge', width: 30 },
    { header: 'Procedure/Diagnosis', key: 'diagnosis', width: 50 },
    { header: 'Surgical Code', key: 'surgicalCode', width: 25 },
    { header: 'Facilities', key: 'facilities', width: 40 },
    { header: 'Doctor', key: 'doctor', width: 10 },
    { header: 'Total Hospital Bill', key: 'totalHospitalBill', width: 30 },
    { header: 'Claim Approval Status', key: 'claimApprovalStatus', width: 30 },
    { header: 'Claim Approval Date', key: 'claimApprovalDate', width: 30 },
    { header: 'Financing Sources - Insurer', key: 'insurer', width: 30 },
    { header: 'Financing Sources - Medisave', key: 'medisave', width: 30 },
    { header: 'Financing Sources - Cash', key: 'cash', width: 30 },
    { header: 'Doctor Fee', key: 'doctorFee', width: 20 },
    { header: 'TOL', key: 'tol', width: 20 },
    { header: 'Pcare', key: 'pcare', width: 20 },
    { header: 'Tranche', key: 'tranche', width: 15 },
    { header: 'Referral Source', key: 'referralSource', width: 25 },
    { header: 'T1G Referrer', key: 't1GReferrer', width: 25 },
    { header: 'Referrer Fee', key: 'referrerFee', width: 25 },
    { header: 'Service Type', key: 'serviceType', width: 25 }
  ];
  public sortingObject = {
    type: '',
    order: '',
  };
  omitSortOption = ['address', 'gender', 'dob', 'contact', 'doctor', 'surgicalCode'];
  constructor(private firebase: FirebaseService, private dataService: AppDataService, private downloadService: DownloadFileService, private socialSharing: SocialSharing) { }
  public ionViewDidEnter() {
    this.dataService.present().then((loader) => {
      loader.present();
      const loggedInUser = this.dataService.getUserData();
      // ? publish the header title you want to display in header
      const obj = {
        title: 'Generate Report',
        backPage: '/user-home/' + loggedInUser.id,
      };
      this.dataService.setHeaderTitle(obj);
      this.dataService.dismiss();
      const date = new Date();
      const lastDay = new Date(date.getFullYear(), date.getMonth(), 0);
      // const lastDay = new Date('2021-06-01');
      const date1ToString = lastDay.toString();
      const newDate1 = date1ToString.split(' ')[2] + ' ' + date1ToString.split(' ')[1] + ' ' + date1ToString.split(' ')[3];
      this.admissionDateFrom = newDate1;
      const firstDay = new Date(date.getFullYear(), date.getMonth() + 1, 1);
      const date2ToString = firstDay.toString();
      const newDate2 = date2ToString.split(' ')[2] + ' ' + date2ToString.split(' ')[1] + ' ' + date2ToString.split(' ')[3];
      this.admissionDateTo = newDate2;
      // ? set only isFilterStartDateclicked to true because getData() is called twice on ionChange for both dates
      this.isFilterStartDateclicked = true;
    });
  }
  public ngOnInit() {
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
  getAllData() {
    this.dataService.present().then((loader) => {
      loader.present();
      const startAt = new Date(this.admissionDateFrom).getTime();
      const endAt = new Date(this.admissionDateTo).getTime() + 86400000;
      this.firebase.getDatewiseAdmissions(startAt, endAt).subscribe((resp) => {
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
            // });
            // let count = 0;
            // for (let i = 0; i < admissionData.length; i++) {
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
            // }
          });
        } else {
          this.admissionsPresent = false;
          this.dataService.dismiss();
        }
      }, (err) => {
        this.dataService.dismiss();
      });
    });
  }
  getPatientDetails(allPatientIds, allCases, admissionData, allPatients) {
    let patientCount = 0;
    for (let i = 0; i < allPatientIds.length; i++) {
      const patient = allPatientIds[i];
      this.firebase.getPatients(patient.id).subscribe((result: any) => {
        if (result.docs.length > 0) {
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
  }
  public getAllAdmissionsData(allCases, allAdmissions, allPatients) {
    this.reportData = [];
    let caseObj: any;
    // tslint:disable-next-line: prefer-for-of
    for (let i = 0; i < allCases.length; i++) {
      // tslint:disable-next-line: prefer-for-of
      for (let j = 0; j < allAdmissions.length; j++) {
        if (allAdmissions[j].caseId === allCases[i].id) {
          // eslint-disable-next-line prefer-const
          let tempDocArr: any = [];
          // ? get all doctors' code from allAdmissions[j].revenue.individualBill[]
          // ? starting index of for loop is 1 because in individualBill[], there is 'hospital' at index 0
          // tslint:disable-next-line: prefer-for-of
          // for (let l = 1; l < allAdmissions[j].revenue.individualBill.length; l++) {
          //   const element = allAdmissions[j].revenue.individualBill[l];
          //   if (element.code !== '-') {
          //     tempDocArr.push(element.code);
          //   }
          // }
          // tempDocArr = _.orderBy(tempDocArr, [(user) => user.toLowerCase()], ['asc']);
          // ? find patient in allPatients
          const patient = _.find(allPatients, (o) => {
            if (o.id === allCases[i].clientId) {
              return o;
            }
          });
          if (patient) {
            const surgicalCodes = allAdmissions[j].case.surgicalCodes.map((code) => code.code).toString();
            for (let p = 0; p < allAdmissions[j].policy.length; p++) {
              let reportObj: any;
              if (allAdmissions[j].revenue.individualBill.length > 0) {
                for (let l = 1; l < allAdmissions[j].revenue.individualBill.length; l++) {
                  reportObj = this.createReportObj(allAdmissions[j], allCases[i], patient, allAdmissions[j].claims[p], allAdmissions[j].policy[p], allAdmissions[j].revenue.individualBill[l], surgicalCodes);
                  this.reportData.push(reportObj);
                }
              } else {
                reportObj = this.createReportObj(allAdmissions[j], allCases[i], patient, allAdmissions[j].claims[p], allAdmissions[j].policy[p], '-', surgicalCodes);
                this.reportData.push(reportObj);
              }
            }
          }
        }
      }
    }
    if (this.reportData.length > 0) {
      this.admissionsPresent = true;
    } else {
      this.admissionsPresent = false;
    }
    this.dataService.dismiss();
  }
  createReportObj(admission, cases, patient, claim, policy, revenue, surgicalCodesArr) {
    const reportObj = {
      caseNumber: cases.caseNumber,
      admissionNumber: admission.case.admissionNumber,
      clientName: patient.name,
      nric: patient.nric !== '' ? patient.nric : patient.foreignId,
      gender: patient.gender.toUpperCase(),
      dob: patient.dateOfBirth,
      contact: patient.contactNo,
      address: patient.address,
      email: patient.email,
      policyActivated: policy && policy.nameOfPolicy !== '' ? policy.nameOfPolicy : '-',
      typeOfAdmission: admission.case.patientType !== '' ? admission.case.patientType.toUpperCase() : '-',
      dateOfAdmission: admission.case.admissionDate.replace(/, /g, ' '),
      dateOfDischarge: admission.case.dischargeDate.replace(/, /g, ' ') !== '' ? admission.case.dischargeDate.replace(/, /g, ' ') : '-',
      diagnosis: admission.case.diagnosis !== '' ? admission.case.diagnosis : '-',
      surgicalCode: surgicalCodesArr,
      facilities: admission.case.facilities !== '' ? admission.case.facilities : '-',
      doctor: revenue.code,
      totalHospitalBill: admission.revenue.hospitalBill !== '' ? admission.revenue.hospitalBill : '-',
      claimApprovalStatus: claim && claim.claimsStatus !== '' ? claim.claimsStatus : '-',
      claimApprovalDate: claim && claim.approvedDate !== '' ? claim.approvedDate : '-',
      insurer: policy && policy.insurer !== '' ? policy.insurer : '-',
      medisave: claim ? claim.amountMedisave : '-',
      cash: claim ? claim.amountCash : '-',
      doctorFee: revenue && revenue.hospitalBill !== '' ? revenue.hospitalBill : '-',
      tol: revenue && revenue.tolAmount !== '' ? revenue.tolAmount : '-',
      pcare: revenue && revenue.pcareAmount !== '' ? revenue.pcareAmount : '-',
      tranche: revenue && revenue.tranche !== '' ? revenue.tranche : '-',
      referralSource: cases.referralSource !== '' ? cases.referralSource : '-',
      t1GReferrer: cases.referrer !== '' ? cases.referrer : '-',
      referrerFee: admission.revenue.referrerFee !== '' ? admission.revenue.referrerFee : '-',
      serviceType: cases.serviceType && cases.serviceType !== '' ? cases.serviceType : '-'
    };
    return reportObj;
  }
  exportAsExcel() {
    if (this.excelWorksheet) {
      this.excelWorkbook.removeWorksheet(this.excelWorksheet.id);
    }
    this.excelWorksheet = this.excelWorkbook.addWorksheet('Analysis Report');
    this.excelWorksheet.columns = this.reportColumns;
    this.excelWorksheet.addRows(this.reportData, 'n');
    const today = new Date();
    const date1ToString = today.toString();
    const newDate1 = date1ToString.split(' ')[2] + ' ' + date1ToString.split(' ')[1] + ' ' + date1ToString.split(' ')[3];
    this.excelWorkbook.xlsx.writeBuffer().then((data) => {
      const blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      if (environment.isWeb) {
        fs.saveAs(blob, newDate1 + ' Analysis Report.xlsx');
        // fs.save(newDate1 + ' Analysis Report.xlsx');
        // .then((resp) => {
        // });
        // // .catch((err))
      } else {
        const that = this;
        const reader = new FileReader();
        // const excelFile = new File([blob], newDate1 + ' Analysis Report.xlsx');
        reader.onload = function(e) {
          const fileData = this.result as string;
          const file = {
            fileName: newDate1 + ' Analysis Report.xlsx',
            filePath: fileData,
            fileDir: 'Premium Care'
          };
          // that.downloadService.downloadFile(fileData, 'blob');
          that.socialSharing.share('', '', fileData);
          // .then((resp) => {
          //   that.dataService.dismiss(); // ? no loader presented
          // })
          // .catch((err) => {
          //   that.dataService.dismiss();
          // });
        };
        // reader.readAsDataURL(excelFile);
        reader.readAsDataURL(blob);
      }
    });
  }
  public sortAsc(key) {
    this.reportData = _.orderBy(this.reportData, [(data) => typeof (data[key]) !== 'string' ? data[key] : data[key].toLowerCase()], ['asc']);
    this.sortingObject.type = key;
    this.sortingObject.order = 'asc';
  }
  public sortDesc(key) {
    this.reportData = _.orderBy(this.reportData, [(data) => typeof (data[key]) !== 'string' ? data[key] : data[key].toLowerCase()], ['desc']);
    this.sortingObject.type = key;
    this.sortingObject.order = 'desc';
  }
  ngDestroy() {
    this.excelWorkbook.removeWorksheet(this.excelWorksheet.id);
  }
}
