import { Component, OnInit } from '@angular/core';
import { SocialSharing } from '@ionic-native/social-sharing/ngx';
import * as _ from 'lodash';
import { AppDataService } from 'src/app/services/app-data.service';
import { FirebaseService } from 'src/app/services/firebase.service';
import html2pdf from 'html2pdf.js';
import * as jsPDF from 'jspdf';
@Component({
  selector: 'app-export-info',
  templateUrl: './export-info.page.html',
  styleUrls: ['./export-info.page.scss'],
})
export class ExportInfoPage implements OnInit {
  public loggedInUserType = 'agent';
  public template = '-';
  public nameToSearch = '';
  public case: any;
  public clientDetails: any;
  public clientProfileKeys = [];
  public activatedPolicies: any;
  public allTemplates = [
    {
      name: 'Referral',
      show: true,
    },
    {
      name: 'Patient Information',
      show: true,
    },
    {
      name: 'NOK',
      show: true,
    },
    {
      name: 'Policy Activated',
      show: true,
    },
    {
      name: 'Medical Plan',
      show: true,
    },
  ];
  public showTemplateDropdown = false;
  public caseInfoKeys = [
    {
      key: 'Case Type',
      isSelected: true,
    },
    {
      key: 'Case Name',
      isSelected: true,
    },
    {
      key: 'Case Description',
      isSelected: true,
    },
  ];
  public caseDetailsKeys = [
    {
      key: 'Case Number',
      isSelected: true,
    },
    {
      key: 'Diagnosis',
      isSelected: true,
    },
    {
      key: 'Hospital',
      isSelected: true,
    },
    {
      key: 'Surgical Code',
      isSelected: true,
    },
    {
      key: 'Date Admission',
      isSelected: true,
    },
    {
      key: 'Date Discharge',
      isSelected: true,
    },
  ];
  // ? for checkboxes 'checked' property;
  public isClientProfileSelected = true;
  public isCaseInfoSelected = true;
  public isCaseDetailsSelected = true;
  // ? when checkbox is actually clicked by user;
  public isClientProfileClicked = false;
  public isCaseInfoClicked = false;
  public isCaseDetailsClicked = false;
  // ? for rows dropdown
  public allRows = [
    {
      value: '-',
      showDropDown: false,
      selectedPropertyIndex: -1,
    },
    {
      value: '-',
      showDropDown: false,
      selectedPropertyIndex: -1,
    },
    {
      value: '-',
      showDropDown: false,
      selectedPropertyIndex: -1,
    },
    {
      value: '-',
      showDropDown: false,
      selectedPropertyIndex: -1,
    },
    {
      value: '-',
      showDropDown: false,
      selectedPropertyIndex: -1,
    },
    {
      value: '-',
      showDropDown: false,
      selectedPropertyIndex: -1,
    },
  ];
  public allSelectedProperties = [];
  public message: any;
  constructor(private dataService: AppDataService, private firebase: FirebaseService, private socialSharing: SocialSharing) { }
  // tslint:disable-next-line: use-lifecycle-interface
  public ngAfterViewInit() {
    this.dataService.present().then((loader) => {
      loader.present();
      // ? publish the header title you want to display in header
      const obj = {
        title: 'Case Details',
        backPage: '/client-case-profile',
      };
      this.dataService.setHeaderTitle(obj);
      this.isClientProfileSelected = true;
      this.case = this.dataService.getSelectedCase();
      this.firebase.getUserDetails(this.case.clientId).subscribe((data) => {
        let temp;
        temp = data.data();
        // temp.id = data.id;
        const date = new Date(temp.dateOfBirth);
        const m: any = date.getMonth() + 1;
        const mLen = m.toString().length;
        let month;
        if (mLen === 1) {
          month = '0' + m;
        } else {
          month = m;
        }
        const day = temp.dateOfBirth.split(' ')[0];
        const year = temp.dateOfBirth.split(' ')[2];
        temp.dob = day + '/' + month + '/' + year;
        const diffMs = Date.now() - date.getTime();
        const ageDt = new Date(diffMs);
        const age = Math.abs(ageDt.getUTCFullYear() - 1970);
        temp.age = age;
        temp.heightCm = Number(temp.height / 0.032808).toFixed(1);
        this.clientDetails = temp;
        const clientKeys = _.keys(this.clientDetails);
        // tslint:disable-next-line: prefer-for-of
        for (let i = 0; i < clientKeys.length; i++) {
          const key = clientKeys[i];
          if (key !== 'id' && key !== 'password' && key !== 'type') {
            this.clientProfileKeys.push({ key: key.match(/([A-Z]?[^A-Z]*)/g).join(' '), isSelected: true });
          }
        }
        this.setAllPropertiesToRowsDropdownArray();
      });
      this.activatedPolicies = this.dataService.getAdmissionData();
      this.dataService.dismiss();
    });
  }
  public ngOnInit() {
  }
  public setAllPropertiesToRowsDropdownArray() {
    this.allSelectedProperties = [];
    // ? get all keys whose isSelected=true in allSelectedProperties array
    _.forEach(this.clientProfileKeys, (key) => {
      this.allSelectedProperties.push({ key: key.key, show: key.isSelected, isSelectedInDropdown: false });
    });
    _.forEach(this.caseDetailsKeys, (key) => {
      this.allSelectedProperties.push({ key: key.key, show: key.isSelected, isSelectedInDropdown: false });
    });
    _.forEach(this.caseInfoKeys, (key) => {
      this.allSelectedProperties.push({ key: key.key, show: key.isSelected, isSelectedInDropdown: false });
    });
  }
  public selectBlock(event, type) {
    if (this.isClientProfileClicked || this.isCaseInfoClicked || this.isCaseDetailsClicked) {
      const eventObj = {
        target: { checked: event.target.checked },
      };
      if (type === 'client-profile') {
        this.isClientProfileSelected = event.target.checked;
      } else if (type === 'case-info') {
        this.isCaseInfoSelected = event.target.checked;
      } else if (type === 'case-details') {
        this.isCaseDetailsSelected = event.target.checked;
      }
      this.selectProperty(eventObj, type, 'all');
    }
  }
  public selectProperty(event, type, property) {
    // ? if the checkbox is clicked by user
    /**  if checkbox is selected/unselected by user,
     *  'property' will be an object.
     * But if 'property' is null,
     * all the property's 'isSelected' key has to be set to true/false, respectively;
    */
    if (property === 'all') {
      let propertyArr = [];
      if (type === 'client-profile') {
        propertyArr = this.clientProfileKeys;
      }
      if (type === 'case-info') {
        propertyArr = this.caseInfoKeys;
      }
      if (type === 'case-details') {
        propertyArr = this.caseDetailsKeys;
      }
      _.forEach(propertyArr, (key) => {
        key.isSelected = event.target.checked;
      });
    } else {
      property.isSelected = event.target.checked;
    }
    /** if 'isSelected' of all elements in any keys' array is true,
     * select that block's title
     *  if 'isSelected' of all elements in any keys' array is false,
     * unselect that block's title
     */
    this.checkToSelectAllProperties(type);
  }
  public checkToSelectAllProperties(type) {
    let propertyArr = [];
    if (type === 'client-profile') {
      propertyArr = this.clientProfileKeys;
    }
    if (type === 'case-info') {
      propertyArr = this.caseInfoKeys;
    }
    if (type === 'case-details') {
      propertyArr = this.caseDetailsKeys;
    }
    const allSelectedArray = _.filter(propertyArr, (o) => {
      return o.isSelected === true;
    });
    if (allSelectedArray.length === propertyArr.length) {
      if (type === 'client-profile') {
        this.isClientProfileSelected = true;
      }
      if (type === 'case-info') {
        this.isCaseInfoSelected = true;
      }
      if (type === 'case-details') {
        this.isCaseDetailsSelected = true;
      }
    } else if (allSelectedArray.length < propertyArr.length) {
      if (type === 'client-profile') {
        this.isClientProfileSelected = false;
      }
      if (type === 'case-info') {
        this.isCaseInfoSelected = false;
      }
      if (type === 'case-details') {
        this.isCaseDetailsSelected = false;
      }
    }
    this.setAllPropertiesToRowsDropdownArray();
  }
  public isCheckboxClicked(type) {
    if (type === 'client-profile') {
      this.isClientProfileClicked = true;
    }
    if (type === 'case-info') {
      this.isCaseInfoClicked = true;
    }
    if (type === 'case-details') {
      this.isCaseDetailsClicked = true;
    }
  }
  public copyToClipboard(item) {
    document.addEventListener('copy', (e: ClipboardEvent) => {
      e.clipboardData.setData('text/plain', (item));
      e.preventDefault();
      this.dataService.presentAlert('Copied to clipboard');
      document.removeEventListener('copy', null);
    });
    document.execCommand('copy');
  }
  public openTemplateDropdown(event) {
    event.stopPropagation();
    this.showTemplateDropdown = !this.showTemplateDropdown;
  }
  public servicesSearchTextChanged() {
    if (this.nameToSearch === 'Search') {
      this.nameToSearch = '';
    }
  }
  public servicesSearchTextFocusOut() {
    if (this.nameToSearch === '') {
      this.nameToSearch = 'Search';
    }
  }
  public searchTemplate() {
    this.nameToSearch = this.nameToSearch.trim().replace(/\s\s+/g, ' ');
    this.allTemplates.forEach((temp) => {
      if (temp.name.toLowerCase().includes(this.nameToSearch.toLowerCase()) || this.nameToSearch === '') {
        temp.show = true;
      } else {
        temp.show = false;
      }
    });
  }
  public selectTemplate(template, index) {
    this.template = template.name;
    this.showTemplateDropdown = false;
  }
  public openRowsDropdown(event, row) {
    event.stopPropagation();
    // tslint:disable-next-line: prefer-for-of
    for (let i = 0; i < this.allRows.length; i++) {
      if (this.allRows[i].showDropDown) {
        this.allRows[i].showDropDown = false;
      }
    }
    row.showDropDown = !row.showDropDown;
  }
  public selectPropertyInRow(selectedproperty, propertyNameIndex, rowIndex) {
    this.allRows[rowIndex].selectedPropertyIndex = propertyNameIndex;
    if (this.allRows[rowIndex].value !== '' && this.allRows[rowIndex].value !== '-') {
      const findPolicyNameIndex = _.findIndex(this.allSelectedProperties, (o) => o.key === this.allRows[rowIndex].value);
      if (findPolicyNameIndex !== -1) {
        this.allSelectedProperties[findPolicyNameIndex].isSelectedInDropdown = false;
      }
    }
    this.allRows[rowIndex].value = selectedproperty.key;
    this.allRows[rowIndex].showDropDown = false;
    selectedproperty.isSelectedInDropdown = true;
  }
  public closeAllDropdowns() {
    if (this.loggedInUserType === 'admin') {
      this.showTemplateDropdown = false;
      // tslint:disable-next-line: prefer-for-of
      for (let i = 0; i < this.allRows.length; i++) {
        this.allRows[i].showDropDown = false;
      }
    }
  }
  public shareSocialMedia() {
    const message = this.template;
    const subject = this.template;
    const link = null;
    let file = '';
    // const element = document.getElementById('export-info-pdf-wrap');
    const element = document.getElementById('pdf-wrap');
    const opt = {
      margin: [30, 10],
      filename: this.template + '.pdf',
      html2canvas: {
        useCORS: true,
        // backgroundColor: null,
        scale: 1,
      },
      image: { type: 'jpg', quality: 0.95 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      // pagebreak: { mode: ['css', 'legacy'] }
    };
    html2pdf()
      .set(opt)
      .from(element)
      .toPdf()
      .output('datauristring').then((resp) => {
        file = resp;
        this.socialSharing.share(message, subject, file, link)
          // this.socialSharing.shareViaWhatsApp(msg)
          .then(() => { })
          .catch(() => { });
      });
  }
}
