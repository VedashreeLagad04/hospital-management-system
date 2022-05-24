import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { AppDataService } from 'src/app/services/app-data.service';
import { FirebaseService } from 'src/app/services/firebase.service';
@Component({
  selector: 'app-client-case-details',
  templateUrl: './client-case-details.page.html',
  styleUrls: ['./client-case-details.page.scss'],
})
export class ClientCaseDetailsPage implements OnInit {
  public clientId = '';
  public case: any = {};
  public clientDetails: any = {};
  public activeTab = 'case';
  public activatedRouteSubscription;
  public routerSubscription;
  public loggedInUser;
  constructor(private dataService: AppDataService,
              private firebase: FirebaseService,
              private activeRoute: ActivatedRoute,
              private router: Router, private changedetect: ChangeDetectorRef) {
    router.events.subscribe((val: NavigationEnd) => {
      if (val instanceof NavigationEnd) {
        if (this.router.url.indexOf('case') > -1) {
          this.activeTab = 'case';
        }
        if (this.router.url.indexOf('claims') > -1) {
          this.activeTab = 'claims';
        }
        if (this.router.url.indexOf('revenue') > -1) {
          this.activeTab = 'revenue';
        }
        if (this.router.url.indexOf('policy') > -1) {
          this.activeTab = 'policy';
        }
        if (this.router.url.indexOf('export-info') > -1) {
          this.activeTab = 'export-info';
        }
        changedetect.detectChanges();
      }
    });
  }
  public ngOnInit() { }
  public ionViewDidEnter() {
      // ? publish the header title you want to display in header
      const obj = {
        title: 'Case Details',
        backPage: '/client-case-home',
      };
      this.loggedInUser = this.dataService.getUserData();
      this.clientDetails = this.dataService.getPatientData();
      this.case = this.dataService.getSelectedCase();
  }
  public goBack() {
    this.dataService.routeChange('client-case-home');
  }
  public routeTo(path) {
    this.activeTab = path;
    this.dataService.routeChange('client-case-details/' + path);
  }
  public ionViewDidLeave() {
  }
}
