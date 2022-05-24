import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import * as _ from 'lodash';
import { map } from 'rxjs/operators';
import { AppDataService } from 'src/app/services/app-data.service';
import { FirebaseService } from 'src/app/services/firebase.service';
import { ClientRegistrationTermsModalPage } from './client-registration-terms-modal/client-registration-terms-modal.page';
import { LetterOfConsentPage } from './letter-of-consent/letter-of-consent.page';
declare var SelectPure: any;
@Component({
  selector: 'app-client-registration',
  templateUrl: './client-registration.page.html',
  styleUrls: ['./client-registration.page.scss'],
})
export class ClientRegistrationPage implements OnInit {
  nameToSearch = '';
  public type;
  public user: any = {
    name: '',
    gender: '',
    dateOfBirth: '',
    email: '',
    contactNo: '',
    homeContactNo: '',
    nationality: '',
    address: '',
    buildingName: '',
    nric: '',
    postalCode: '',
    unitNo: '',
    guardian: false,
    isDeleted: false,
    assignedTo: []
  };
  public consentDetails: any = {
    signature: '',
    date: '',
    time: '',
    name: '',
    relation: '',
  };
  public clientDetails: any = {};
  public errorEmailMsg = '';
  public errorNameMsg = '';
  public errorContactMsg = '';
  public errordobMsg = '';
  public errorGenderMsg = '';
  public errorNationalityMsg = '';
  public errorkinNameMsg = '';
  public errorkinContactMsg = '';
  public date = new Date();
  public loggedInuser: any;
  public flag = [];
  public agentList = [];
  public basicDetails = true;
  public addressDetails = false;
  public previewDetails = false;
  public operation: string;
  public dateOfBirth;
  public editMode: boolean;
  public errorNricMsg: string;
  public validateFlag: any = {};
  public formError = '';
  public errorPostalMsg: string;
  public checkbox1: any;
  public showCountryDropdown: boolean;
  public errorHomeContactMsg = '';
  public countrySelector: any;
  public optionalItems = '';
  public sign = false;
  public addressList: any[];
  public previewTab = false;
  public showBuildingDropdown = false;
  public isExclaimOpen = false;
  public internetCheckFlag = false;
  public foreignIdMsg = '';
  public countryMsg: string;
  public showDropdownCountry = false;
  public countries: any = [];
  public passportMsg = '';
  public reloadAgain = true;
  public activeRouteSubscriber: any;
  public age;
  public blockNo = '';
  addressExist: boolean;
  constructor(private firebase: FirebaseService, private router: Router,
    private activeRoute: ActivatedRoute, public dataService: AppDataService,
    private modalController: ModalController,
    private http: HttpClient,
    private ref: ChangeDetectorRef,
  ) { }
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
        this.router.routeReuseStrategy.shouldReuseRoute = function () {
          return false;
        };
        if (this.reloadAgain) {
          this.ionViewDidEnter();
        }
        this.dataService.toastPresent('Internet Connected');
        this.internetCheckFlag = false;
      }
    });
  }
  ngOnDestroy() {
    if (this.dataService.mySubscription) {
      this.dataService.mySubscription.unsubscribe();
    }
  }
  public ionViewDidEnter() {
    this.activeRouteSubscriber = this.activeRoute.paramMap.subscribe((params) => {
      this.operation = params.get('id');
      this.loggedInuser = this.dataService.getUserData();
      this.user = this.dataService.getRegistrationData();
      this.countries = [];
      if (_.size(this.user) !== 0) {
        this.validateName();
        this.validateNric();
        this.validateEmail();
        this.validateMobileNo();
        this.validatepostalCode();
        this.validateDate();
        if (this.user.nationality && this.user.nationality.length !== 0) {
          if (this.user.nationality === 'foreigner') {
            this.optionalItems = this.user.country;
          }
        }
        this.user.isDeleted = false;
        if (!this.user.assignedTo) {
          this.user.assignedTo = [];
        }
      } else {
        this.user = {
          name: '',
          gender: '',
          dateOfBirth: '',
          email: '',
          contactNo: '',
          homeContactNo: '',
          nationality: 'Singaporean / Singapore PR',
          address: '',
          nric: '',
          postalCode: '',
          unitNo: '',
          guardian: false,
          isDeleted: false,
          assignedTo: []
        };
      }
      if (this.operation === '-1') {
        this.basicDetails = true;
        this.addressDetails = false;
        this.previewDetails = false;
        const obj = {
          title: 'New Client Info',
          backPage: 'client-list/' + this.loggedInuser.id,
        };
        this.dataService.setHeaderTitle(obj);
      } else if (this.operation === '-2') {
        this.basicDetails = false;
        this.addressDetails = true;
        this.previewDetails = false;
        this.ref.detectChanges();
        const obj = {
          title: 'New Client Info',
          backPage: 'client-registration/-1',
        };
        this.dataService.setHeaderTitle(obj);
        this.firebase.getCountries().subscribe((resp) => {
          resp.docs.forEach((el) => {
            const temp: any = el.data();
            _.forEach(temp.country, (country) => {
              this.countries.push({country, show: true});
            });
            // const selectPure = document.getElementsByClassName('select-pure__select');
            // 
            // if (selectPure.length === 0) {
            //   const list = this.createSelectPureInputFromArray(this.countries);
            //   this.countrySelector = this.countryList('.country-selection', this.optionalItems, list);
            // }
            // 
          });
        });
      } else if (this.operation === '-3') {
        this.basicDetails = false;
        this.addressDetails = false;
        this.previewDetails = true;
        const obj = {
          title: 'Verify Client Info',
          backPage: 'client-registration/-2',
        };
        this.dataService.setHeaderTitle(obj);
        // ? check client type (new or offline) from data-service
        // ? if client type is 'new', signature is mandatory
        // ? if client type is 'offline', signature is optional; user can go to preview-client-info
        this.checkClientType();
        
      }
    });
  }
  public changeNationality() {
    if (this.user.nationality !== 'foreigner') {
      this.user.country = '';
      this.user.passportNumber = '';
      this.user.foreignId = '';
      if (this.user.postalCode !== '') {
        this.makeAddress();
      }
    } else {
      this.user.postalCode = '';
      this.user.buildingName = '';
      this.user.unitNo = '';
      this.user.nric = '';
      this.addressList = [];
    }
  }
  public changeRadio(type) {
    this.user.nationality = type;
    this.user.address = '';
  }
  public openPopover() {
    this.isExclaimOpen = !this.isExclaimOpen;
  }
  public closePopover() {
    this.isExclaimOpen = false;
  }
  public createSelectPureInputFromArray(array) {
    const tempArray = [];
    for (let i = 0; i < _.size(array); i++) {
      const newObj = {
        label: array[i],
        value: array[i],
      };
      tempArray.push(newObj);
    }
    return tempArray;
  }
  public validateGender() {
    if (!this.user.gender) {
      this.errorGenderMsg = 'Please select gender';
      this.validateFlag.Gender = false;
    } else {
      this.errorGenderMsg = '';
      this.validateFlag.Gender = true;
    }
  }
  public tabBasicCheck() {
    this.validateGender();
    if (_.size(this.validateFlag) === 0 || _.size(this.validateFlag) < 4) {
      this.validateName();
      this.validateEmail();
      this.validateMobileNo();
      this.validateDate();
    } else {
      this.dataService.presentOnlyLoader().then(a => {
        a.present();
        setTimeout(() => {
          if (this.validateFlag.Name && this.validateFlag.Email && this.validateFlag.Mobile &&
            this.validateFlag.Birthdate && this.validateFlag.Gender) {
            const splittedUserName = this.user.name.split(' ');
            let capitalizedName = _.capitalize(splittedUserName[0]);
            if (splittedUserName.length > 1) {
              for (let i = 1; i < splittedUserName.length; i++) {
                capitalizedName += ' ' + _.capitalize(splittedUserName[i]);
              }
            }
            this.user.name = capitalizedName;
            const nric = this.dataService.getNric();
            if (nric && nric.length !== 0) {
              this.user.nric = nric;
            }
            this.dataService.setRegistrationData(this.user);
            a.dismiss();
            this.reloadAgain = true;
            this.dataService.routeChange('client-registration/-2');
          } else if (!this.validateFlag.Name || !this.validateFlag.Email || !this.validateFlag.Mobile ||
            !this.validateFlag.Birthdate || !this.validateFlag.Gender) {
            a.dismiss();
            this.dataService.presentAlertMessage('Incorrect Data', 'Please check all the fields!');
          }
          else {
            a.dismiss();
            this.dataService.presentAlertMessage('Incomplete', 'Please fill all the fields!');
          }
        }, 1500);
      });
    }
  }
  public addressNricCheck() {
    if (this.validateFlag.Nric && this.validateFlag.postalCode) {
      this.dataService.setRegistrationData(this.user);
      this.reloadAgain = true;
      this.dataService.routeChange('client-registration/-3');
    } else {
      if (this.user.nric.length === 0 || this.user.postalCode.length === 0) {
        this.dataService.presentAlertMessage('Incomplete', 'Please fill your form to proceed');
      } else {
        this.dataService.presentAlertMessage('Incorrect', 'Please check your form!');
      }
    }
  }
  public addressForeignerCheck() {
    this.validateForeigner();
    if (this.countryMsg.length === 0 && this.foreignIdMsg.length === 0 && this.passportMsg.length === 0) {
      this.changeNationality();
      this.dataService.setRegistrationData(this.user);
      this.reloadAgain = true;
      this.dataService.routeChange('client-registration/-3');
    } else {
      if (!this.user.country || !this.user.foreignId) {
        this.dataService.presentAlert('Please fill your form to proceed');
      } else {
        this.dataService.presentAlert('Please enter valid details to proceed');
      }
    }
  }
  public openNext(tab) {
    this.reloadAgain = true;
    if (tab === 'basic') {
      this.tabBasicCheck();
    } else if (tab === 'address') {
      if (this.validateFlag.Nric === undefined || this.validateFlag.postalCode === undefined) {
        this.validateNric();
        this.validatepostalCode();
      } else {
        this.user.nationality = this.user.nationality;
        if (this.user.nationality.length === 0) {
          this.errorNationalityMsg = 'Please select your nationality';
        }
        if (this.user.nationality !== 'foreigner') {
          this.addressNricCheck();
        } else {
          this.addressForeignerCheck();
        }
      }
    }
  }
  public countryList(className: any, initialValue: any, options: any) {
    return new SelectPure(className, {
      options,
      multiple: false,
      autocomplete: false,
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
        if (this.user.nationality === 'foreigner') {
          this.user.country = value;
        }
      },
    });
  }
  public changeDateFormat() {
    const date = new Date(this.dateOfBirth);
    this.calculateAge(date);
    const dateToString = date.toString();
    const newDate = dateToString.split(' ')[2] + ' ' + dateToString.split(' ')[1] + ' ' +
      dateToString.split(' ')[3];
    this.user.dateOfBirth = newDate;
  }
  public checkRegex(expresssion, trigger) {
    const regexp = new RegExp(expresssion);
    const test = regexp.test(trigger);
    return test;
  }
  public validateName() {
    this.validateFlag.Name = false;
    let pattern;
    if (this.user.name !== undefined && this.user.name.length !== 0) {
      pattern = this.checkRegex('^[a-zA-Z\\s]*$', this.user.name);
      if (pattern === 0) {
        this.validateFlag.Name = false;
        this.errorNameMsg = 'Please enter valid name';
      } else {
        this.errorNameMsg = '';
        this.validateFlag.Name = true;
      }
    } else {
      this.validateFlag.Name = false;
      this.errorNameMsg = 'Please enter name';
    }
  }
  public validateNRIC(str) {
    if (str.length !== 9) {
      return false;
    }
    str = str.toUpperCase();
    let i;
    const icArray = [];
    for (i = 0; i < 9; i++) {
      icArray[i] = str.charAt(i);
    }
    icArray[1] = parseInt(icArray[1], 10) * 2;
    icArray[2] = parseInt(icArray[2], 10) * 7;
    icArray[3] = parseInt(icArray[3], 10) * 6;
    icArray[4] = parseInt(icArray[4], 10) * 5;
    icArray[5] = parseInt(icArray[5], 10) * 4;
    icArray[6] = parseInt(icArray[6], 10) * 3;
    icArray[7] = parseInt(icArray[7], 10) * 2;
    let weight = 0;
    for (i = 1; i < 8; i++) {
      weight += icArray[i];
    }
    const offset = (icArray[0] === 'T' || icArray[0] === 'G') ? 4 : 0;
    const temp = (offset + weight) % 11;
    const st = ['J', 'Z', 'I', 'H', 'G', 'F', 'E', 'D', 'C', 'B', 'A'];
    const fg = ['X', 'W', 'U', 'T', 'R', 'Q', 'P', 'N', 'M', 'L', 'K'];
    let theAlpha;
    if (icArray[0] === 'S' || icArray[0] === 'T') {
      theAlpha = st[temp];
    } else if (icArray[0] === 'F' || icArray[0] === 'G') {
      theAlpha = fg[temp];
    }
    return (icArray[8] === theAlpha);
  }
  public validateNric() {
    this.validateFlag.Nric = false;
    this.validateFlag.Nric = false;
    let checkIsValid;
    // ? valid nric for demo S6729913B;
    if (this.user.nric !== undefined && this.user.nric.length !== 0) {
      checkIsValid = this.validateNRIC(this.user.nric);
      if (!checkIsValid) {
        this.errorNricMsg = 'Please enter valid NRIC/Fin';
        this.validateFlag.Nric = false;
      } else {
        this.user.nric = this.user.nric.toUpperCase();
        this.dataService.presentOnlyLoader().then((a) => {
          a.present();
          // this.dataService.enableCancelForLoader();
          this.firebase.isTypeAlreadyPresent('nric', this.user.nric).subscribe((resp) => {
            if (resp.size === 0) {
              const searchNric = this.dataService.getNric();
              if (searchNric !== this.user.nric && this.operation === '-2') {
                this.dataService.presentAlertConfirm('NRIC/FIN check',
                  'NRIC/FIN is not the same as previously entered. Please check to ensure ' + this.user.nric + ' is correct').then(resp => {
                    if (resp === 'cancel') {
                      this.user.nric = searchNric;
                    } else {
                      this.dataService.setNric(this.user.nric);
                    }
                  });
              }
              this.validateFlag.Nric = true;
              this.errorNricMsg = '';
              // this.dataService.dismiss();
              this.dataService.setCancelBtn(false);
              a.dismiss();
            } else {
              // this.dataService.dismiss();
              this.dataService.setCancelBtn(false);
              a.dismiss();
              this.validateFlag.Nric = false;
              this.errorNricMsg = 'This NRIC is already registered in system!';
            }
          });
        });
      }
    } else {
      this.validateFlag.Nric = false;
      this.errorNricMsg = 'Please enter NRIC/Fin';
    }
  }
  public checkIfPresent(type) {
    if (type === 'foreignId') {
      this.user.foreignId = this.user.foreignId.toUpperCase();
      if (this.user.foreignId.length >= 6) {
        this.dataService.presentOnlyLoader().then((a) => {
          a.present();
          // this.dataService.enableCancelForLoader();
          this.firebase.isTypeAlreadyPresent(type, this.user.foreignId).subscribe((resp) => {
            if (resp.size === 0) {
              this.foreignIdMsg = '';
            } else {
              this.foreignIdMsg = 'This foreign id is already registered in system!';
            }
            // this.dataService.dismiss();
            this.dataService.setCancelBtn(false);
            a.dismiss();
          });
        });
      } else {
        this.foreignIdMsg = 'Foreign ID must be of at least 6 digits!';
      }
    } else if (type === 'passportNumber') {
      if (this.user.passportNumber && this.user.passportNumber.length < 6) {
        this.passportMsg = 'Passport Number must be of at least 6 digits!';
      } else if (this.user.passportNumber && this.user.passportNumber.length >= 6) {
        this.user.passportNumber = this.user.passportNumber.toUpperCase();
        this.dataService.presentOnlyLoader().then((a) => {
          a.present();
          // this.dataService.enableCancelForLoader();
          this.firebase.isTypeAlreadyPresent(type, this.user.passportNumber).subscribe((resp) => {
            if (resp.size === 0) {
              this.passportMsg = '';
            } else {
              this.passportMsg = 'This passport no is already registered in system!';
            }
            // this.dataService.dismiss();
            this.dataService.setCancelBtn(false);
            a.dismiss();
          });
        });
      } else {
      }
    }
  }
  public validateForeigner() {
    // if (field === 'country') {
    if (this.user.country && this.user.country.length !== 0) {
      this.countryMsg = '';
    } else {
      this.countryMsg = 'Please Select country';
    }
    // } else if (field === 'foreignId') {
    if (this.user.foreignId && this.user.foreignId.length > 5) {
      // this.foreignIdMsg = '';
      this.checkIfPresent('foreignId');
    } else {
      if (this.user.foreignId === undefined || this.user.foreignId.length === 0) {
        this.foreignIdMsg = 'Please enter foreign id';
      } else if (this.user.foreignId.length < 5) {
        this.foreignIdMsg = 'Please enter valid foreign id';
      }
    }
    // } else if (field === 'passportNumber') {
    if (this.user.passportNumber && this.user.passportNumber.length === 0) {
      this.passportMsg = '';
    } else if (this.user.passportNumber && this.user.passportNumber.length !== 0) {
      this.checkIfPresent('passportNumber');
    }
    // }
  }
  public validateEmail() {
    let pattern;
    if (this.user.email !== undefined && this.user.email.length !== 0) {
      const regexp = new RegExp('^(?:[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+.[a-zA-Z]{2,6})?$');
      pattern = regexp.test(this.user.email);
      if (pattern === false) {
        this.validateFlag.Email = false;
        this.errorEmailMsg = 'Please enter valid email address';
      } else {
        this.firebase.isTypeAlreadyPresent('email', this.user.email).subscribe(((res) => {
          if (res.size !== 0) {
            this.errorEmailMsg = 'This email address is already registered.';
            this.validateFlag.Email = false;
          } else {
            this.validateFlag.Email = true;
            this.errorEmailMsg = '';
          }
        }));
      }
    } else {
      this.errorEmailMsg = 'Please enter email address';
      this.validateFlag.Email = false;
    }
  }
  public validateMobileNo() {
    this.validateFlag.Mobile = false;
    let pattern;
    if (this.user.contactNo !== undefined && this.user.contactNo.length > 6) {
      pattern = this.checkRegex('^[0-9]{8}$', this.user.contactNo);
      if (pattern === false) {
        this.errorContactMsg = 'Please enter valid contact number';
        this.validateFlag.Mobile = false;
      } else {
        // this.dataService.presentOnlyLoader().then((a) => {
        //   a.present();
        // this.dataService.enableCancelForLoader();
        this.firebase.isTypeAlreadyPresent('contactNo', this.user.contactNo).subscribe((res) => {
          if (res.size !== 0) {
            this.errorContactMsg = 'This contact number is already registered.';
            this.validateFlag.Mobile = false;
            // this.dataService.dismiss();
            // this.dataService.setCancelBtn(false);
            // a.dismiss();
          } else {
            this.errorContactMsg = '';
            this.validateFlag.Mobile = true;
            // this.dataService.dismiss();
            // this.dataService.setCancelBtn(false);
            // a.dismiss();
          }
        });
        // });
      }
    } else {
      this.validateFlag.Mobile = false;
      this.errorContactMsg = 'Please enter valid contact number';
    }
  }
  public validateHomeMobileNo() {
    let pattern;
    if (this.user.homeContactNo !== undefined && this.user.homeContactNo.length !== 0) {
      pattern = this.checkRegex('^[0-9]{8}$', this.user.homeContactNo);
      if (pattern === false) {
        this.errorHomeContactMsg = 'Please enter valid contact number(home)';
      } else {
        if (this.user.homeContactNo === this.user.contactNo) {
          this.errorHomeContactMsg = 'Please enter another no';
        }
        this.errorHomeContactMsg = '';
      }
    }
  }
  public validateDate() {
    this.validateFlag.Birthdate = false;
    let enteredDate;
    if (this.user.dateOfBirth !== undefined && this.user.dateOfBirth.length !== 0) {
      enteredDate = new Date(this.user.dateOfBirth);
      if (this.date < enteredDate) {
        this.errordobMsg = 'Invalid birthdate!!';
        this.validateFlag.Birthdate = false;
      } else {
        this.validateFlag.Birthdate = true;
        // this.calculateAge(enteredDate);
        this.errordobMsg = '';
      }
    } else {
      this.validateFlag.Birthdate = false;
      this.errordobMsg = 'Please select your date of birth';
    }
  }
  public calculateAge(date) {
    const timeDiff = Math.abs(Date.now() - date);
    this.age = Math.floor((timeDiff / (1000 * 3600 * 24)) / 365);
    this.consentDetails = {
      signature: '',
      date: '',
      time: '',
      name: '',
      relation: '',
    };
    if (this.age > 20) {
      this.user.guardian = false;
    } else {
      this.user.guardian = true;
    }
  }
  public validatepostalCode() {
    this.validateFlag.postalCode = false;
    let pattern;
    if (this.user.postalCode !== undefined && this.user.postalCode.length !== 0) {
      pattern = this.checkRegex('(\d{1,3}.)?.+\s(\d{6})$', this.user.postalCode);
      if (pattern === 0) {
        this.validateFlag.postalCode = false;
        this.errorPostalMsg = 'Please enter valid postal code';
      } else {
        this.validateFlag.postalCode = true;
        this.errorPostalMsg = '';
        if (this.user.postalCode.length > 5) {
          this.postalInput();
        }
      }
    } else {
      this.validateFlag.postalCode = false;
      this.errorPostalMsg = 'Please enter postal code';
    }
  }
  public validateKinContactNo() {
    this.validateFlag.kinContact = false;
    let pattern;
    if (this.user.kinContactNo !== undefined && this.user.kinContactNo.length !== 0) {
      pattern = this.checkRegex('^[0-9]{8}', this.user.kinContactNo);
      if (pattern === false) {
        this.validateFlag.kinContact = false;
        this.errorkinContactMsg = 'Please enter valid contact number';
      } else {
        this.validateFlag.kinContact = true;
        this.errorkinContactMsg = '';
      }
    } else {
      this.validateFlag.kinContact = false;
      this.errorkinContactMsg = 'Please enter kin contact number';
    }
  }
  public isformValid() {
    let validFlag;
    this.formError = '';
    if (this.user.nationality === 'foreigner') {
      this.validateFlag.postalCode = true;
      this.validateFlag.Nric = true;
    }
    if ((_.size(this.validateFlag) === 6)) {
      _.forEach(this.validateFlag, (value, key) => {
        if (value === false) {
          validFlag = false;
          this.formError = this.formError.concat('Please check value you entered for ' + key + ' ');
        }
      });
      if (this.formError === '') {
        validFlag = true;
        this.sign = true;
      }
    } else {
      this.formError = 'Please complete the form to proceed!! ';
    }
    return validFlag;
  }
  public openTermsConditions() {
    // if (this.sign) {
    const flagCheck = _.isEmpty(this.validateFlag);
    const userCheck = _.isEmpty(this.user);
    if (!flagCheck && !userCheck) {
      const isValid = this.isformValid();
      if (isValid) {
        this.user.consentDetails = this.consentDetails;
        this.dataService.setRegistrationData(this.user);
        if (this.previewTab) {
          this.router.navigate(['/preview-client-info']);
        } else {
          this.dataService.presentAlert('Please Sign to proceed!');
        }
      } else {
        this.dataService.presentAlert(this.formError);
      }
    } else {
      this.dataService.presentAlert('Please fill the form');
    }
    // } else {
    //   this.dataService.presentAlert('Please agree to terms and conditions to proceed');
    // }
  }
  checkClientType() {
    const clientType = this.dataService.getAddOfflineClient();
    if (clientType === 'offline') {
      this.previewTab = true;
    }
    return;
  }
  public async openModal() {
    const modal = await this.modalController.create({
      component: LetterOfConsentPage,
      // componentProps: {
      // },
      cssClass: 'letter-of-consent-modal',
      keyboardClose: true,
      showBackdrop: true,
    }).then((modalEl1) => {
      modalEl1.present();
      modalEl1.onDidDismiss().then((resp) => {
      });
    });
  }
  public postalInput() {
    // this.dataService.presentOnlyLoader().then((a) => {
    //   a.present();
    // this.dataService.enableCancelForLoader();
    const oneMap = 'https://developers.onemap.sg/commonapi/search?searchVal=' +
      this.user.postalCode + '&returnGeom=Y&getAddrDetails=Y';
    this.http.get(oneMap, {}).pipe(map(((res) => res)),
    ).subscribe((response: any) => {
      this.addressList = [];
      if (response.found > 0) {
        // this.user.buildingName = '';
        this.addressList = response.results;
        this.user.addressExist = true;
        this.makeAddress();
        // this.dataService.dismiss();
        // this.dataService.setCancelBtn(false);
        // a.dismiss();
      } else if (response.found === 0 && this.user.addressExist) {
        this.user.addressExist = false;
        // this.errorPostalMsg = 'Address is not available!';
        this.user.buildingName = '';
        this.user.address = '';
        this.user.unitNo = '';
        this.errorPostalMsg = '';
        // this.dataService.dismiss();
        // this.dataService.setCancelBtn(false);
        // a.dismiss();
      }
    });
    // });
  }
  public makeAddress() {
    // block/ building name then follow by unit number, for unit number, "#"should be
    this.user.address = '';
    if (!this.user.buildingName) {
      this.user.buildingName = '';
    }
    let country = '';
    if (this.user.nationality !== 'foreigner') {
      country = 'Singapore ,'
    } else if (this.user.country && this.user.country !== '') {
      country = this.user.country + ',';
    }
    // if (this.user.addressExist && this.user.unitNo && this.user.buildingName && this.user.postalCode) {
    if (this.user.addressExist && this.user.postalCode && this.user.buildingName) {
      const find = _.find(this.addressList, ['BUILDING', this.user.buildingName]);
      if (find) {
        if (this.user.unitNo) {
          // this.user.address = find.BLK_NO + ' ' + find.BUILDING + ' #' + this.user.unitNo + ' ' + country + ' ' + this.user.postalCode;
          const data = find.ADDRESS.split(' ');
          const datalength = _.size(data);
          data[datalength - 2] = ',' + '#' + this.user.unitNo + ',' + ' ' + data[datalength - 2];
          this.user.address = data.join(' ');
        } else if (!this.user.unitNo) {
          // this.user.address = find.BLK_NO + ' ' + find.BUILDING + ' ' + country + ' ' + this.user.postalCode;
          this.user.address = find.ADDRESS;
        }
      } else {
        this.user.buildingName = '';
        this.user.address = '';
        this.user.unitNo = '';
      }
    } else if (this.user.unitNo.length !== 0) {
      if (this.blockNo.length !== 0 && this.user.buildingName.length !== 0) {
        if (this.addressList && this.addressList.length > 0) {
          this.user.address = this.blockNo + ' ' + this.addressList[0].ROAD_NAME + ', ' + this.user.buildingName + ', ' + ' #'
            + this.user.unitNo + ', ' + ' ' + country + ' ' + this.user.postalCode;
        }
        else {
          this.user.address = this.blockNo + ' ' + this.user.buildingName + ', ' + ' #'
            + this.user.unitNo + ', ' + ' ' + country + ' ' + this.user.postalCode;
        }
      } else if (this.blockNo.length !== 0 && this.user.buildingName.length === 0) {
        if (this.addressList && this.addressList.length > 0) {
          this.user.address = this.blockNo + ' ' + this.addressList[0].ROAD_NAME + ',' + ' #'
            + this.user.unitNo + ', ' + ' ' + country + ' ' + this.user.postalCode;
        }
        else {
          this.user.address = this.blockNo + ' ' + ' #'
            + this.user.unitNo + ', ' + ' ' + country + ' ' + this.user.postalCode;
        }
      } else if (this.blockNo.length === 0 && this.user.buildingName.length !== 0) {
        if (this.addressList && this.addressList.length > 0) {
          this.user.address = this.addressList[0].BLK_NO + ' ' + this.addressList[0].ROAD_NAME + ' ' + this.user.buildingName + ',' + ' #'
            + this.user.unitNo + ', ' + ' ' + country + ' ' + this.user.postalCode;
        }
        else {
          this.user.address = this.user.buildingName + ',' + ' #'
            + this.user.unitNo + ', ' + ' ' + country + ' ' + this.user.postalCode;
        }
      } else {
        if (this.addressList && this.addressList.length > 0) {
          this.user.address = this.addressList[0].BLK_NO + ' ' + this.addressList[0].ROAD_NAME + ' ' + this.user.buildingName + ' #'
            + this.user.unitNo + ', ' + ' ' + country + ' ' + this.user.postalCode;
        } else {
          this.user.address = ' #' + this.user.unitNo + ', ' + ' ' + country + ' ' + this.user.postalCode;
        }
      }
    } else {
      if (this.user.buildingName === 'NIL') {
        if (this.addressList && this.addressList.length > 0) {
          this.user.address = this.addressList[0].BLK_NO + ' ' + this.addressList[0].ROAD_NAME + ' '
            + ' ' + country + ' ' + this.user.postalCode;
        }
        else {
          this.user.address = country + ' ' + this.user.postalCode;
        }
      } else {
        if (this.addressList && this.addressList.length > 0) {
          this.user.address = this.addressList[0].BLK_NO + ' ' + this.addressList[0].ROAD_NAME + ' '
            + this.user.buildingName + ' ' + country + ' ' + this.user.postalCode;
        } else {
          this.user.address = this.blockNo + ' ' + this.user.buildingName + ' ' + country + ' ' + this.user.postalCode;
        }
      }
    }
  }
  public openDropdown($event) {
    $event.stopPropagation();
    this.showBuildingDropdown = !this.showBuildingDropdown;
  }
  public selectBuilding(building) {
    if (building.BUILDING !== 'NIL') {
      this.showBuildingDropdown = false;
      this.user.buildingName = building.BUILDING;
      // this.user.address = building.ADDRESS;
      // this.user.unitNo = building.BLK_NO;
      this.makeAddress();
    }
  }
  public openCountryDropdown($event) {
    $event.stopPropagation();
    this.nameToSearch = '';
    this.countries = this.dataService.searchFromDropdownList(this.countries, this.nameToSearch, 'country');
    this.showDropdownCountry = !this.showDropdownCountry;
  }
  public selectCountry(country) {
    this.showDropdownCountry = false;
    this.user.country = country;
  }
  public closeAllDropdown() {
    if (this.showDropdownCountry) {
      this.showDropdownCountry = false;
    }
    if (this.showBuildingDropdown) {
      this.showBuildingDropdown = false;
    }
  }
  public openSignatureModal() {
    this.dataService.signatureModal(this.consentDetails.signature).then((resp) => {
      const response: any = resp;
      if (response.status === 'success') {
        const date = new Date();
        const today = this.dataService.formatDateAndMonth(date);
        this.consentDetails.signature = response.signature;
        this.consentDetails.date = today.split('/')[0];
        this.consentDetails.time = today.split('/')[1];
        this.previewTab = true;
      } else {
        this.consentDetails.signature = '';
        this.previewTab = false;
        this.checkClientType();
      }
    });
  }
  public async takeConsent() {
    if (!this.user.guardian) {
      this.consentDetails.name = this.user.name;
      this.consentDetails.relation = 'self';
      this.openSignatureModal();
    } else {
      if (this.user.name !== undefined || this.user.nric !== undefined) {
        const modalPage = await this.modalController.create({
          component: ClientRegistrationTermsModalPage,
          backdropDismiss: false,
          cssClass: 'termsNconditions-modal',
          componentProps: {
            user: this.user,
            mode: 'engagement',
          },
        });
        modalPage.onDidDismiss().then((data) => {
          if (data.data.data) {
            this.consentDetails = data.data.data;
            this.openSignatureModal();
          }
        });
        modalPage.present();
      }
    }
  }
  public ionViewDidLeave() {
    this.activeRouteSubscriber.unsubscribe();
  }
}
