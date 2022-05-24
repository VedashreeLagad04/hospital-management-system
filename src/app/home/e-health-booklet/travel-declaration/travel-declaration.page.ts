/* eslint-disable max-len */
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController, ModalController } from '@ionic/angular';
import * as _ from 'lodash';
// tslint:disable-next-line: ordered-imports
import { AppDataService } from 'src/app/services/app-data.service';
import { FirebaseService } from 'src/app/services/firebase.service';
import { environment } from 'src/environments/environment';
import { ClientRegistrationTermsModalPage } from '../../client-registration/client-registration-terms-modal/client-registration-terms-modal.page';
@Component({
  selector: 'app-travel-declaration',
  templateUrl: './travel-declaration.page.html',
  styleUrls: ['./travel-declaration.page.scss'],
})
export class TravelDeclarationPage implements OnInit {
  public pdf: any = {
    signature: '',
    date: '',
    time: '',
  };
  nameToSearch = '';
  public allCountries = [];
  public countries = [
    {
      country: 'Jordan',
      show: true
    },
    {
      country: 'Kuwait',
      show: true
    },
    {
      country: 'Lebanon',
      show: true
    },
    {
      country: 'Oman',
      show: true
    },
    {
      country: 'Qatar',
      show: true
    },
    {
      country: 'Saudi Arabia',
      show: true
    },
    {
      country: 'United Arab Emirates',
      show: true
    },
    {
      country: 'Yemen',
      show: true
    },
  ];
  // tslint:disable-next-line: max-line-length
  public vaccines = [];
  // public vaccines = ['Anti-malarial medications', 'Diphtheria', 'Hepatitis A', 'Hepatitis B ', 'Influenza', 'Japanese Encephalitis', 'Measles', 'Meningococcal', 'Mumps', 'Pertussis', 'Polio', 'Rabies', 'Rubella', 'Tetanus', 'Typhoid', 'Yellow Fever'];
  public clientId;
  public case;
  public ehealth;
  public details: any = {};
  public mode = 'preview';
  public showCountryDropdown1 = false;
  public showCountryDropdown4 = false;
  public showCountryDropdown5 = false;
  public selectedCountry1 = '';
  public selectedCountry4 = '';
  public selectedCountry5 = '';
  public pdfFileName;
  public pdfFileDate;
  public loggedInuser;
  public showDates = {
    abroadTravel: '',
    middleEastTravel: '',
    vaccination: [{
      date: '',
    },
    ],
  };
  public internetCheckFlag = false;
  public reloadAgain = true;
  public consentDetails: any = {
    fileKey: '',
    date: '',
    signature: '',
    name: '',
    relation: '',
    guardian: ''
  };
  clientType = 'new';
  // tslint:disable-next-line: max-line-length
  constructor(private activeRoute: ActivatedRoute,
    private firebase: FirebaseService,
    public dataService: AppDataService,
    private alertCtrl: AlertController, private router: Router, private modalController: ModalController) { }
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
  // tslint:disable-next-line: use-lifecycle-interface
  public ngOnDestroy() {
    if (this.dataService.mySubscription) {
      this.dataService.mySubscription.unsubscribe();
    }
  }
  public ionViewDidEnter() {
    this.dataService.present().then((a) => {
      a.present();
      this.activeRoute.paramMap.subscribe((params) => {
        this.clientId = params.get('id');
        this.mode = 'preview';
        this.clientType = this.dataService.getAddOfflineClient();

        // this.firebase.getUserDetails(this.clientId).subscribe((data) => {
        //   this.details = data.data();
        //   this.details.id = data.id;
        //
        // });
      });
      this.firebase.getTypeOfVaccination().subscribe((resp: any) => {
        this.vaccines = [];
        if (resp.size > 0) {
          _.forEach(resp.docs, (doc) => {
            this.vaccines.push({ vaccine: doc.data().vaccine, show: true });
          });
        } else {
          this.vaccines = [
            {
              vaccine: 'Anti-malarial medications',
              show: true
            },
            {
              vaccine: 'Diphtheria',
              show: true
            },
            {
              vaccine: 'Hepatitis A',
              show: true
            },
            {
              vaccine: 'Hepatitis B ',
              show: true
            },
            {
              vaccine: 'Influenza',
              show: true
            },
            {
              vaccine: 'Japanese Encephalitis',
              show: true
            },
            {
              vaccine: 'Measles',
              show: true
            },
            {
              vaccine: 'Meningococcal',
            },
            {
              vaccine: 'Mumps',
              show: true
            },
            {
              vaccine: 'Pertussis',
              show: true
            },
            {
              vaccine: 'Polio',
            },
            {
              vaccine: 'Rabies',
              show: true
            },
            {
              vaccine: 'Rubella',
              show: true
            },
            {
              vaccine: 'Tetanus',
              show: true
            },
            {
              vaccine: 'Typhoid',
              show: true
            },
            {
              vaccine: 'Yellow Fever',
              show: true
            },
          ]
        }
      });
      this.firebase.getCountries().subscribe((resp) => {
        resp.docs.forEach((el) => {
          const temp: any = el.data();
          _.forEach(temp.country, (country) => {
            this.allCountries.push({ country, show: true });;
          });
        });
      });
      this.loggedInuser = this.dataService.getUserData();
      this.case = this.dataService.getSelectedCase();
      // this.firebase.getEhealth(this.case.id).subscribe((resp) => {
      //   resp.docs.forEach((temp) => {
      //     this.ehealth = temp.data();
      //     this.ehealth.id = temp.id;
      this.ehealth = this.dataService.getEhealthData();
      if (_.size(this.ehealth.travelDeclaration) === 0) {
        this.consentDetails = this.ehealth.profile.consentDetails;
        this.consentDetails.guardian = this.ehealth.profile.guardian;
        this.ehealth.travelDeclaration = {
          abroadTravel: {
            answer: '',
            country: '',
            date: '',
          },
          flu: {
            answer: '',
            symptoms: '',
          },
          covid19: {
            contact: '',
            covidCluster: '',
            governmentOrder: '',
          },
          middleEastTravel: {
            answer: '',
            country: '',
            date: '',
          },
          middleEastContact: {
            answer: '',
            country: '',
          },
          travelVaccination: {
            answer: '',
            vaccines: [{
              showVaccineDropdown: false,
              type: '',
              date: '',
            },
            ],
          },
          remarks: '',
          pdfFiles: [],
        };
      } else {
        // if (this.ehealth.travelDeclaration.abroadTravel.country !== '') {
        // }
        if (this.ehealth.travelDeclaration.abroadTravel.date !== '') {
          // tslint:disable-next-line: max-line-length
          // this.ehealth.travelDeclaration.abroadTravel.showDate = this.dateFormater(this.ehealth.travelDeclaration.abroadTravel.date).date;
          this.showDates.abroadTravel = this.dateFormater(this.ehealth.travelDeclaration.abroadTravel.date).date;
        }
        if (this.ehealth.travelDeclaration.middleEastTravel.date !== '') {
          // tslint:disable-next-line: max-line-length
          this.showDates.middleEastTravel = this.dateFormater(this.ehealth.travelDeclaration.middleEastTravel.date).date;
        }
        // tslint:disable-next-line: prefer-for-of
      }
      // ? initialize travel data here
      // this.ehealth.travelDeclaration.abroadTravel.answer = this.ehealth.travelDeclaration.abroadTravel.answer || '';
      // ! do not change/replace this
      if (this.ehealth.travelDeclaration.pdfFiles && this.ehealth.travelDeclaration.pdfFiles.length > 0) {
        const lastIndex = this.ehealth.travelDeclaration.pdfFiles.length - 1;
        const dateTimeObj = this.dataService.getDateAndTimeOfPdfUpload(this.ehealth.travelDeclaration.pdfFiles[lastIndex].date);
        this.pdf.date = dateTimeObj.date;
        this.pdf.time = dateTimeObj.time;
        this.pdf.signature = this.ehealth.travelDeclaration.pdfFiles[lastIndex].signature;
        console.log('this.pdf: ', this.pdf);
        this.consentDetails.name = this.ehealth.travelDeclaration.pdfFiles[lastIndex].name;
        this.consentDetails.guardian = this.ehealth.travelDeclaration.pdfFiles[lastIndex].guardian;
        this.consentDetails.relation = this.ehealth.travelDeclaration.pdfFiles[lastIndex].relation;
        // ! check filename, if filename already present add (1) to it
        // ? eg. 20200825 Travel Declaration PK.pdf is already present, make it 20200825 Travel Declaration PK(1).pdf
        this.pdfFileName = this.ehealth.travelDeclaration.pdfFiles[lastIndex].fileKey;
        this.pdfFileDate = this.ehealth.travelDeclaration.pdfFiles[lastIndex].date;
      }
      // });
      // });
      this.dataService.dismiss();
    });
  }
  public openCountryDropdown1() {
    this.nameToSearch = '';
    this.allCountries = this.dataService.searchFromDropdownList(this.allCountries, this.nameToSearch, 'country');
    this.showCountryDropdown1 = !this.showCountryDropdown1;
  }
  public openCountryDropdown4() {
    this.nameToSearch = '';
    this.countries = this.dataService.searchFromDropdownList(this.countries, this.nameToSearch, 'country');
    this.showCountryDropdown4 = !this.showCountryDropdown4;
  }
  public openCountryDropdown5() {
    this.nameToSearch = '';
    this.countries = this.dataService.searchFromDropdownList(this.countries, this.nameToSearch, 'country');
    this.showCountryDropdown5 = !this.showCountryDropdown5;
  }
  public openVaccineDropdown(travel) {
    travel.showVaccineDropdown = !travel.showVaccineDropdown;
  }
  public selectVaccine(vaccine, travel) {
    travel.type = vaccine;
    travel.showVaccineDropdown = false;
  }
  public selectCountry1(country) {
    this.selectedCountry1 = country;
    this.ehealth.travelDeclaration.abroadTravel.country = country;
    this.showCountryDropdown1 = false;
  }
  public selectCountry4(country) {
    this.selectedCountry4 = country;
    this.ehealth.travelDeclaration.middleEastTravel.country = country;
    this.showCountryDropdown4 = false;
  }
  public selectCountry5(country) {
    this.selectedCountry5 = country;
    this.ehealth.travelDeclaration.middleEastContact.country = country;
    this.showCountryDropdown5 = false;
  }
  public add() {
    // tslint:disable-next-line: no-unused-expression
    this.ehealth.travelDeclaration.travelVaccination.vaccines.push(
      {
        showVaccineDropdown: false,
        type: '',
        date: '',
      },
    );
    this.showDates.vaccination.push({ date: '' });
  }
  public delete(index) {
    this.ehealth.travelDeclaration.travelVaccination.vaccines.splice(index, 1);
  }
  public signForm() {
    // ? if any travel declaration form is previously signed, show below alert
    // ? if travel declaration is not signed, directly open modal
    if (this.pdf.signature !== '') {
      this.dataService.presentReSignFormAlert('Travel Declaration').then((resp: any) => {
        this.mode = resp;
        if (this.mode === 'edit') {
          this.pdf.signature = '';
        }
      });
    } else {
      this.mode = 'edit';
    }
  }
  public saveChanges() {
    this.dataService.present().then((loader) => {
      loader.present();
      // tslint:disable-next-line: prefer-for-of
      for (let i = 0; i < this.ehealth.travelDeclaration.travelVaccination.length; i++) {
        delete this.ehealth.travelDeclaration.travelVaccination[i].showVaccineDropdown;
        // delete this.ehealth.travelDeclaration.travelVaccination[i].showDate;
      }
      // delete this.ehealth.travelDeclaration.abroadTravel.showDate;
      // delete this.ehealth.travelDeclaration.middleEastTravel.showDate;
      //
      this.ehealth.checkboxValue.travelDeclarationTab = true;
      const obj = {
        tabName: 'travel-declaration',
        value: true,
      };
      this.firebase.editEhealth(this.ehealth).then(() => {
        this.dataService.setEhealthData(this.ehealth);
        this.dataService.dismiss();
        this.dataService.presentAlert('Travel Declaration updated successfully!');
        this.dataService.setCheckboxValue(obj);
        this.reloadAgain = true;
      });
    });
  }
  public resetAllRadioInputs() {
    // ? abroad radio input
    // tslint:disable-next-line: one-variable-per-declaration
    let abroadRadioYes; let abroadRadioNo;
    abroadRadioYes = document.getElementById('abroadYes');
    abroadRadioYes.checked =
      (this.ehealth.travelDeclaration.abroadTravel.answer && this.ehealth.travelDeclaration.abroadTravel.answer === 'Yes') ? true : null;
    abroadRadioNo = document.getElementById('abroadNo');
    abroadRadioNo.checked =
      (this.ehealth.travelDeclaration.abroadTravel.answer && this.ehealth.travelDeclaration.abroadTravel.answer === 'No') ? true : null;
    // ? flu radio input
    let fluRadioYes;
    let fluRadioNo;
    fluRadioYes = document.getElementById('fluYes');
    fluRadioYes.checked =
      (this.ehealth.travelDeclaration.flu.answer && this.ehealth.travelDeclaration.flu.answer === 'Yes') ? true : null;
    fluRadioNo = document.getElementById('fluNo');
    fluRadioNo.checked =
      (this.ehealth.travelDeclaration.flu.answer && this.ehealth.travelDeclaration.flu.answer === 'No') ? true : null;
    // ? close contact radio
    // tslint:disable-next-line: one-variable-per-declaration
    let closeContactYes; let closeContactNo;
    closeContactYes = document.getElementById('closeContactYes');
    closeContactYes.checked =
      (this.ehealth.travelDeclaration.covid19.contact && this.ehealth.travelDeclaration.covid19.contact === 'Yes') ? true : null;
    closeContactNo = document.getElementById('closeContactNo');
    closeContactNo.checked =
      (this.ehealth.travelDeclaration.covid19.contact && this.ehealth.travelDeclaration.covid19.contact === 'No') ? true : null;
    // ? cluster radio
    // tslint:disable-next-line: one-variable-per-declaration
    let clusterYes; let clusterNo;
    clusterYes = document.getElementById('clusterYes');
    clusterYes.checked =
      (this.ehealth.travelDeclaration.covid19.covidCluster && this.ehealth.travelDeclaration.covid19.covidCluster === 'Yes') ? true : null;
    clusterNo = document.getElementById('clusterNo');
    clusterNo.checked =
      (this.ehealth.travelDeclaration.covid19.covidCluster && this.ehealth.travelDeclaration.covid19.covidCluster === 'No') ? true : null;
    // ? govt order radio
    // tslint:disable-next-line: one-variable-per-declaration
    let governmentOrderYes; let governmentOrderNo;
    governmentOrderYes = document.getElementById('orderYes');
    governmentOrderYes.checked =
      // tslint:disable-next-line: max-line-length
      (this.ehealth.travelDeclaration.covid19.governmentOrder && this.ehealth.travelDeclaration.covid19.governmentOrder === 'Yes') ? true : null;
    governmentOrderNo = document.getElementById('orderNo');
    governmentOrderNo.checked =
      // tslint:disable-next-line: max-line-length
      (this.ehealth.travelDeclaration.covid19.governmentOrder && this.ehealth.travelDeclaration.covid19.governmentOrder === 'No') ? true : null;
    // ? returned from east radio
    // tslint:disable-next-line: one-variable-per-declaration
    let middleEastTravelYes; let middleEastTravelNo;
    middleEastTravelYes = document.getElementById('eastYes');
    middleEastTravelYes.checked =
      // tslint:disable-next-line: max-line-length
      (this.ehealth.travelDeclaration.middleEastTravel.answer && this.ehealth.travelDeclaration.middleEastTravel.answer === 'Yes') ? true : null;
    middleEastTravelNo = document.getElementById('eastNo');
    middleEastTravelNo.checked =
      // tslint:disable-next-line: max-line-length
      (this.ehealth.travelDeclaration.middleEastTravel.answer && this.ehealth.travelDeclaration.middleEastTravel.answer === 'No') ? true : null;
    // ? contact east radio
    // tslint:disable-next-line: one-variable-per-declaration
    let contactEastNo; let contactEastYes;
    contactEastYes = document.getElementById('contactEastYes');
    contactEastYes.checked =
      // tslint:disable-next-line: max-line-length
      (this.ehealth.travelDeclaration.middleEastContact.answer && this.ehealth.travelDeclaration.middleEastContact.answer === 'Yes') ? true : null;
    contactEastNo = document.getElementById('contactEastNo');
    contactEastNo.checked =
      // tslint:disable-next-line: max-line-length
      (this.ehealth.travelDeclaration.middleEastContact.answer && this.ehealth.travelDeclaration.middleEastContact.answer === 'No') ? true : null;
    // ? vsccination radio
    // tslint:disable-next-line: one-variable-per-declaration
    let vaccinationNo; let vaccinationYes;
    vaccinationYes = document.getElementById('vaccineYes');
    vaccinationYes.checked =
      // tslint:disable-next-line: max-line-length
      (this.ehealth.travelDeclaration.travelVaccination.answer && this.ehealth.travelDeclaration.travelVaccination.answer === 'Yes') ? true : null;
    vaccinationNo = document.getElementById('vaccineNo');
    vaccinationNo.checked =
      // tslint:disable-next-line: max-line-length
      (this.ehealth.travelDeclaration.travelVaccination.answer && this.ehealth.travelDeclaration.travelVaccination.answer === 'No') ? true : null;
    return;
  }
  public dateFormater(dateVal) {
    let date;
    if (dateVal === null) {
      date = new Date();
    } else {
      date = new Date(dateVal);
    }
    const today = this.dataService.formatDateAndMonth(date);
    const obj = {
      date: '',
      time: '',
    };
    obj.date = today.split('/')[0];
    obj.time = today.split('/')[1];
    return obj;
  }
  public showFormattedDate(type, dateVal, index) {
    const formattedDate = this.dateFormater(dateVal);
    if (type === 'abroad-travel') {
      this.showDates.abroadTravel = formattedDate.date;
    } else if (type === 'middle-east-travel') {
      this.showDates.middleEastTravel = formattedDate.date;
    } else if (type === 'vaccination') {
      this.showDates.vaccination[index].date = formattedDate.date;
    }
  }
  public exportPdf() {
    // ? show all selected dates in format
    this.mode = 'preview';
    // ? generate pdf
    const pageName = 'Travel_Declaration';
    this.reloadAgain = false;
    if (!this.internetCheckFlag) {
      // eslint-disable-next-line @typescript-eslint/prefer-for-of
      for (let i = 0; i < this.ehealth.travelDeclaration.travelVaccination.vaccines.length; i++) {
        if (this.ehealth.travelDeclaration.travelVaccination.vaccines[i].date !== '') {
          const date = new Date();
          const today = this.dataService.formatDateAndMonth(this.ehealth.travelDeclaration.travelVaccination.vaccines[i].date);
          this.ehealth.travelDeclaration.travelVaccination.vaccines[i].date = today.split('/')[0];
        }
      }
      this.dataService.exportPdf('travel-declrn-pdf-wrap', this.ehealth.profile.name, environment.aws.bucketAdmissionDocumentsPath, pageName, this.clientId, this.ehealth.caseId, this.pdfFileName, this.pdfFileDate).then((resp) => {
        this.resetAllRadioInputs();
        const response: any = resp;
        if (response.status === 'success') {
          let date;
          // eslint-disable-next-line prefer-const
          date = new Date();
          this.pdfFileName = response.awsFileName;
          this.pdfFileDate = date.toString();
          this.ehealth.travelDeclaration.pdfFiles.push({
            fileKey: response.awsFileName,
            awsFileName: response.awsFileName,
            date: date.toString(),
            signature: this.pdf.signature,
            name: this.consentDetails.name || '',
            relation: this.consentDetails.relation || '',
            guardian: this.ehealth.profile.guardian
          });
          this.saveChanges();
        }
      }).catch((err) => {
        this.dataService.presentAlert('Couldn\'t create pdf. Try again!');
      });
    } else {
      this.dataService.presentAlert('Please check your internet connection!');
    }
  }
  public async checkGuardian() {
    if (this.ehealth.profile.guardian) {
      const modalPage = await this.modalController.create({
        component: ClientRegistrationTermsModalPage,
        backdropDismiss: false,
        cssClass: 'termsNconditions-modal',
        componentProps: {
          user: this.ehealth.profile,
          mode: 'engagement',
        },
      });
      modalPage.present();
      modalPage.onDidDismiss().then((data) => {
        if (data.data.data) {
          this.consentDetails = data.data.data;
          this.openSignatureModal();
        }
      });
    } else {
      this.consentDetails.name = this.ehealth.profile.name;
      this.consentDetails.relation = this.ehealth.profile.consentDetails.relation;
      // if (this.ehealth.profile.nric.length !== 0) {
      //   this.consentDetails.nric = this.ehealth.profile.nric;
      // } else {
      //   this.consentDetails.nric = this.ehealth.profile.foreignId;
      // }
      this.openSignatureModal();
    }
  }
  public openSignatureModal() {
    this.dataService.signatureModal(this.pdf.signature).then((resp) => {
      const response: any = resp;
      if (response.status === 'success') {
        this.pdf.signature = response.signature;
        const datetimeObj = this.dateFormater(null);
        this.pdf.date = datetimeObj.date;
        this.pdf.time = datetimeObj.time;
      } else {
        this.pdf.signature = '';
      }
    });
  }
  public ionViewWillLeave() {
    this.pdf = {
      signature: '',
      date: '',
      time: '',
    };
  }
}
