import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AppDataService } from 'src/app/services/app-data.service';
import { FirebaseService } from 'src/app/services/firebase.service';
@Component({
  selector: 'app-case',
  templateUrl: './case.page.html',
  styleUrls: ['./case.page.scss'],
})
export class CasePage implements OnInit {
  public case: any = {};
  public pageMode = 'case-info';
  public ehealth: any = {};
  public loggedInuser;
  public referrers = [];
  public referrerMode = 'dropdown';
  public referralSources = [];
  // public referralSources = ['T1G', 'Existing PH', 'Others'];
  public showReferrerDropdown = false;
  public showCaseTypeDropdown = false;
  public caseTypes = [];
  // public caseTypes = ['Normal', 'A & E', 'Pre Plan A&E'];
  public showSourceTypeDropdown = false;
  public internetCheckFlag = false;
  public reloadAgain = true;
  lockReferer = false;
  caseSnapshotSubscriber: any;
  activeRouteSubscriber: any;
  admSnapshotSub: any;
  nameToSearch = '';
  constructor(private activeRoute: ActivatedRoute,
    private firebase: FirebaseService,
    public dataService: AppDataService,
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
  public async ionViewDidEnter() {
    // ! ionViewDidEnter is not called when navigated from case-update-status
    // ? it is called when params is subscribed, hence subscribed params here
    this.activeRouteSubscriber = this.activeRoute.params.subscribe(async (params) => {
      this.pageMode = 'case-info';
      this.loggedInuser = this.dataService.getUserData();
      const caseData = this.dataService.getSelectedCase();
      this.firebase.getCaseType().subscribe((resp: any) => {
        this.caseTypes = [];
        if (resp.size > 0) {
          resp.docs.forEach(doc => {
            this.caseTypes.push({ type: doc.data().type, show: true });
          });
        } else {
          this.caseTypes = [
            {
              type: 'Normal',
              show: true
            },
            {
              type: 'A & E',
              show: true
            },
            {
              type: 'Pre Plan A&E',
              show: true
            },
          ];
        }
      });
      this.referralSources = [
        {
          source: 'T1G',
          show: true
        },
        {
          source: 'Existing PH',
          show: true
        },
        {
          source: 'Others',
          show: true
        }
      ];
      this.firebase.getReferralSource().subscribe(resp => {
        let data = [];
        if (resp.size !== 0) {
          resp.docs.forEach(element => {
            const temp: any = element.data();
            temp.id = element.id;
            // data.push(temp.code);
            data.push({ code: temp.code, name: temp.name, show: true });
          });
          // data.push('Others');
          this.referrers = data;
        }
      });
      this.caseSnapshotSubscriber = this.firebase.getOneCase(caseData.id).subscribe((resp) => {
        if (caseData.id === resp.id) {
          this.case = resp;
        } else {
          this.case = caseData;
        }
        this.dataService.setSelectedCase(this.case);
      });
      this.ehealth = this.dataService.getEhealthData();
      console.log('this.ehealth: ', this.ehealth);
      // ! client change - changed on 13 july
      // ? get admission details for this case to check whether Finance Manager has locked or not
      // ? if Finance Manager has locked, disable the referer and referal source inputs here
      this.admSnapshotSub = this.firebase.getAdmission(caseData.id).subscribe((resp: any) => {
        const admData = resp[0];
        this.lockReferer = (admData && admData.revenue.lockRevenue) ? true : false;
      });
      await this.dataService.getLatestCase(caseData.clientId);
    });
  }
  public openCaseTypeDropdown(event) {
    event.stopPropagation();
    this.nameToSearch = '';
    this.caseTypes = this.dataService.searchFromDropdownList(this.caseTypes, this.nameToSearch, 'type');
    this.showCaseTypeDropdown = !this.showCaseTypeDropdown;
  }
  public selectCaseType(casetype) {
    this.case.type = casetype;
    this.hideCaseTypeDropdown();
  }
  public hideCaseTypeDropdown() {
    this.showCaseTypeDropdown = false;
  }
  public openSourceTypeDropdown(event) {
    event.stopPropagation();
    this.nameToSearch = '';
    this.referralSources = this.dataService.searchFromDropdownList(this.referralSources, this.nameToSearch, 'source');
    this.showSourceTypeDropdown = !this.showSourceTypeDropdown;
  }
  public openReferrerDropdown(event) {
    event.stopPropagation();
    this.nameToSearch = '';
    this.referrers = this.dataService.searchFromDropdownList(this.referrers, this.nameToSearch, 'name');
    this.showReferrerDropdown = !this.showReferrerDropdown;
  }
  public selectReferrer(referrer) {
    this.case.referrer = referrer.code + ' - ' + referrer.name;
    // this.case.referrer = referrer;
    this.showReferrerDropdown = false;
  }
  public selectSourceType(source) {
    this.case.referralSource = source;
    this.case.referrer = '';
    if (source === 'T1G') {
      this.referrerMode = 'dropdown';
    } else {
      this.referrerMode = 'input';
    }
    this.showSourceTypeDropdown = !this.showSourceTypeDropdown;
  }
  public saveChanges() {
    this.dataService.present().then((a) => {
      a.present();
      this.reloadAgain = false;
      document.getElementById('case-description-area').scrollTop = 0;
      this.ehealth.preview.signatureFlag = true;
      this.ehealth.preview.case = this.case;
      this.pageMode = 'case-info';
      // ? edit case details in case collection also
      if (!this.internetCheckFlag) {
        this.firebase.editCase(this.case).then(() => {
          this.ehealth.checkboxValue.caseTab = true;
          this.firebase.editEhealth(this.ehealth).then(() => {
            const obj = {
              tabName: 'case',
              value: true,
            };
            this.reloadAgain = true;
            this.dataService.setCheckboxValue(obj);
            this.dataService.setEhealthData(this.ehealth);
            this.dataService.dismiss();
            this.dataService.presentAlert('Case updated successfully!');
          }).catch(() => {
            // tslint:disable-next-line: no-unused-expression
            this.dataService.dismiss();
          });
        }).catch(() => {
          // tslint:disable-next-line: no-unused-expression
          this.dataService.dismiss();
        });
      } else {
        this.dataService.dismiss();
        this.dataService.presentAlert('Please check your internet connection!');
      }
    });
  }
  public editMode() {
    this.pageMode = 'edit';
  }
  public closeDropdown() {
    this.showCaseTypeDropdown = false;
    this.showSourceTypeDropdown = false;
    this.showReferrerDropdown = false;
  }
  public ionViewWillLeave() {
    this.case = {};
    this.dataService.scrollDiv('case-description-area');
    this.closeDropdown();
    if (this.caseSnapshotSubscriber) {
      this.caseSnapshotSubscriber.unsubscribe();
    }
    if (this.activeRouteSubscriber) {
      this.activeRouteSubscriber.unsubscribe();
    }
    if (this.admSnapshotSub) {
      this.admSnapshotSub.unsubscribe();
    }
  }
}
