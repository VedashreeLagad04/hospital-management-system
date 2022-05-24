import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AppDataService } from 'src/app/services/app-data.service';
import { FirebaseService } from 'src/app/services/firebase.service';
@Component({
  selector: 'app-client-information',
  templateUrl: './client-information.page.html',
  styleUrls: ['./client-information.page.scss'],
})
export class ClientInformationPage implements OnInit {
  public clientId;
  public client: any = {};
  public agentName = '';
  public internetCheckFlag: boolean;
  constructor(private activeRoute: ActivatedRoute, private dataService: AppDataService,
    private firebase: FirebaseService,
    private router: Router) { }
  public ngOnInit() {
    this.dataService.mySubscription = this.dataService.createOnline$().subscribe(async (isOnline) => {
      if (isOnline === false) {
        this.internetCheckFlag = true;
        this.dataService.toastPresent('Internet disconnected');
      } else if (isOnline === true && this.internetCheckFlag) {
        this.router.routeReuseStrategy.shouldReuseRoute = function () {
          return false;
        };
        // add your code you want to perform on re-loading page here
        this.ionViewWillEnter();
        this.dataService.toastPresent('Internet Connected');
        this.internetCheckFlag = false;
      }
    });
  }
  public ionViewWillEnter() {
    this.activeRoute.paramMap.subscribe((params) => {
      this.clientId = params.get('id');
      const obj = {
        title: 'Client Profile',
        backPage: 'client-profile/' + this.clientId,
      };
      this.dataService.setHeaderTitle(obj);
      this.firebase.getUserDetails(this.clientId).subscribe((data) => {
        this.client = data.data();
        this.client.id = data.id;
        let date;
        if (this.client.lastUpdatedAt) {
          // tslint:disable-next-line: max-line-length
          date = this.client.lastUpdatedAt.split(' ')[2] + ' ' + this.client.lastUpdatedAt.split(' ')[1] + ' ' + this.client.lastUpdatedAt.split(' ')[3];
        } else {
          date = this.client.accountCreatedDate.split(' ')[2] + ' ' + this.client.accountCreatedDate.split(' ')[1] + ' ' + this.client.accountCreatedDate.split(' ')[3];
        }
        this.client.lastUpdatedAt = date;
        let agentId;
        if (this.client.lastUpdatedBy) {
          agentId = this.client.lastUpdatedBy;
        } else {
          agentId = this.client.createdByAgentId;
        }
        this.firebase.getUserDetails(agentId).subscribe((data) => {
          const agentDetails = data.data();
          this.agentName = agentDetails.name;
        });
      });
    });
  }
  // tslint:disable-next-line: use-lifecycle-interface
  public ngOnDestroy() {
    if (this.dataService.mySubscription) {
      this.dataService.mySubscription.unsubscribe();
    }
  }
}
