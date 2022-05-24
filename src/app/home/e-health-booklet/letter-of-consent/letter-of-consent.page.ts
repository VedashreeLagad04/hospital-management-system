import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { ModalController } from "@ionic/angular";
import * as _ from "lodash";
import { AppDataService } from "src/app/services/app-data.service";
import { FirebaseService } from "src/app/services/firebase.service";
import { environment } from "src/environments/environment";
// import { ClientRegistrationTermsModalPage } from '../client-registration-terms-modal/client-registration-terms-modal.page';
@Component({
  selector: "app-letter-of-consent",
  templateUrl: "./letter-of-consent.page.html",
  styleUrls: ["./letter-of-consent.page.scss"],
})
export class LetterOfConsentPage implements OnInit {
  nameToSearch = '';
  public user: any = [];
  public clientDetails: any = {};
  public letterOfConsent: any = {
    authoriser: "patient",
    relation: "parent",
    request: {
      discharge: true,
      labrResult: true,
      certificate: true,
      others: true,
    },
    purpose: {
      care: true,
      insurance: true,
      legal: true,
      others: true,
    },
    authoriserName: "",
    authoriserNric: "",
    signature: "",
    pdfFiles: [],
  };
  public authorizedClinic = [
    {
      clinic: "",
      showDropdown: false,
      selectedRowIndex: -1,
    },
  ];
  public allClinic = [];
  public consentAccepted = true;
  public consent: any = [];
  public loggedinUser: any;
  public consentType: string;
  public case: any = {};
  public ehealth: {
    [x: string]: any;
    id?: any;
    letterOfConsent?: any;
    profile?: any;
    checkboxValue?: any;
    caseId?: any;
  };
  public showAuthorizedClinicDropdown = false;
  public showAdministratorDropdown = false;
  public pdfFileName: any;
  public pdfFileDate: any;
  public latestLetterOfConsentPdf: any = {
    name: "",
    nric: "",
    relation: "parent",
    fileUploadKey: "",
    fileUploadDate: "",
  };
  public newLetterOfConsentPdf: any = {
    name: "",
    nric: "",
    relation: "parent",
    fileUploadKey: "",
    fileUploadDate: "",
  };
  public allAdministrators = ["Estate", "Donee", "Deputy"];
  internetCheckFlag = false;
  reloadAgain = true;
  clientType = 'new';
  constructor(
    public dataService: AppDataService,
    private firebase: FirebaseService,
    private router: Router
  ) { }
  public ngOnInit() {
    this.dataService.mySubscription = this.dataService
      .createOnline$()
      .subscribe(async (isOnline) => {
        if (isOnline === false) {
          this.internetCheckFlag = true;
          this.dataService.toastPresent("Internet disconnected");
          if (!this.reloadAgain) {
            this.dataService.dismiss();
            this.dataService.presentAlert(
              "Please check your internet connection!"
            );
          }
        } else if (isOnline === true && this.internetCheckFlag) {
          this.router.routeReuseStrategy.shouldReuseRoute = () => {
            return false;
          };
          if (this.reloadAgain) {
            this.ionViewDidEnter();
          }
          this.dataService.toastPresent("Internet Connected");
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
    this.consentAccepted = true;
    this.dataService.present().then((loader) => {
      loader.present();
      if (this.latestLetterOfConsentPdf.fileUploadKey === '') {
        this.latestLetterOfConsentPdf = {
          name: "",
          nric: "",
          relation: "",
          fileUploadKey: "",
          fileUploadDate: "",
        };
        this.newLetterOfConsentPdf = {
          name: "",
          nric: "",
          relation: "",
          fileUploadKey: "",
          fileUploadDate: "",
        };
      }
      this.loggedinUser = this.dataService.getUserData();
      this.case = this.dataService.getSelectedCase();
      this.ehealth = this.dataService.getEhealthData();
      this.clientType = this.dataService.getAddOfflineClient();
      this.firebase.getDoctorsClinic().subscribe(res => {
        this.allClinic = [];
        if (res.size != 0) {
          res.docs.forEach(element => {
            const data: any = element.data();
            console.log('data: ', data);
            // eslint-disable-next-line max-len
            const isAlreadyAdded = _.findIndex(this.allClinic, (clinic) => clinic.code === data.clinicCode && clinic.doctorCode === data.doctorCode) > -1 ? true : false;
            if (!isAlreadyAdded) {
              const temp = { name: data.clinicName, isSelected: false, show: false, code: data.clinicCode, doctorCode:data.doctorCode };
              this.allClinic.push(temp);
            }
          });
          // console.log('this.allClinic: ', this.allClinic);
        }
        this.firebase.getFacility().subscribe(res => {
          if (res.size != 0) {
            res.docs.forEach(element => {
              const data: any = element.data();
              const temp = { name: data.name, isSelected: false, code: data.code }
              this.allClinic.push(temp);
            });
          }
          // console.log('this.allClinic: ', this.allClinic);
          if (_.size(this.ehealth.letterOfConsent) === 0) {
            this.letterOfConsent = {
              name: this.ehealth.profile.name,
              nric:
                this.ehealth.profile.nric ||
                this.ehealth.profile.foreignId ||
                this.ehealth.profile.passportNumber,
              authoriser: "patient",
              relation: "parent",
              request: {
                discharge: true,
                labrResult: true,
                certificate: true,
                others: true,
              },
              purpose: {
                care: true,
                insurance: true,
                legal: true,
                others: true,
              },
              authoriserName: "",
              authoriserNric: "",
              signature: "",
              pdfFiles: [],
            };
          } else {
            if (this.ehealth.letterOfConsent.authorizedClinic.length > 0) {
              // tslint:disable-next-line: prefer-for-of
              for (
                let i = 0;
                i < this.ehealth.letterOfConsent.authorizedClinic.length;
                i++
              ) {
                const element = this.ehealth.letterOfConsent.authorizedClinic[i];
                element.showDropdown = false;
                element.selectedRowIndex = _.findIndex(this.allClinic, (o: any) => {
                  // tslint:disable-next-line: no-unused-expression
                  if (o.name === element.clinic) {
                    return o.isSelected = true;
                  }
                });
              }
              this.authorizedClinic = this.ehealth.letterOfConsent.authorizedClinic;
            }
            if (this.ehealth.letterOfConsent.pdfFiles.length > 0) {
              this.letterOfConsent = this.ehealth.letterOfConsent;
              const lastIndex = this.ehealth.letterOfConsent.pdfFiles.length - 1;
              this.latestLetterOfConsentPdf = _.cloneDeep(this.ehealth.letterOfConsent.pdfFiles[
                lastIndex
              ]);
              this.pdfFileName = _.cloneDeep(this.ehealth.letterOfConsent.pdfFiles[
                lastIndex
              ].fileUploadKey);
              this.pdfFileDate = _.cloneDeep(this.ehealth.letterOfConsent.pdfFiles[
                lastIndex
              ].fileUploadDate);
            }
          }
          this.dataService.dismiss();
        });
      });
    });
    // });
  }
  public submit() {
    this.dataService.present().then((loader) => {
      loader.present();
      this.reloadAgain = false;
      // this.letterOfConsent.authorizedClinic = this.authorizedClinic;
      // tslint:disable-next-line: prefer-for-of
      for (let i = 0; i < this.letterOfConsent.authorizedClinic.length; i++) {
        const element = this.letterOfConsent.authorizedClinic[i];
        delete element.showDropdown;
        delete element.selectedRowIndex;
      }
      this.ehealth.letterOfConsent = _.cloneDeep(this.letterOfConsent);
      this.ehealth.checkboxValue.letterOfConsentTab = true;
      if (!this.internetCheckFlag) {
        this.firebase.editEhealth(this.ehealth).then(() => {
          const obj = {
            tabName: "letter-of-consent",
            value: true,
          };
          this.reloadAgain = true;
          this.dataService.setCheckboxValue(obj);
          this.newLetterOfConsentPdf = {};
          this.dataService.setEhealthData(this.ehealth);
          this.hideLoaderAndShowAlert("Letter of Consent added successfully!");
        });
      } else {
        this.dataService.dismiss();
        this.dataService.presentAlert("Please check your internet connection!");
      }
    });
  }
  public hideLoaderAndShowAlert(alertMsg: string) {
    this.dataService.dismiss();
    this.dataService.presentAlert(alertMsg);
  }
  public addClinic() {
    if (this.authorizedClinic.length < this.allClinic.length) {
      this.authorizedClinic.push({
        clinic: "",
        showDropdown: false,
        selectedRowIndex: -1,
      });
    }
  }
  public removeClinic(
    index: number,
    obj: { clinic: string; selectedRowIndex: number }
  ) {
    const findNameIndex = _.findIndex(
      this.allClinic,
      (o) => o.name === obj.clinic
    );
    if (findNameIndex !== -1) {
      this.allClinic[findNameIndex].isSelected = false;
      obj.selectedRowIndex = -1;
    }
    this.authorizedClinic.splice(index, 1);
  }
  public signForm() {
    if (
      this.latestLetterOfConsentPdf &&
      this.latestLetterOfConsentPdf.signature &&
      this.latestLetterOfConsentPdf.signature !== ""
    ) {
      this.dataService
        .presentReSignFormAlert("Letter of Consent")
        .then((resp) => {
          if (resp === "edit") {
            this.consentAccepted = false;
            this.newLetterOfConsentPdf.signature = "";
            this.latestLetterOfConsentPdf.signature = "";
          } else {
            this.consentAccepted = true;
          }
        });
    } else {
      this.consentAccepted = false;
    }
  }
  public openCloseDropdown(type: string, clinic, event) {
    event.stopPropagation();
    this.closeDropdowns();
    if (type === "Authorized Clinic") {
      this.nameToSearch = '';
      this.allClinic = this.dataService.searchFromDropdownList(this.allClinic, this.nameToSearch, 'name');
      clinic.showDropdown = !clinic.showDropdown;
    } else if (type === "Administrator") {
      this.showAdministratorDropdown = !this.showAdministratorDropdown;
    }
  }
  // tslint:disable-next-line: max-line-length
  public selectClinic(
    obj: any,
    clinicObj: any,
    clinicIndex: any
  ) {
    clinicObj.isSelected = true;
    obj.selectedRowIndex = clinicIndex;
    if (obj.clinic !== "" && obj.clinic !== "-") {
      const findNameIndex = _.findIndex(
        this.allClinic,
        (o) => o.name === obj.clinic
      );
      if (findNameIndex !== -1) {
        this.allClinic[findNameIndex].isSelected = false;
      }
    }
    obj.clinic = clinicObj.name;
    obj.showDropdown = false;
  }
  public exportPdf() {
    this.consentAccepted = true;
    this.letterOfConsent.authorizedClinic = this.authorizedClinic;
    const pageName = "Letter_Of_Consent";
    // tslint:disable-next-line: max-line-length
    this.dataService
      .exportPdf(
        "loc-pdf-wrap",
        this.ehealth.profile.name,
        environment.aws.bucketAdmissionDocumentsPath,
        pageName,
        this.ehealth.profile.id,
        this.ehealth.caseId,
        this.pdfFileName,
        this.pdfFileDate
      )
      .then((resp) => {
        const response: any = resp;
        if (response.status === "success") {
          // tslint:disable-next-line: no-shadowed-variable
          let date;
          date = new Date().toString();
          this.newLetterOfConsentPdf.fileUploadKey = response.awsFileName;
          this.pdfFileName = response.awsFileName;
          this.pdfFileDate = date;
          this.newLetterOfConsentPdf.fileUploadDate = date;
          this.letterOfConsent.pdfFiles.push(this.newLetterOfConsentPdf);
          this.submit();
        }
      })
      .catch((err) => {
        this.dataService.presentAlert("Couldn't create pdf. Try again!");
      });
  }
  public openSignatureModal() {
    if (!this.consentAccepted) {
      let prevSignature;
      if (
        this.latestLetterOfConsentPdf &&
        this.latestLetterOfConsentPdf.signature
      ) {
        prevSignature = _.cloneDeep(this.latestLetterOfConsentPdf.signature);
      }
      this.dataService.signatureModal(prevSignature).then((resp) => {
        const response: any = resp;
        if (response.status === "success") {
          this.newLetterOfConsentPdf.signature = response.signature;
          if (this.letterOfConsent.authoriser !== "patient") {
            this.newLetterOfConsentPdf.name = this.letterOfConsent.authoriserName;
            this.newLetterOfConsentPdf.nric = this.letterOfConsent.authoriserNric;
            this.newLetterOfConsentPdf.relation = this.letterOfConsent.relation;
          } else {
            this.newLetterOfConsentPdf.name = this.letterOfConsent.name;
            this.newLetterOfConsentPdf.nric = this.letterOfConsent.nric;
            if (this.ehealth.profile.nationality === "foreigner") {
              this.newLetterOfConsentPdf.nric = this.ehealth.profile.foreignId;
            }
          }
          const tempLetterOfConsent = _.cloneDeep(this.newLetterOfConsentPdf);
          tempLetterOfConsent.fileUploadKey = this.latestLetterOfConsentPdf.fileUploadKey;
          this.latestLetterOfConsentPdf = _.cloneDeep(tempLetterOfConsent);
        } else {
          this.newLetterOfConsentPdf.signature = "";
        }
      });
    }
  }
  public selectAdmin(admin) {
    this.letterOfConsent.administratorOf = admin;
    this.showAdministratorDropdown = false;
  }
  public ionViewWillLeave() {
    this.pdfFileName = undefined;
    this.pdfFileDate = undefined;
    this.latestLetterOfConsentPdf = {
      name: "",
      nric: "",
      relation: "",
      fileUploadKey: "",
      fileUploadDate: "",
    };
  }
  public closeDropdowns() {
    // tslint:disable-next-line: prefer-for-of
    for (let i = 0; i < this.authorizedClinic.length; i++) {
      this.authorizedClinic[i].showDropdown = false;
    }
    this.showAdministratorDropdown = false;
  }
}
