import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import * as _ from 'lodash';
import { AppDataService } from 'src/app/services/app-data.service';
import { FirebaseService } from 'src/app/services/firebase.service';
declare var SelectPure: any;
@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {
  public type;
  public loggedInUser;
  public clientId;
  public kgLabel = false;
  public cmLabel = false;
  public case;
  public ehealth: any;
  public user: any = {
    contactNo: '',
    homeContactNo: '',
    dateOfBirth: '',
    email: '',
    gender: '',
    name: '',
    nationality: '',
    nric: '',
    postalCode: '',
    nok: '-',
    weight: '',
    height: '',
  };
  public docId;
  public editPage = false;
  public showGenderDropdown = false;
  public showNationalityDropdown = false;
  public isExclaimOpen = false;
  public countries = [];
  public countrySelector: any;
  public optionalItems = '';
  public errorContactMsg = '';
  public errorHomeContactMsg = '';
  public errorEmailMsg = '';
  public errorNameMsg = '';
  public errorNricMsg = '';
  public errorForeignIdMsg = '';
  public errorPassportNumberMsg = '';
  public errordobMsg = '';
  public dateOfBirth = '';
  public validateFlag = {
    Birthdate: false,
  };
  public consentDetails = {
    signature: '',
    date: '',
    time: '',
    name: '',
    relation: '',
  };
  public nationality: string;
  public internetCheckFlag = false;
  public reloadAgain = true;
  constructor(private activeRoute: ActivatedRoute,
    private firebase: FirebaseService,
    private dataService: AppDataService,
    private router: Router) { }
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
        this.router.routeReuseStrategy.shouldReuseRoute = () => {
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
  // tslint:disable-next-line: use-lifecycle-interface
  public ngOnDestroy() {
    if (this.dataService.mySubscription) {
      this.dataService.mySubscription.unsubscribe();
    }
  }
  public ionViewDidEnter() {
    this.editPage = false;
    this.dataService.present().then((a) => {
      a.present();
      this.loggedInUser = this.dataService.getUserData();
      this.activeRoute.paramMap.subscribe((params) => {
        this.clientId = params.get('id');
        // this.firebase.getUserDetails(this.clientId).subscribe((data) => {
        //   this.user = data.data();
        //   this.user.id = data.id;
        // });
        this.case = this.dataService.getSelectedCase();
        // this.firebase.getEhealth(this.case.id).subscribe((resp) => {
        //   resp.docs.forEach((temp) => {
        //     this.ehealth = temp.data();
        //     this.ehealth.id = temp.id;
        this.ehealth = this.dataService.getEhealthData();
        this.user = this.ehealth.profile;
        this.user.id = this.clientId;
        this.user.homeContactNo = this.user.homeContactNo || '';
        this.user.nok = this.user.nok || '';
        this.user.height = this.user.height || '';
        this.user.weight = this.user.weight || '';
        this.user.bmi = this.user.bmi || '';
        this.user.nokRelationship = this.user.nokRelationship || '';
        this.user.nokContact = this.user.nokContact || '';
        this.user.foreignId = this.user.foreignId || '';
        this.selectNationality(this.user.nationality);
        if (!this.user.drugAllergy || (this.user.drugAllergy && this.user.drugAllergy.length === 0)) {
          this.user.drugAllergy = [
            { allergy: '' },
          ];
        }
        if (!this.user.foodAllergy || (this.user.foodAllergy && this.user.foodAllergy.length === 0)) {
          this.user.foodAllergy = [
            { allergy: '' },
          ];
        }
        if (this.user.nationality === 'foreigner') {
          this.optionalItems = this.user.country;
        }
        this.calculateBmi();
      });
      // });
      this.firebase.getCountries().subscribe((resp) => {
        this.countries = [];
        resp.docs.forEach((el) => {
          const temp: any = el.data();
          this.countries = temp.country;
        });
        // if (document.getElementsByClassName('select-pure__select').length === 0) {
        //   const list = this.createSelectPureInputFromArray(this.countries);
        //   this.countrySelector = this.countryList('.country-selection', this.optionalItems, list);
        // }
      });
      this.dataService.dismiss();
    });
    // });
  }
  public changeDateFormat() {
    const date = new Date(this.dateOfBirth);
    const dateToString = date.toString();
    const newDate = dateToString.split(' ')[2] + ' ' + dateToString.split(' ')[1] + ' ' +
      dateToString.split(' ')[3];
    this.user.dateOfBirth = newDate;
  }
  public updateProfile() {
    this.dataService.present().then((a) => {
      a.present();
      const userCheck = _.isEmpty(this.user);
      if (!userCheck && (this.errorContactMsg === '')) {
        this.reloadAgain = false;
        this.user.lastUpdatedAt = new Date().toString();
        this.user.lastUpdatedBy = this.loggedInUser.id;
        const tempDrug = [];
        const tempFood = [];
        this.user.drugAllergy.forEach((element) => {
          if (element.allergy.length !== 0) {
            tempDrug.push(element);
          }
        });
        if (tempDrug.length === 0) {
          tempDrug.push({ allergy: '' });
        }
        this.user.drugAllergy = tempDrug;
        this.user.foodAllergy.forEach((element) => {
          if (element.allergy.length !== 0) {
            tempFood.push(element);
          }
        });
        if (tempFood.length === 0) {
          tempFood.push({ allergy: '' });
        }
        this.user.foodAllergy = tempFood;
        if (this.user.nationality === 'foreigner') {
          this.user.nric = '';
        } else {
          this.user.foreignId = '';
          this.user.passportNumber = '';
        }
        if (!this.internetCheckFlag) {
          this.firebase.editUser(this.user).then((resp) => {
            this.reloadAgain = true;
            this.ehealth.profile = this.user;
            this.ehealth.preview.profile = this.user;
            this.dataService.setUserGender(this.user.gender);
            this.ehealth.preview.signatureFlag = true;
            this.ehealth.checkboxValue.profileTab = true;
            this.firebase.editEhealth(this.ehealth).then(() => {
              this.editPage = false;
              const obj = {
                tabName: 'profile',
                value: true,
              };
              this.dataService.setCheckboxValue(obj);
              this.dataService.setEhealthData(this.ehealth);
              this.dataService.dismiss();
              this.dataService.presentAlert('Profile updated successfully!');
            });
          }).catch((error) => {
            this.dataService.dismiss();
          });
        } else {
          this.dataService.dismiss();
          this.dataService.presentAlert('Please check your internet connection!');
        }
      } else {
        this.dataService.dismiss();
      }
    });
  }
  public validateDate() {
    this.validateFlag.Birthdate = false;
    let enteredDate;
    if (this.user.dateOfBirth !== undefined && this.user.dateOfBirth.length !== 0) {
      enteredDate = new Date(this.user.dateOfBirth);
      if (this.user.dateOfBirth < enteredDate) {
        this.errordobMsg = 'Invalid birthdate!!';
        this.validateFlag.Birthdate = false;
      } else {
        this.validateFlag.Birthdate = true;
        this.calculateAge(enteredDate);
        this.errordobMsg = '';
      }
    } else {
      this.validateFlag.Birthdate = false;
      this.errordobMsg = 'Please enter your date of birth';
    }
  }
  public calculateAge(date) {
    let age;
    const timeDiff = Math.abs(Date.now() - date);
    age = Math.floor((timeDiff / (1000 * 3600 * 24)) / 365);
    this.consentDetails = {
      signature: '',
      date: '',
      time: '',
      name: '',
      relation: '',
    };
    if (age > 20) {
      this.user.guardian = false;
    } else {
      this.user.guardian = true;
    }
  }
  public openDropdown($event, type) {
    $event.stopPropagation();
    if (type === 'gender') {
      this.showGenderDropdown = !this.showGenderDropdown;
    } else if (type === 'nationality') {
      this.showNationalityDropdown = !this.showNationalityDropdown;
    }
  }
  public selectGender(gender) {
    this.showGenderDropdown = false;
    this.user.gender = gender;
  }
  public closeAllDropdown() {
    if (this.showGenderDropdown) {
      this.showGenderDropdown = false;
    }
    if (this.showNationalityDropdown) {
      this.showNationalityDropdown = false;
    }
  }
  public selectNationality(nation) {
    this.showNationalityDropdown = false;
    if (nation === 'foreigner') {
      this.nationality = 'Foreigner';
    } else {
      if (nation === 'Long-term Pass' || nation === 'Long-term pass') {
        this.nationality = 'Long-term Pass';
      } else {
        this.nationality = 'Singaporean/Singapore-PR';
      }
    }
    this.user.nationality = nation;
  }
  public editMode() {
    this.editPage = true;
    if (document.getElementsByClassName('select-pure__select').length === 0) {
      const list = this.createSelectPureInputFromArray(this.countries);
      this.countrySelector = this.countryList('.profile-country-selection', this.optionalItems, list);
    }
  }
  public openPopover() {
    this.isExclaimOpen = !this.isExclaimOpen;
  }
  public calculateBmi() {
    let weight = 0.0;
    let height = 0.0;
    if (this.user.weight) {
      this.kgLabel = true;
    } else {
      this.kgLabel = false;
    }
    if (this.user.height) {
      this.cmLabel = true;
    } else {
      this.cmLabel = false;
    }
    if (this.user.weight !== undefined && this.user.height !== undefined) {
      if (this.user.weight === '') {
        weight = 0.0;
      } else {
        weight = this.user.weight;
      }
      if (this.user.height === '') {
        height = 0.0;
      } else {
        height = this.user.height;
      }
      if (weight !== 0 && height !== 0) {
        weight = typeof (weight) === 'string' ? parseFloat(weight) : weight;
        height = typeof (height) === 'string' ? parseFloat(height) : height;
        this.user.bmi = ((weight) / (height) / (height)) * 10000;
        this.user.bmi = Number(this.user.bmi).toFixed(2);
      } else {
        this.user.bmi = 0;
      }
    }
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
  public validateEmail() {
    let pattern;
    if (this.user.email !== undefined && this.user.email.length !== 0) {
      const regexp = new RegExp('^(?:[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+.[a-zA-Z]{2,6})?$');
      pattern = regexp.test(this.user.email);
      if (pattern === false) {
        this.errorEmailMsg = 'Please enter valid email address';
      } else {
        this.firebase.isAlreadyPresent('email', this.user.email).subscribe(((res) => {
          if (res.size > 0) {
            const resp = res.docs[0].data();
            if (resp && res.docs[0].id !== this.user.id) {
              this.errorEmailMsg = 'This email address is already registered!';
            } else {
              this.errorEmailMsg = '';
            }
          }
          // if (res.size !== 0) {
          //   this.errorEmailMsg = 'This email address is already registered.';
          // } else {
          //   this.errorEmailMsg = '';
          // }
        }));
      }
    } else {
      this.errorEmailMsg = 'Please enter email address';
    }
  }
  public checkRegex(expresssion, trigger) {
    const regexp = new RegExp(expresssion);
    const test = regexp.test(trigger);
    return test;
  }
  public validateMobileNo() {
    let pattern;
    if (this.user.contactNo !== undefined && this.user.contactNo.length !== 0) {
      pattern = this.checkRegex('^[0-9]{8}$', this.user.contactNo);
      if (pattern === false) {
        this.errorContactMsg = 'Please enter valid contact number';
      } else {
        this.dataService.present().then((a) => {
          a.present();
          this.firebase.isAlreadyPresent('contactNo', this.user.contactNo).subscribe((res) => {
            if (res.size > 0) {
              const resp = res.docs[0].data();
              if (resp && res.docs[0].id !== this.user.id) {
                this.errorContactMsg = 'This contact number is already registered.';
              } else {
                this.errorContactMsg = '';
              }
              this.dataService.dismiss();
            }
            if (res.size !== 0) {
              this.errorContactMsg = 'This contact number is already registered.';
              this.dataService.dismiss();
            } else {
              this.errorContactMsg = '';
              this.dataService.dismiss();
            }
          });
        });
      }
    } else {
      this.errorContactMsg = 'Please enter Contact number';
    }
  }
  public validateHomeContactNo() {
    let pattern;
    if (this.user.homeContactNo !== undefined && this.user.homeContactNo.length !== 0) {
      pattern = this.checkRegex('^[0-9]{8}$', this.user.homeContactNo);
      if (pattern === false) {
        this.errorHomeContactMsg = 'Please enter valid contact number';
      } else {
        this.errorHomeContactMsg = '';
      }
    } else {
      this.errorHomeContactMsg = '';
    }
  }
  public addFood() {
    this.user.foodAllergy.push({
      allergy: '',
    });
  }
  public addDrug() {
    this.user.drugAllergy.push({
      allergy: '',
    });
  }
  public deleteDrug(i) {
    this.user.drugAllergy.splice(i, 1);
  }
  public deleteFood(i) {
    this.user.foodAllergy.splice(i, 1);
  }
  public checkIfPresent(type) {
    this.dataService.present().then((a) => {
      a.present();
      if (type === 'foreignId') {
        this.user.foreignId = this.user.foreignId.toUpperCase();
        if (this.user.foreignId.length >= 6) {
          this.firebase.isAlreadyPresent(type, this.user.foreignId).subscribe((resp) => {
            if (resp.docs.length > 0) {
              if (resp.docs[0].id === this.user.id) {
                this.errorForeignIdMsg = '';
              } else {
                this.errorForeignIdMsg = 'This foreign id is already registered in system!';
              }
            } else {
              this.errorForeignIdMsg = '';
            }
            this.dataService.dismiss();
          });
        } else {
          this.errorForeignIdMsg = 'Foreign ID must be of at least 6 digits!';
          this.dataService.dismiss();
        }
      } else if (type === 'passportNumber') {
        if (this.user.passportNumber && this.user.passportNumber.length < 6) {
          this.errorPassportNumberMsg = 'Passport Number must be of at least 6 digits!';
          this.dataService.dismiss();
        } else if (this.user.passportNumber && this.user.passportNumber.length >= 6) {
          this.user.passportNumber = this.user.passportNumber.toUpperCase();
          this.firebase.isAlreadyPresent(type, this.user.passportNumber).subscribe((resp) => {
            if (resp.docs.length > 0) {
              if (resp.docs[0].id === this.user.id) {
                this.errorPassportNumberMsg = '';
              } else {
                this.errorPassportNumberMsg = 'This passport no is already registered in system!';
              }
            } else {
              this.errorPassportNumberMsg = '';
            }
            this.dataService.dismiss();
          });
        } else {
          this.dataService.dismiss();
        }
      }
    });
  }
  public resetFoodAllergy() {
    this.user.foodAllergy.forEach((element) => {
      if (element.allergy.length !== 0) {
        element.allergy = '';
      }
    });
  }
  public resetDrugAllergy() {
    this.user.drugAllergy.forEach((element) => {
      if (element.allergy.length !== 0) {
        element.allergy = '';
      }
    });
  }
}
