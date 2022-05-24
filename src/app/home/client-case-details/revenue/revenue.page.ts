/* eslint-disable id-blacklist */
/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable @typescript-eslint/prefer-for-of */
/* eslint-disable max-len */
import { AfterViewInit, Component, Input, NgZone, OnInit } from '@angular/core';
import * as _ from 'lodash';
import { AppDataService } from 'src/app/services/app-data.service';
import { FirebaseService } from 'src/app/services/firebase.service';
declare let SelectPure: any;
@Component({
  selector: 'app-revenue',
  templateUrl: './revenue.page.html',
  styleUrls: ['./revenue.page.scss'],
})
export class RevenuePage implements OnInit, AfterViewInit {
  public showRevenueInfoPopup = false;
  public nameToSearch;
  public emptyList: any = [];
  public allHospitals = [];
  public allDoctors = [];
  public allDoctorsDropdownList = [];
  public admission: any = {
    revenue: {
      individualBill: [
        {
          type: 'Hospital',
          code: '-',
          hospitalBill: '',
          revenue: '',
          pcareAmount: '',
          tolAmount: '0.00',
          totalAmount: '',
          tranche: '',
          showDropdown: false,
          selectedRowIndex: -1,
          showMenu: false,
        },
        {
          type: 'Doctor',
          code: '-',
          hospitalBill: '',
          revenue: '',
          pcareAmount: '',
          tolAmount: '0.00',
          totalAmount: '',
          tranche: '',
          showDropdown: false,
          selectedRowIndex: -1,
          showMenu: false,
        }],
      totalHospitalBill: '',
      totalRevenue: '',
      totalAmt: '',
      totalPcareAmount: '',
      totalTolAmount: '',
      hospitalBill: '',
      lockRevenue: false,
      referrerFee: '',
    },
  };
  public hospitalSelector: any;
  public doctorSelector: any = [];
  public showDoctorDropdown = false;
  public showErrorMsg = false;
  public unallocatedAmount;
  public caseData: any;
  public patientData: any;
  public assignedToAgentName = '';
  public loggedInUser: any;
  public lockButtonText = 'Lock';
  constructor(private dataService: AppDataService, private firebase: FirebaseService) { }
  public ngOnInit() { }
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
      this.caseData = this.dataService.getSelectedCase();
      console.log('this.caseData: ', this.caseData);
      this.admission = this.dataService.getAdmissionData();
      if (this.admission.case.admissionDate && this.admission.case.admissionDate !== '') {
        this.admission.case.admissionDate = this.admission.case.admissionDate.replace(/,/g, ' ');
      }
      if (this.admission.case.dischargeDate && this.admission.case.dischargeDate !== '') {
        this.admission.case.dischargeDate = this.admission.case.dischargeDate.replace(/,/g, ' ');
      }
      this.getDoctors();
      if (this.admission.revenue.lockRevenue === undefined) {
        this.admission.revenue.lockRevenue = false;
      }
      if (this.admission.revenue.lockRevenue === true) {
        this.lockButtonText = 'Unlock';
      } else {
        this.lockButtonText = 'Lock';
      }
      this.patientData = this.dataService.getPatientData();
      // ? get assigned agent of patient from firebase
      this.firebase.getUserDetails(this.patientData.assignedToAgentId).subscribe((resp) => {
        this.assignedToAgentName = resp.data() ? resp.data().name : '';
        this.loggedInUser = this.dataService.getUserData();
        this.dataService.dismiss();
      });
      this.calculateUnallocatedAmt();
    });
  }
  public openDropdown(event, doctor) {
    event.stopPropagation();
    this.closeAllDropdown(doctor);
    doctor.showDropdown = !doctor.showDropdown;
    this.nameToSearch = '';
    this.showAllDoctorNames();
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
  public getDoctors() {
    this.firebase.getDoctorsClinic().subscribe((resp) => {
      const data = [];
      if (resp.size !== 0) {
        resp.docs.forEach((element) => {
          const temp: any = element.data();
          temp.id = element.id;
          temp.show = true;
          temp.isDoctorSelected = false;
          temp.doctorCode = temp.doctorCode;
          if (!this.checkIfCodeAlreadyPresent(data, temp.doctorCode)) {
            data.push(temp);
          }
        });
        // this.allDoctors = data;
        this.allDoctors = _.orderBy(data, ['doctorCode', 'asc']);

        this.setDoctorVariables();
      }
      this.getHospitals();
    });
  }

  public getHospitals() {
    this.firebase.getFacility().subscribe((resp) => {
      const data = [];
      if (resp.size !== 0) {
        resp.docs.forEach((element) => {
          const temp: any = element.data();

          temp.id = element.id;
          temp.show = true;
          temp.isHospitalSelected = false;
          temp.code = temp.code;
          data.push(temp);
        });
        // this.allHospitals = data;
        this.allHospitals = _.orderBy(data, ['code', 'asc']);
        this.setDoctorVariables();
      }
    });
  }
  public checkIfCodeAlreadyPresent(codesArr, code) {
    const alreadyPresent = _.filter(codesArr, ['doctorCode', code]);
    if (alreadyPresent.length > 0) {
      return true;
    } else {
      return false;
    }
  }
  public setDoctorVariables() {
    for (let i = 0; i < this.admission.revenue.individualBill.length; i++) {
      const element = this.admission.revenue.individualBill[i];
      element.showDropdown = false;
      element.selectedRowIndex = -1;
      element.showMenu = false;
      element.code = element.code.substr(0, 4);
      if (element.type === 'Hospital') {
        // tslint:disable-next-line: prefer-for-of
        for (let j = 0; j < this.allDoctors.length; j++) {
          if (element.code !== '-' && this.allDoctors[j].clinicCode === element.code) {
            this.allDoctors[j].isHospitalSelected = true;
            element.selectedRowIndex = j;
          }
        }
      } else if (element.type === 'Doctor') {
        // tslint:disable-next-line: prefer-for-of
        for (let j = 0; j < this.allDoctors.length; j++) {
          if (element.code !== '-' && this.allDoctors[j].doctorCode === element.code) {
            this.allDoctors[j].isDoctorSelected = true;
            element.selectedRowIndex = j;
          }
        }
      }
    }
  }
  public optionlMenuList(className: any, initialValue: any, options: any, type) {
    return new SelectPure(className, {
      options,
      multiple: false,
      autocomplete: true,
      value: initialValue,
      icon: 'label-cross',
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
        if (type === 'hospital') {
          // value.forEach(element => {
          const find = _.find(this.allHospitals, { id: value });
          if (find) {
          }
        } else if (type === 'doctor') {
          const data = _.find(this.allDoctorsDropdownList, ['id', value]);
          if (data) {
            data.isSelected = true;
          }
          this.updateDoctorsList();
        }
      },
    });
  }
  public addDoctor() {
    if (this.admission.revenue.individualBill.length - 1 <
      this.allDoctors.length) {
      this.admission.revenue.individualBill.push({
        type: 'Doctor',
        code: '-',
        hospitalBillBreakdown: '',
        revenue: '',
        pcareAmount: '',
        tolAmount: '0.00',
        totalAmount: '',
        tranche: '',
        showDropdown: false,
        selectedRowIndex: -1,
      });
    } else {
    }
  }
  public resetDropdown() {
    if (this.admission.revenue.individualBill.length > 2) {
      const className = '.doctor-selection' + (this.admission.revenue.individualBill.length - 1);
      this.doctorSelector[this.admission.revenue.individualBill.length - 1] = this.optionlMenuList(className, this.emptyList.label, this.allDoctorsDropdownList, 'doctor');
    }
  }
  public updateDoctorsList() {
    const remainingDoctors = _.filter(this.allDoctorsDropdownList, (doc) => {
      if (!doc.isSelected) {
        return doc;
      }
    });
    this.allDoctorsDropdownList = this.createSelectPureInputFromArray(remainingDoctors);
  }
  public deleteDoctor(doc, docIndex) {
    // ? subtract hospitalBill, revenueCase and revenueAmount values from respective totals
    if (this.admission.revenue.totalHospitalBill && doc.hospitalBill !== '' && doc.hospitalBill !== undefined) {
      let total = this.admission.revenue.totalHospitalBill.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');
      const hospitalBill = doc.hospitalBill.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');
      total -= hospitalBill;
      const amt = total.toFixed(2);
      this.admission.revenue.totalHospitalBill = this.formatInput(amt);
    }
    if (this.admission.revenue.totalRevenue && doc.revenue !== '' && doc.revenue !== undefined) {
      let total = this.admission.revenue.totalRevenue.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');
      const revenue = doc.revenue.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');
      total -= revenue;
      const amt = total.toFixed(2);
      this.admission.revenue.totalRevenue = this.formatInput(amt);
    }
    if (this.admission.revenue.totalPcareAmount && doc.pcareAmount !== '' && doc.pcareAmount !== undefined) {
      let total = this.admission.revenue.totalPcareAmount.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');
      const pcareAmount = doc.pcareAmount.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');
      total -= pcareAmount;
      const amt = total.toFixed(2);
      this.admission.revenue.totalPcareAmount = this.formatInput(amt);
    }
    if (this.admission.revenue.totalTolAmount && doc.tolAmount !== '' && doc.tolAmount !== undefined) {
      let total = this.admission.revenue.totalTolAmount.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');
      const tolAmount = doc.tolAmount.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');
      total -= tolAmount;
      const amt = total.toFixed(2);
      this.admission.revenue.totalTolAmount = this.formatInput(amt);
    }
    if (this.admission.revenue.totalAmt && doc.totalAmount !== '' && doc.totalAmount !== undefined) {
      let total = this.admission.revenue.totalAmt.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');
      const totalAmount = doc.totalAmount.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');
      total -= totalAmount;
      const amt = total.toFixed(2);
      this.admission.revenue.totalAmt = this.formatInput(amt);
    }
    this.calculateUnallocatedAmt();
    for (let i = 0; i < this.allDoctors.length; i++) {
      if (this.allDoctors[i].doctorCode === doc.code) {
        this.allDoctors[i].isDoctorSelected = false;
      }
    }
    this.admission.revenue.individualBill.splice(docIndex, 1);
  }
  calculateGst(i, doc) {
    this.admission.revenue.individualBill[i].gst = ((this.admission.revenue.individualBill[i].hospitalBill / 1.07 ) * 0.07).toFixed(2);
    this.calculateTotal('gst', doc);
    this.calculateTotalNonBillableAmt(i, doc);
  }
  calculateTotalNonBillableAmt(i, doc) {
    if (this.admission.revenue.individualBill[i].gst && this.admission.revenue.individualBill[i].gst !== '') {
      this.admission.revenue.individualBill[i].hospitalBill = this.admission.revenue.individualBill[i].hospitalBill.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');
      this.admission.revenue.individualBill[i].gst = this.admission.revenue.individualBill[i].gst.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');
      this.admission.revenue.individualBill[i].revenue = this.admission.revenue.individualBill[i].revenue.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');
      this.admission.revenue.individualBill[i].nonBillableAmt = (this.admission.revenue.individualBill[i].hospitalBill - this.admission.revenue.individualBill[i].gst - this.admission.revenue.individualBill[i].revenue).toFixed(2);
      this.calculateTotal('nonBillableAmt', doc);
    }
  }
  public calculateTotal(type, doc) {
    if (type === 'hospital-bill') {
      this.admission.revenue.totalHospitalBill = 0;
      let temp = 0;
      // tslint:disable-next-line: prefer-for-of
      for (let i = 0; i < this.admission.revenue.individualBill.length; i++) {
        const doc = this.admission.revenue.individualBill[i];
        if (doc.hospitalBill && doc.hospitalBill !== '') {
          const number = doc.hospitalBill
            .replace(/[^0-9.]/g, '')
            .replace(/(\..*)\./g, '$1');
          temp += parseFloat(number);
          const total = temp.toFixed(2);
          this.admission.revenue.totalHospitalBill = this.formatInput(total);
        }
      }
      // ? calculate unallocated amount
      this.calculateUnallocatedAmt();
    }
    if (type === 'gst') {
      this.admission.revenue.totalGst = 0;
      let temp = 0;
      // tslint:disable-next-line: prefer-for-of
      for (let i = 0; i < this.admission.revenue.individualBill.length; i++) {
        const doc = this.admission.revenue.individualBill[i];
        if (doc.gst && doc.gst !== '') {
          const number = doc.gst.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');
          temp += parseFloat(number);
          const total = temp.toFixed(2);
          this.admission.revenue.totalGst = this.formatInput(total);
        }
      }
    }
    if (type === 'nonBillableAmt') {
      this.admission.revenue.totalNonBillableAmt = 0;
      let temp = 0;
      // tslint:disable-next-line: prefer-for-of
      for (let i = 0; i < this.admission.revenue.individualBill.length; i++) {
        const doc = this.admission.revenue.individualBill[i];
        if (doc.nonBillableAmt && doc.nonBillableAmt !== '') {
          const number = doc.nonBillableAmt.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');
          temp += parseFloat(number);
          const total = temp.toFixed(2);
          this.admission.revenue.totalNonBillableAmt = this.formatInput(total);
        }
      }
    }
    if (type === 'revenue-case') {
      this.admission.revenue.totalRevenue = 0;
      let temp = 0;
      // tslint:disable-next-line: prefer-for-of
      for (let i = 0; i < this.admission.revenue.individualBill.length; i++) {
        const doc = this.admission.revenue.individualBill[i];
        if (doc.revenue && doc.revenue !== '') {
          const number = doc.revenue
            .replace(/[^0-9.]/g, '')
            .replace(/(\..*)\./g, '$1');
          temp += parseFloat(number);
          const total = temp.toFixed(2);
          this.admission.revenue.totalRevenue = this.formatInput(total);
        }
      }
    }
    if (type === 'Total-Amt') {
      this.admission.revenue.totalAmt = 0;
      let temp = 0;
      // tslint:disable-next-line: prefer-for-of
      for (let i = 0; i < this.admission.revenue.individualBill.length; i++) {
        const doc = this.admission.revenue.individualBill[i];
        if (doc.totalAmount && doc.totalAmount !== '') {
          const number = doc.totalAmount
            .replace(/[^0-9.]/g, '')
            .replace(/(\..*)\./g, '$1');
          temp += parseFloat(number);
          const total = temp.toFixed(2);
          this.admission.revenue.totalAmt = this.formatInput(total);
        }
      }
      this.calculateTolAmt(doc);
    }
    if (type === 'tol-amt') {
      this.admission.revenue.totalTolAmount = 0;
      let temp = 0;
      // tslint:disable-next-line: prefer-for-of
      for (let i = 0; i < this.admission.revenue.individualBill.length; i++) {
        const doc = this.admission.revenue.individualBill[i];
        if (doc.tolAmount && doc.tolAmount !== '') {
          const number = doc.tolAmount
            .replace(/[^0-9.]/g, '')
            .replace(/(\..*)\./g, '$1');
          temp += parseFloat(number);
          const total = temp.toFixed(2);
          this.admission.revenue.totalTolAmount = this.formatInput(total);
        }
      }
      this.calculateTolAmt(doc);
    }
  }
  public calculateTolAmt(doc) {
    doc.pcareAmount = 0;
    const tolAmt = doc.tolAmount
      .replace(/[^0-9.]/g, '')
      .replace(/(\..*)\./g, '$1');
    const totalAmt = doc.totalAmount
      .replace(/[^0-9.]/g, '')
      .replace(/(\..*)\./g, '$1');
    if (tolAmt !== '' && totalAmt === '') {
      doc.pcareAmount = '';
      this.calculateTolAmount();
    } else if (tolAmt === '' && totalAmt !== '') {
      const total = parseFloat(totalAmt).toFixed(2);
      doc.pcareAmount = this.formatInput(total);
      this.calculateTolAmount();
    } else if (tolAmt !== '' && totalAmt !== '') {
      const temp = parseFloat(totalAmt) - parseFloat(tolAmt);
      const total = temp.toFixed(2);
      doc.pcareAmount = this.formatInput(total);
      this.calculateTolAmount();
    } else if (tolAmt === '' && totalAmt === '') {
      doc.pcareAmount = '';
      this.calculateTolAmount();
    }
  }
  public calculateTolAmount() {
    this.admission.revenue.totalPcareAmount = 0;
    let temp = 0;
    // tslint:disable-next-line: prefer-for-of
    for (let i = 0; i < this.admission.revenue.individualBill.length; i++) {
      // tslint:disable-next-line: no-shadowed-variable
      const doc = this.admission.revenue.individualBill[i];
      if (doc.pcareAmount && doc.pcareAmount !== '') {
        const number = doc.pcareAmount
          .replace(/[^0-9.]/g, '')
          .replace(/(\..*)\./g, '$1');
        temp += parseFloat(number);
        const total = temp.toFixed(2);
        this.admission.revenue.totalPcareAmount = this.formatInput(total);
      }
    }
  }
  public calculateUnallocatedAmt() {
    this.unallocatedAmount = 0;
    let hospitalBill = 0;
    this.admission.revenue.totalHospitalBill =
      typeof (this.admission.revenue.totalHospitalBill) === 'number'
        ? this.admission.revenue.totalHospitalBill.toString()
        : this.admission.revenue.totalHospitalBill;
    const totalHospitalBill = this.admission.revenue.totalHospitalBill
      .replace(/[^0-9.]/g, '')
      .replace(/(\..*)\./g, '$1');
    if (
      this.admission.revenue.hospitalBill &&
      this.admission.revenue.hospitalBill !== ''
    ) {
      hospitalBill = parseFloat(
        this.admission.revenue.hospitalBill
          .replace(/[^0-9.]/g, '')
          .replace(/(\..*)\./g, '$1')
      );
    }
    if (
      this.admission.revenue.totalHospitalBill &&
      this.admission.revenue.totalHospitalBill !== ''
    ) {
      const total = (hospitalBill - totalHospitalBill).toFixed(2);
      this.unallocatedAmount = this.formatInput(total);
    } else {
      this.unallocatedAmount = hospitalBill;
    }
  }
  public servicesSearchTextChanged() {
    if (this.nameToSearch === '') {
      this.nameToSearch = '';
    }
  }
  public servicesSearchTextFocusOut() {
    this.nameToSearch = '';
    this.showAllDoctorNames();
  }
  public showAllDoctorNames() {
    for (let i = 0; i < this.allDoctors.length; i++) {
      const element = this.allDoctors[i];
      element.show = true;
    }
  }
  public searchHospitalName(type) {
    let arrayName;
    if (type === 'Hospital') {
      arrayName = this.allDoctors;
      arrayName.forEach((hospital) => {
        if (hospital.clinicCode
          .toLowerCase()
          .includes(this.nameToSearch.toLowerCase()) ||
          this.nameToSearch === '') {
          hospital.show = true;
        } else {
          hospital.show = false;
        }
      });
    } else if (type === 'Doctor') {
      arrayName = this.allDoctors;
      arrayName.forEach((doctor) => {
        if (
          doctor.doctorCode
            .toLowerCase()
            .includes(this.nameToSearch.toLowerCase()) ||
          this.nameToSearch === ''
        ) {
          doctor.show = true;
        } else {
          doctor.show = false;
        }
      });
    }
  }
  public selectDoc(doc, docNameIndex, rowIndex, type) {
    this.admission.revenue.individualBill[rowIndex].selectedRowIndex =
      docNameIndex;
    if (type === 'Hospital') {
      doc.isHospitalSelected = true;
      const findPolicyNameIndex = _.findIndex(this.allHospitals, (o) =>
        o.clinicCode === this.admission.revenue.individualBill[rowIndex].code
      );
      this.admission.revenue.individualBill[rowIndex].code = doc.code;
      if (findPolicyNameIndex !== -1) {
        this.allDoctors[findPolicyNameIndex].isHospitalSelected = false;
      }
    } else if (type === 'Doctor') {
      doc.isDoctorSelected = true;
      const findPolicyNameIndex = _.findIndex(this.allDoctors, (o) =>
          o.doctorCode === this.admission.revenue.individualBill[rowIndex].code
      );
      this.admission.revenue.individualBill[rowIndex].code = doc.doctorCode;
      if (findPolicyNameIndex !== -1) {
        this.allDoctors[findPolicyNameIndex].isDoctorSelected = false;
      }
    }
    this.admission.revenue.individualBill[rowIndex].showDropdown = false;
  }
  public showMenuList(doc) {
    doc.showMenu = !doc.showMenu;
  }
  public togglePopup() {
    this.showRevenueInfoPopup = !this.showRevenueInfoPopup;
  }
  public saveChanges() {
    if (this.unallocatedAmount === '0.00') {
      this.dataService.present().then((loader) => {
        loader.present();
        // ? delete unwanted keys
        // tslint:disable-next-line: prefer-for-of
        for (let i = 0; i < this.admission.revenue.individualBill.length; i++) {
          delete this.admission.revenue.individualBill[i].showDropdown;
          delete this.admission.revenue.individualBill[i].selectedRowIndex;
          delete this.admission.revenue.individualBill[i].showMenu;
        }
        const msg = 'Finance information';
        this.dataService.saveAdmissionDataToFirebase(this.admission, msg);
        this.setDoctorVariables();
      });
    } else {
      this.dataService.presentAlert('Please allocate the unallocated amount to proceed');
    }
  }
  public lockRevenue() {
    let msg = '';
    if (this.admission.revenue.lockRevenue === false) {
      this.lockButtonText = 'Unlock';
      this.admission.revenue.lockRevenue = true;
      msg = 'Revenue lock';
    } else {
      this.lockButtonText = 'Lock';
      this.admission.revenue.lockRevenue = false;
      msg = 'Revenue unlock';
    }
    this.dataService.saveAdmissionDataToFirebase(this.admission, msg);
  }
  public closeAllDropdown(doctor) {
    for (let i = 0; i < this.admission.revenue.individualBill.length; i++) {
      const element = this.admission.revenue.individualBill[i];
      if (doctor) {
        if (doctor !== element) {
          element.showDropdown = false;
        }
      } else {
        element.showDropdown = false;
      }
    }
  }
  public enterValue(event) {
    event.stopPropagation();
  }
  public trim(type) {
    if (type === 'total-hospital-bill' &&
      this.admission.revenue.hospitalBill &&
      this.admission.revenue.hospitalBill !== '') {
      const temp = this.admission.revenue.hospitalBill
        .replace(/[^0-9.]/g, '')
        .replace(/(\..*)\./g, '$1');
      const amount = parseFloat(temp).toFixed(2);
      this.admission.revenue.hospitalBill = this.formatInput(amount);
    }
    if (type === 'referrer-fee' &&
      this.admission.revenue.referrerFee &&
      this.admission.revenue.referrerFee !== '') {
      const temp = this.admission.revenue.referrerFee
        .replace(/[^0-9.]/g, '')
        .replace(/(\..*)\./g, '$1');
      const amount = parseFloat(temp).toFixed(2);
      this.admission.revenue.referrerFee = this.formatInput(amount);
    }
  }
  public trimInput(type, i) {
    if (type === 'hospital-bill' &&
      this.admission.revenue.individualBill[i] &&
      this.admission.revenue.individualBill[i].hospitalBill &&
      this.admission.revenue.individualBill[i].hospitalBill !== '') {
      const temp = this.admission.revenue.individualBill[i].hospitalBill
        .replace(/[^0-9.]/g, '')
        .replace(/(\..*)\./g, '$1');
      const amount = parseFloat(temp).toFixed(2);
      this.admission.revenue.individualBill[i].hospitalBill =
        this.formatInput(amount);
    }
    if (type === 'revenue-case' &&
      this.admission.revenue.individualBill[i] &&
      this.admission.revenue.individualBill[i].revenue &&
      this.admission.revenue.individualBill[i].revenue !== '') {
      const temp = this.admission.revenue.individualBill[i].revenue
        .replace(/[^0-9.]/g, '')
        .replace(/(\..*)\./g, '$1');
      const amount = parseFloat(temp).toFixed(2);
      this.admission.revenue.individualBill[i].revenue =
        this.formatInput(amount);
    }
    if (type === 'Total-Amt' &&
      this.admission.revenue.individualBill[i] &&
      this.admission.revenue.individualBill[i].totalAmount &&
      this.admission.revenue.individualBill[i].totalAmount !== '') {
      const temp = this.admission.revenue.individualBill[i].totalAmount
        .replace(/[^0-9.]/g, '')
        .replace(/(\..*)\./g, '$1');
      const amount = parseFloat(temp).toFixed(2);
      this.admission.revenue.individualBill[i].totalAmount =
        this.formatInput(amount);
    }
    if (type === 'tol-amt' && this.admission.revenue.individualBill[i] &&
      this.admission.revenue.individualBill[i].tolAmount &&
      this.admission.revenue.individualBill[i].tolAmount !== ''
    ) {
      const temp = this.admission.revenue.individualBill[i].tolAmount.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');
      const amount = parseFloat(temp).toFixed(2);
      this.admission.revenue.individualBill[i].tolAmount = this.formatInput(amount);
    }
    if (type === 'gst' && this.admission.revenue.individualBill[i] &&
      this.admission.revenue.individualBill[i].gst &&
      this.admission.revenue.individualBill[i].gst !== ''
    ) {
      const temp = this.admission.revenue.individualBill[i].gst.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');
      const amount = parseFloat(temp).toFixed(2);
      this.admission.revenue.individualBill[i].gst = this.formatInput(amount);
    }
    if (type === 'nonBillableAmt' && this.admission.revenue.individualBill[i] &&
      this.admission.revenue.individualBill[i].nonBillableAmt &&
      this.admission.revenue.individualBill[i].nonBillableAmt !== ''
    ) {
      const temp = this.admission.revenue.individualBill[i].nonBillableAmt.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');
      const amount = parseFloat(temp).toFixed(2);
      this.admission.revenue.individualBill[i].nonBillableAmt = this.formatInput(amount);
    }
  }
  public formatInput(amt) {
    const parts = amt.toString().split('.');
    return (
      parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',') +
      (parts[1] ? '.' + parts[1] : '')
    );
  }
}
