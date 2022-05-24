/* eslint-disable max-len */
import { Component, OnInit } from '@angular/core';
import { AppDataService } from 'src/app/services/app-data.service';
declare var SelectPure: any;
import * as _ from 'lodash';
import { FirebaseService } from 'src/app/services/firebase.service';
@Component({
  selector: 'app-case',
  templateUrl: './case.page.html',
  styleUrls: ['./case.page.scss'],
})
export class CasePage implements OnInit {
  public type;
  public nameToSearch = '';
  public admission: any;
  public admissionDate;
  public admissionTime;
  public dischargeDate;
  public dischargeTime;
  public allDiagnosis = [
    {
      name: 'diagnosis 1',
      id: 1,
    },
    {
      name: 'diagnosis 2',
      id: 2,
    },
    {
      name: 'diagnosis 3',
      id: 3,
    },
    {
      name: 'diagnosis 4',
      id: 4,
    },
  ];
  public allFacilities = [];

  public allSurgicalCode = [];

  public hospitalName;
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
  public facilitiesSelector = [];
  public surgicalCodeSelector = [];
  public mode = 'preview';
  public caseId;
  public showEditBtn = true;
  public loggedInUser: any;
  public disableDischargeDate = false;
  constructor(private dataService: AppDataService, private firebaseService: FirebaseService) { }
  // ! Developer note: Inhouse consultant cannot change information after discharge.
  // ! --- 3 days after discharge claims manager cannot change information on this page
  public ngOnInit() {
  }

