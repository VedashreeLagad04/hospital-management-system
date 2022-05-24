/* eslint-disable @typescript-eslint/prefer-for-of */
/* eslint-disable max-len */
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController, MenuController } from '@ionic/angular';
import * as _ from 'lodash';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { AppDataService } from 'src/app/services/app-data.service';
import { FirebaseService } from 'src/app/services/firebase.service';
@Component({
  selector: 'app-client-list',
  templateUrl: './client-list.page.html',
  styleUrls: ['./client-list.page.scss'],
})
export class ClientListPage implements OnInit {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  public UserType = 'client';
  public agentId;
  public welcome: string;
  public games: any;
  public clientList: any[];
  public actionDiv = false;
  public user: any;
  public loggedInUser: any;
  public actionType: string;
  public sortOption: any;
  public nricToSearch = '';
  public validNric = false;
  public errorNricMsg = '';
  public client: any;
  public isAdmin = false;
  public allPendingCases = [];
  public notFound = false;
  public searchTab: any = new Subject<string>();
  public activatedRouteSubscription;
  public isDropdownOpened = false;
  public clientUsers = [];
  public nameToSearch = '';
  public internetCheckFlag = false;
  public nricFlag = true;
  public hasSearchStarted = false;
  public clientType = 'new';
  userSnapshotSubscriber: any;
  multiUserSnapshotSub: any;
  pendingCasesSnapshotSub: any;
  ehealthSnapshotSub: any;
  constructor(private firebase: FirebaseService,
    public dataService: AppDataService,
    private router: Router, private activeRoute: ActivatedRoute,
    private alertController: AlertController,
    private menucontroller: MenuController) {
    this.searchTab.pipe(
      debounceTime(2000),
      distinctUntilChanged())
      .subscribe((event: any) => {
        this.searchClient();
      });
  }
  public disableNricCheckbox() {
    if (!this.hasSearchStarted) {
      this.hasSearchStarted = true;
    }
  }
  public ionViewDidEnter() {
    // this.activeRoute.paramMap.subscribe((params) => {
    this.activatedRouteSubscription = this.activeRoute.params.subscribe((params) => {
      this.dataService.present().then((loader) => {
        loader.present();
        this.isDropdownOpened = false;
        this.nameToSearch = '';
        // this.nricToSearch = '';
        this.notFound = false;
        this.clearSearchInput();
        this.agentId = params.id;
        this.loggedInUser = this.dataService.getUserData();

        if (this.agentId !== undefined && this.loggedInUser != null) {
          const obj = {
            title: 'Client',
            backPage: 'user-home/' + this.agentId + '',
          };
          this.dataService.setHeaderTitle(obj);
        }
        this.clientType = this.dataService.getAddOfflineClient();
        this.dataService.setSelectedCase(null);
        if (this.loggedInUser.type === 'admin' || this.loggedInUser.type === 'Management') {
          this.isAdmin = true;
          this.getAllPendingCases();
          // this.setDeletedFlagInUsers(); // ! 'isDeleted key is not present in all clients; hence add 'isDeleted' to docs where it is not present
        } else if (this.loggedInUser.type === 'agent') {
          this.multiUserSnapshotSub = this.firebase.getUsersByAgent('client', this.loggedInUser.id).subscribe((data) => {
            this.clientUsers = data;
            for (let i = 0; i < this.clientUsers.length; i++) {
              this.clientUsers[i].show = true;
            }
            this.sortByName();
            this.dataService.dismiss();
          });
        } else {
          this.dataService.dismiss();
        }
      });
    });
  }
  setDeletedFlagInUsers() {
    let count = 0;
    this.firebase.getAllClients().subscribe((resp) => {
      resp.docs.forEach((doc: any) => {
        const temp = doc.data();
        temp.id = doc.id;
        if (!temp.isDeleted) {
          temp.isDeleted = false;
          this.firebase.editUser(temp).then(() => {
            count++;
            console.log('update count: ', count);
          });
        }
      });
    });
  }
  public ngOnInit() {
    this.dataService.mySubscription = this.dataService.createOnline$().subscribe(async (isOnline) => {
      if (isOnline === false) {
        this.internetCheckFlag = true;
        this.dataService.toastPresent('Internet disconnected');
      } else if (isOnline === true && this.internetCheckFlag) {
        this.router.routeReuseStrategy.shouldReuseRoute = () => false;
        // add your code you want to perform on re-loading page here
        this.ionViewDidEnter();
        this.dataService.toastPresent('Internet Connected');
        this.internetCheckFlag = false;
      }
    });
  }
  // eslint-disable-next-line @angular-eslint/use-lifecycle-interface
  public ngOnDestroy() {
    if (this.dataService.mySubscription) {
      this.dataService.mySubscription.unsubscribe();
    }
  }
  public sortByName() {
    this.clientUsers = _.orderBy(this.clientUsers, [user => user.name.toLowerCase()], ['asc']);
    // this.clientUsers.sort((a, b) => {
    //   const A = a.name.toLowerCase();
    //   const B = b.name.toLowerCase();
    //   if (A > B) {
    //     return 1;
    //   }
    //   if (A < B) {
    //     return -1;
    //   } else {
    //     return 0;
    //   }
    // });
  }
  public setCaseAndRedirect(clientData) {
    let isClicked = true;
    this.dataService.setPatientData(clientData.user);
    this.dataService.setSelectedCase(clientData.case);
    this.ehealthSnapshotSub = this.firebase.getEhealth(clientData.case.id).subscribe((resp) => {
      const ehealth = resp[0];
      this.dataService.setEhealthData(ehealth);
      if (isClicked) {
        isClicked = false;
        this.dataService.dismiss();
        // this.redirect(path);
        this.dataService.routeChange('/e-health-booklet/approval-preview/' + clientData.case.id);
      }
    });
  }
  // ? redirect page function
  public redirect(pagename: string) {
    this.router.navigate([pagename]);
  }
  public nricChangeClick() {
    if (this.nricToSearch && this.nricToSearch.length !== 0) {
      this.searchClient();
    }
  }
  public createNewUser() {
    const userData = this.dataService.getRegistrationData();
    if (_.size(userData) !== 0) {
      this.alertClearForm();
      // this.redirect('client-registration/-1');
    } else {
      if (this.nricFlag) {
        this.nricToSearch = this.nricToSearch.toUpperCase();
        this.dataService.setNric(this.nricToSearch);
      } else {
        this.dataService.clearNric();
      }
      this.redirect('/registration-policy');
    }
  }
  public async alertClearForm() {
    return new Promise(async (resolve) => {
      const alert = await this.alertController.create({
        header: 'Clear Form',
        message: 'would you like to clear form?',
        cssClass: 'alertDiv',
        buttons: [
          {
            text: 'Continue',
            role: 'cancel',
            cssClass: 'secondary',
            handler: (cancel) => {
              resolve('cancel');
              this.redirect('client-registration/-1');
            },
          }, {
            text: 'Clear',
            handler: (ok) => {
              resolve('ok');
              if (this.nricFlag) {
                this.dataService.setNric(this.nricToSearch);
              } else {
                this.dataService.clearNric();
              }
              this.dataService.clearRegistrationData();
              this.redirect('/registration-policy');
            },
          },
        ],
      });
      await alert.present();
    });
  }
  public search(searchTextValue) {
    this.client = {};
    this.searchTab.next(searchTextValue);
  }
  public searchClient() {
    if (this.nricFlag) {
      this.dataService.present().then((loader) => {
        loader.present();
        this.client = {};
        const isNricValid = this.validateNric();
        // ? if nricToSearch is valid, then get client data from firebase
        const str = this.nricToSearch.toUpperCase();
        if (isNricValid) {
          this.firebase.getClientDetailsByNric(str).subscribe((resp) => {
            console.log('resp.docs: ', resp.docs);
            if (resp.docs.length > 0) {
              this.notFound = false;
              resp.docs.forEach((temp) => {
                this.client = temp.data();
                this.client.id = temp.id;
                this.dataService.dismiss();
                this.hasSearchStarted = false;
              });
            } else {
              this.dataService.dismiss();
              // this.notFound = true;
              this.checkForeignId();
              // this.dataService.presentAlert('There is no client registered with NRIC no ' + this.nricToSearch + ' !');
            }
          });
        } else {
          this.dataService.dismiss();
          this.hasSearchStarted = false;
          // this.checkForeignId();
          //  this.dataService.presentAlert('This NRIC no is not valid... Please check!');
        }
      });
    } else {
      if (this.nricToSearch.length >= 6) {
        this.checkForeignId();
        // this.client = {};
      } else {
        this.errorNricMsg = 'Please enter at least 6 digits for Foreign ID';
        this.hasSearchStarted = false;
      }
    }
    // else {
    //   if (this.nricToSearch.length > 6) {
    //     this.checkForeignId();
    //     // this.client = {};
    //   }
    // }
  }
  public checkForeignId() {
    // tslint:disable-next-line: prefer-const
    let data: any;
    this.errorNricMsg = '';
    this.notFound = false;
    this.dataService.present().then((a) => {
      a.present();
      const str = this.nricToSearch.toUpperCase();
      this.firebase.isTypeAlreadyPresent('foreignId', str).subscribe((resp) => {
        if (resp.size !== 0) {
          resp.docs.forEach((temp) => {
            this.client = temp.data();
            this.client.id = temp.id;
            this.dataService.dismiss();
            this.hasSearchStarted = false;
          });
        } else {
          // tslint:disable-next-line: no-shadowed-variable
          this.firebase.isTypeAlreadyPresent('passportNumber', str).subscribe((res) => {
            if (res.size !== 0) {
              res.docs.forEach((temp) => {
                this.client = temp.data();
                this.client.id = temp.id;
                this.dataService.dismiss();
                this.hasSearchStarted = false;
              });
            } else {
              this.notFound = true;
              this.client = {};
              this.dataService.dismiss();
              this.hasSearchStarted = false;
            }
          });
        }
      });
    });
  }
  public validateNRIC(nric) {
    if (nric.length !== 9) {
      return false;
    }
    const str = nric.toUpperCase();
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
    this.validNric = false;
    let checkIsValid;
    // ? valid nric for demo S6729913B;
    if (this.nricToSearch !== undefined && this.nricToSearch.length !== 0) {
      checkIsValid = this.validateNRIC(this.nricToSearch);
      if (!checkIsValid) {
        this.errorNricMsg = 'Please enter valid NRIC/Fin';
        this.validNric = false;
      } else {
        this.validNric = true;
        this.errorNricMsg = '';
      }
    } else {
      this.validNric = false;
      this.errorNricMsg = 'Please enter NRIC/Fin';
    }
    return this.validNric;
  }
  public getAllPendingCases() {
    let allCases = [];
    let allUsers = [];
    this.pendingCasesSnapshotSub = this.firebase.getPendingCases().subscribe((resp) => {
      // tslint:disable-next-line: no-shadowed-variable
      allCases = resp;
      this.allPendingCases = [];
      // resp.docs.forEach((data) => {
      //   let temp;
      //   temp = data.data();
      //   temp.id = data.id;
      //   allCases.push(temp);
      // });
      this.userSnapshotSubscriber = this.firebase.getUsers('client').subscribe((users) => {
        allUsers = users;
        // this.allPendingCases = _.forEach(allCases, function (case) {
        //   _.forEach(allUsers, (user) => {
        //     return case.clientId === user.id;
        //   });
        // for (let i = 0; i < allCases.length; i++) {
        //   for (let j = 0; j < allUsers.length; j++) {
        //     if (allCases[i].clientId === allUsers[j].id) {
        //       this.allPendingCases.push({ user: allUsers[j], case: allCases[i] });
        //     }
        //   }
        // }
        // _.forEach(allCases, function (case) {
        this.allPendingCases = [];
        const that = this;
        // tslint:disable-next-line: prefer-for-of
        for (let i = 0; i < allCases.length; i++) {
          allUsers.some((el) => {
            if (el.id === allCases[i].clientId) {
              that.allPendingCases.push({ user: el, case: allCases[i] });
              return true;
            }
          });
        }
        // })
        this.dataService.dismiss();
      });
    });
  }
  public ionViewDidLeave() {
    this.activatedRouteSubscription.unsubscribe();
    this.clientType = 'new';
    if (this.userSnapshotSubscriber) {
      this.userSnapshotSubscriber.unsubscribe();
    }
    if (this.multiUserSnapshotSub) {
      this.multiUserSnapshotSub.unsubscribe();
    }
    if (this.pendingCasesSnapshotSub) {
      this.pendingCasesSnapshotSub.unsubscribe();
    }
    if (this.ehealthSnapshotSub) {
      this.ehealthSnapshotSub.unsubscribe();
    }
  }
  public openDropdown() {
    this.isDropdownOpened = !this.isDropdownOpened;
  }
  public servicesSearchTextChanged() {
    if (this.nameToSearch !== '') {
      this.nameToSearch = '';
    }
  }
  public servicesSearchTextFocusOut() {
    if (this.nameToSearch !== '') {
      this.nameToSearch = '';
    }
  }
  public searchFacility() {
    this.nameToSearch = this.nameToSearch.trim().replace(/\s\s+/g, ' ');
    this.clientUsers.forEach((facility) => {
      if (facility.name.toLowerCase().includes(this.nameToSearch.toLowerCase()) || this.nameToSearch === '') {
        facility.show = true;
      } else {
        facility.show = false;
      }
    });
  }
  public clearSearchInput() {
    this.nricToSearch = '';
    this.errorNricMsg = '';
    this.hasSearchStarted = false;
    this.nameToSearch = '';
  }
  public setClientAndRoute(client) {
    this.dataService.setPatientData(client);
    this.redirect('/client-profile/' + client.id);
  }
}
