import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { ModalController, NavParams } from '@ionic/angular';
import * as _ from 'lodash';
import { AppDataService } from 'src/app/services/app-data.service';
import { FirebaseService } from 'src/app/services/firebase.service';
@Component({
  selector: 'app-client-registration-terms-modal',
  templateUrl: './client-registration-terms-modal.page.html',
  styleUrls: ['./client-registration-terms-modal.page.scss'],
})
export class ClientRegistrationTermsModalPage implements OnInit {
  // user: any;
  public loggedInuser;
  public date = new Date();
  public clientDetails: any = {};
  public checkbox: boolean;
  public isAdmin = false;
  public selectedAgentId = '';
  // ? for signature
  public signature = '';
  public isDrawing = false;
  @Input() public mode;
  @Input() public user;
  public consentDetails: any = {
    name: '',
    relation: 'Father',
    guardianRelation: '',
    nric: ''
  };
  public showGenderDropdown = false;
  public isNricValid = false;
  public getguardianRelation = false;
  // @Input() type;
  constructor(private modalCtrl: ModalController, private dataService: AppDataService, private firebase: FirebaseService) {
    // this.user = this.data;
    // this.selectedAgentId = navParams.get('selectedAgentId');
  }
  public ngOnInit() {
    // 
    this.loggedInuser = this.dataService.getUserData();
    // this.signaturePad.set('minWidth', 5);
    if (!this.loggedInuser.nric) {
      this.loggedInuser.nric = '';
    }
  }
  public openDropdown() {
    this.showGenderDropdown = !this.showGenderDropdown;
  }
  public closeDropDown() {
    if (this.showGenderDropdown) {
      this.showGenderDropdown = false;
    }
  }
  public selectGender(relation) {
    this.showGenderDropdown = false;
    this.consentDetails.relation = relation;
    if (relation === 'Guardian') {
      this.getguardianRelation = true;
    } else {
      this.getguardianRelation = false;
    }
  }
  public dismiss() {
    this.modalCtrl.dismiss({});
  }
  public goToPreviewPage() {
    if (this.consentDetails.name.length === 0) {
      this.dataService.presentAlert('Please complete form to proceed!');
    } else {
      const splittedUserName = this.consentDetails.name.split(' ');
      let capitalizedName = _.capitalize(splittedUserName[0]);
      if (splittedUserName.length > 1) {
        for (let i = 1; i < splittedUserName.length; i++) {
          capitalizedName += ' ' + _.capitalize(splittedUserName[i]);
        }
      }
      this.consentDetails.name = capitalizedName;
      this.modalCtrl.dismiss({
        data: this.consentDetails,
      });
    }
  }
  public goToPreviewSignature() {
    if (this.consentDetails.name.length === 0 || !this.isNricValid) {
      this.dataService.presentAlert('Please complete form to proceed!');
    } else {
      const splittedUserName = this.consentDetails.name.split(' ');
      let capitalizedName = _.capitalize(splittedUserName[0]);
      if (splittedUserName.length > 1) {
        for (let i = 1; i < splittedUserName.length; i++) {
          capitalizedName += ' ' + _.capitalize(splittedUserName[i]);
        }
      }
      this.consentDetails.name = capitalizedName;
      this.modalCtrl.dismiss({
        data: this.consentDetails,
      });
    }
  }
  public validateNric() {
    if (!this.consentDetails.nric || this.consentDetails.nric.length === 0) {
      this.isNricValid = false;
      this.dataService.presentAlert('Please enter NRIC/FIN/Foreign ID!');
    } else {
      if (this.consentDetails.nric.length < 6) {
        this.dataService.presentAlert('NRIC/FIN/Foreign ID should be of at least 6 digits!');
      } else {
        // ? check if consentDetails.nric is an nric
        if (this.consentDetails.nric.length === 9) {
          const checkIfValid = this.validateNRIC(this.consentDetails.nric);
          if (!checkIfValid) {
            this.isNricValid = false;
            this.dataService.presentAlert('Please enter a valid NRIC!');
          } else {
            this.isNricValid = true;
          }
        } else {
          this.isNricValid = true;
        }
      }
    }
    return this.isNricValid;
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
}