  public ngAfterViewInit() {
    this.dataService.present().then((loader) => {
      loader.present();
      // ? publish the header title you want to display in header
      const obj = {
        title: 'Case Details',
        backPage: '/client-case-profile',
      };
      this.dataService.setHeaderTitle(obj);
      this.loggedInUser = this.dataService.getUserData();
      const clientCase = this.dataService.getSelectedCase();
      this.admission = this.dataService.getAdmissionData();
      this.getFacilities();
      if (clientCase.currentStatus !== 'Discharge') {
        this.disableDischargeDate = true;
      }
      // if (this.loggedInUser.type === 'agent' && clientCase.currentStatus === 'Discharge') {
        // if (this.loggedInUser.type === 'agent') {
        if (this.loggedInUser.type === 'agent' && clientCase.currentStatus.includes(['Pending','Pending Approval','Approved','Temporary Approval','Resubmission for temporary approval','Rejected','Submitted for approval','Resubmitted for approval'])) {
        this.showEditBtn = false;
      // } else if (this.loggedInUser.type === 'Claims Manager' && this.admission.case.dischargeDate !== '' && !this.getDischargeDateDiff()) {
      //   this.showEditBtn = false;
      } else {
        this.showEditBtn = true;
      }
      this.dataService.dismiss();
    });
  }
  public getDischargeDateDiff() {
    const date1: any = new Date();
    const date2: any = new Date(this.admission.case.dischargeDate + ' ' + this.admission.case.dischargeTime);
    const datediff = date1 - date2;
    // tslint:disable-next-line: radix
    return parseInt((datediff / (1000 * 24 * 60 * 60)).toFixed(0)) < 3 ? true : false;
  }
  public initializeCaseAdmissionData() {
    if (this.admission.case.admissionNumber === '') {
      this.firebaseService.getLastAdmissionId().then((resp) => {
        this.admission.case.admissionNumber = resp;
      });
    }
    this.admission.case.wardNumber = this.admission.case.wardNumber || '';
    this.admission.case.patientType = this.admission.case.patientType || 'inpatient';
    this.admission.case.facilities = this.admission.case.facilities || '-';
    this.admission.case.surgicalCodes = (this.admission.case.surgicalCodes.length > 0) ?
      this.admission.case.surgicalCodes : this.admission.case.surgicalCodes.push({ code: '-' });
    this.admission.case.showFacilityDropdown = false;
    // tslint:disable-next-line: prefer-for-of
    for (let i = 0; i < this.admission.case.surgicalCodes.length; i++) {
      const info = this.admission.case.surgicalCodes[i];
      info.showDropdown = false;
      info.selectedRowIndex = -1;
      for (let j = 0; j < this.allSurgicalCode.length; j++) {
        this.allSurgicalCode[j].isSelected = false;
        if (info.code !== '-' && this.allSurgicalCode[j].code === info.code) {
          this.allSurgicalCode[j].isSelected = true;
          info.selectedRowIndex = j;
        }
      }
    }
    for (let j = 0; j < this.allFacilities.length; j++) {
      this.allFacilities[j].isSelected = false;
      if (this.admission.case.facilities !== '-' && this.allFacilities[j].name === this.admission.case.facilities) {
        this.allFacilities[j].isSelected = true;
      }
    }
    if (this.admission.case.admissionDate) {
      this.admission.case.admissionDate = this.admission.case.admissionDate.replace(/,/g, ' ');
      this.admissionTime = this.changeDateFormat('admission-time', this.admission.case.admissionDate + ' ' + this.admission.case.admissionTime);
    } else {
      this.changeDateFormat('new-admission-date', null);
    }
    if (this.admission.case.dischargeDate) {
      this.dischargeDate = this.admission.case.dischargeDate.replace(/,/g, ' ');
      this.dischargeTime = this.changeDateFormat('discharge-time', this.admission.case.dischargeDate + ' ' + this.admission.case.dischargeTime);
    } else {
      this.dischargeDate = '';
    }
    return;
  }
  public getSurgicalCodes() {
    const surgicalCodes = this.dataService.getAllSurgicalCodes();
    if (_.size(surgicalCodes) > 0) {
      this.allSurgicalCode = surgicalCodes;
      this.initializeCaseAdmissionData();
    } else {
      this.firebaseService.getSurgicalCode().subscribe((resp) => {
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
          this.allSurgicalCode = data;
          this.dataService.setAllSurgicalCodes(this.allSurgicalCode);
        }
        this.initializeCaseAdmissionData();
      });
    }
  }
  public getFacilities() {
    this.firebaseService.getFacility().subscribe(resp => {
      let data = [];
      if (resp.size !== 0) {
        resp.docs.forEach(element => {
          const temp: any = element.data();
          temp.id = element.id;
          temp.show = true;
          temp.isSelected = false;
          data.push(temp);
        });
        this.allFacilities = data;
      }
      this.getSurgicalCodes();
    });
  }
  public createSelectPureInputFromArray(array: any) {
    const tempArray = [];
    // tslint:disable-next-line: prefer-for-of
    for (let i = 0; i < array.length; i++) {
      const newObj = {
        label: array[i].name,
        value: array[i].id,
      };
      tempArray.push(newObj);
    }
    return tempArray;
  }
  public optionlMenuList(className: any, initialValue: any, options: any, type) {
    return new SelectPure(className, {
      options,
      multiple: false,
      autocomplete: true,
      value: initialValue,
      icon: 'label-cross',
      inlineIcon: 'dropdown-icon',
      classNames: {
        select: 'select-pure__select',
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

        if (type === 'facilities') {
          const data = _.find(this.allFacilities, { id: value });
          if (data) {
          }
        } else if (type === 'surgical-code') {
          const data = _.find(this.allSurgicalCode, { id: value });
          if (data) {
          }
        }
      },
    });
  }
  public getNameFromId(id, array) {
    let found;
    found = _.find(array, { id });
    if (found) {
      return found.name;
    }
  }
  public changeMode(mode) {
    this.mode = mode;
  }
  public changeDateFormat(type, date) {
    let newdate;
    if (date) {
      newdate = new Date(date);
    } else {
      newdate = new Date();
    }
    const dateToString = newdate.toString();
    const newDate = dateToString.split(' ')[2] + ' ' + dateToString.split(' ')[1] + ' ' +
      dateToString.split(' ')[3];
    if (type === 'new-admission-date') {
      this.admission.case.admissionDate = newDate;
      this.admission.case.admissionDateTimestamp = new Date(newdate).getTime();
      // ? admissionTime is assigned here also because when a case is opened for 1st time,
      // ? admissionadmissionTime nad admissionTime are set to current admissionTime and time
      // ? in init() type='admission-admissionTime' is passed and not 'admission-time';
      // ! change zone here
      // this.admission.case.admissionTime = newdate.toLocaleString('en-IN', { hour: 'numeric', minute: 'numeric', hour12: true });
      this.admission.case.admissionTime = newdate.toLocaleString('en-SG', { hour: 'numeric', minute: 'numeric', hour12: true });
    } else {
      if (type === 'admission-date') {
        this.admission.case.admissionDate = newDate;
        this.admission.case.admissionDateTimestamp = new Date(newdate).getTime();
        // tslint:disable-next-line: max-line-length
        // this.admission.case.caseDetails.admissionTime = newadmissionTime.toLocaleString('en-IN', { hour: 'numeric', minute: 'numeric', hour12: true });
      }
      if (type === 'admission-time') {
        // this.admission.case.admissionTime = newdate.toLocaleString('en-IN', { hour: 'numeric', minute: 'numeric', hour12: true });
        this.admission.case.admissionTime = newdate.toLocaleString('en-SG', { hour: 'numeric', minute: 'numeric', hour12: true });
        this.admission.case.admissionDateTimestamp = new Date(newdate).getTime();
      }
    }
    if (type === 'new-discharge-date') {
      this.admission.case.dischargeDate = newDate;
      // ! change zone here
      // this.admission.case.dischargeTime = newdate.toLocaleString('en-IN', { hour: 'numeric', minute: 'numeric', hour12: true });
      this.admission.case.dischargeTime = newdate.toLocaleString('en-SG', { hour: 'numeric', minute: 'numeric', hour12: true });
      // ? Time: 15min Interval
      //  let newDischargeDate = newdate.getTime() + 900000;
      // tslint:disable-next-line: max-line-length
      //  this.admission.case.dischargeTime = new Date(newDischargeDate).toLocaleString('en-IN', { hour: 'numeric', minute: 'numeric', hour12: true });

    } else {
      if (type === 'discharge-date') {
        if (this.checkDischargeDate()) {
          this.dataService.presentAlert('Discharge date should be ahead of admission date');
        } else {
          this.admission.case.dischargeDate = newDate;
        }

        // tslint:disable-next-line: max-line-length
        // this.admission.case.caseDetails.dischargeTime = newdate.toLocaleString('en-IN', { hour: 'numeric', minute: 'numeric', hour12: true });
      }
      if (type === 'discharge-time') {
        // this.admission.case.dischargeTime = newdate.toLocaleString('en-IN', { hour: 'numeric', minute: 'numeric', hour12: true });
        this.admission.case.dischargeTime = newdate.toLocaleString('en-SG', { hour: 'numeric', minute: 'numeric', hour12: true });
      }
    }
  }
  public checkDischargeDate() {
    // tslint:disable-next-line: max-line-length

    return new Date(this.admission.case.dischargeDate + ' ' + this.admission.case.dischargeTime).getTime() <
      new Date(this.admission.case.admissionDate + ' ' + this.admission.case.admissionTime).getTime();
  }
  public selectPatientType(type) {
    if (this.mode === 'edit') {
      this.admission.case.patientType = type;
    }
  }
  public saveChanges() {
    this.dataService.present().then((loader) => {
      loader.present();

      delete (this.admission.case.showFacilityDropdown);
      delete (this.admission.case.showSurgicalCodeDropdown);
      delete (this.admission.case.selectedRowIndex);
      // tslint:disable-next-line: prefer-for-of
      for (let i = 0; i < this.admission.case.surgicalCodes.length; i++) {
        delete (this.admission.case.surgicalCodes[i].selectedRowIndex);
        delete (this.admission.case.surgicalCodes[i].showDropdown);
      }
      this.mode = 'preview';
      const msg = 'Case information';
      this.dataService.saveAdmissionDataToFirebase(this.admission, msg);
    });
  }
  // openDropdown(info, dropdownName) {
  public openDropdown(dropdownName, event) {
    // info.showDropdown = dropdownName;
    this.closeDropdowns();
    event.stopPropagation();
    this.nameToSearch = '';
    this.allSurgicalCode.forEach((surgicalCode) => {
      surgicalCode.show = true;
    });
    this.allFacilities.forEach((facility) => {
      facility.show = true;
    });
    if (dropdownName === 'facility') {
      // info.showFacilityDropdown = !info.showFacilityDropdown
      this.admission.case.showFacilityDropdown = !this.admission.case.showFacilityDropdown;
    } else if (dropdownName === 'surgical-code') {
      // info.showSurgicalCodeDropdown = !info.showSurgicalCodeDropdown;
      this.admission.case.showSurgicalCodeDropdown = !this.admission.case.showSurgicalCodeDropdown;
    }
  }
  public servicesSearchTextChanged() {
    if (this.nameToSearch !== '') {
      this.nameToSearch = '';
    }
  }
  public servicesSearchTextFocusOut() {
  }
  public searchFacility() {
    this.nameToSearch = this.nameToSearch.trim().replace(/\s\s+/g, ' ');
    this.allFacilities.forEach((facility) => {
      if (facility.name.toLowerCase().includes(this.nameToSearch.toLowerCase()) || this.nameToSearch === '') {
        facility.show = true;
      } else {
        facility.show = false;
      }
    });
  }
  // selectFacility(facility, policyNameIndex, rowIndex) {
  public selectFacility(facility, policyNameIndex) {
    facility.isSelected = true;
    this.admission.case.selectedRowIndex = policyNameIndex;
    if (this.admission.case.facilities !== '' && this.admission.case.facilities !== '-') {
      const findPolicyNameIndex = _.findIndex(this.allFacilities, (o) => o.name === this.admission.case.facilities);
      if (findPolicyNameIndex !== -1) {
        this.allFacilities[findPolicyNameIndex].isSelected = false;
      }
    }
    this.admission.case.facilities = facility.name;
    this.admission.case.showFacilityDropdown = false;
  }
  public openSurgicalCodeDropdown(code, event) {
    event.stopPropagation();
    this.closeDropdowns();
    this.nameToSearch = '';
    this.allSurgicalCode.forEach((surgicalCode) => {
      surgicalCode.show = true;
    });
    this.allFacilities.forEach((facility) => {
      facility.show = true;
    });
    code.showDropdown = !code.showDropdown;
  }
  public searchSurgicalCode() {
    this.nameToSearch = this.nameToSearch.trim().replace(/\s\s+/g, ' ');
    this.allSurgicalCode.forEach((surgicalCode) => {
      if (surgicalCode.code.toLowerCase().includes(this.nameToSearch.toLowerCase()) || this.nameToSearch === '') {
        surgicalCode.show = true;
      } else {
        surgicalCode.show = false;
      }
    });
  }
  public selectSurgicalCode(surgicalCode, policyNameIndex, rowIndex) {
    surgicalCode.isSelected = true;
    this.admission.case.surgicalCodes[rowIndex].selectedRowIndex = policyNameIndex;
    if (this.admission.case.surgicalCodes[rowIndex].code !== '' && this.admission.case.surgicalCodes[rowIndex].code !== '-') {
      const findPolicyNameIndex = _.findIndex(this.allSurgicalCode, (o) => o.code === this.admission.case.surgicalCodes[rowIndex].code);
      if (findPolicyNameIndex !== -1) {
        this.allSurgicalCode[findPolicyNameIndex].isSelected = false;
      }
    }
    this.admission.case.surgicalCodes[rowIndex].code = surgicalCode.code;
    this.admission.case.surgicalCodes[rowIndex].showDropdown = false;
  }
  public addNewSurgicalCode() {
    const obj = {
      code: '-',
    };
    this.admission.case.surgicalCodes.push(obj);
  }
  public closeDropdowns() {
    this.admission.case.showFacilityDropdown = false;
    // tslint:disable-next-line: no-unused-expression
    // tslint:disable-next-line: prefer-for-of
    for (let i = 0; i < this.admission.case.surgicalCodes.length; i++) {
      this.admission.case.surgicalCodes[i].showDropdown = false;
    }
    return;
  }
  public openSearch(event) {
    event.stopPropagation();
  }
  public deleteSurgicalCode(doc, index) {
    for (let i = 0; i < this.allSurgicalCode.length; i++) {
      if (this.allSurgicalCode[i].code === doc.code) {
        this.allSurgicalCode[i].isSelected = false;
      }
    }
    this.admission.case.surgicalCodes.splice(index, 1);
  }
}
