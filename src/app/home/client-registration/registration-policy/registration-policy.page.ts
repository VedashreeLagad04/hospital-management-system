import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AppDataService } from 'src/app/services/app-data.service';
@Component({
  selector: 'app-registration-policy',
  templateUrl: './registration-policy.page.html',
  styleUrls: ['./registration-policy.page.scss'],
})
export class RegistrationPolicyPage implements OnInit {
  editPage = false;
  editMode = false;
  privacyPolicy = false;
  loggedInuser;
  focusInFlag = false;
  constructor(private dataService: AppDataService, private router: Router) { }
  ngOnInit() {
  }
  ionViewDidEnter() {
    this.loggedInuser = this.dataService.getUserData();
    const obj = {
      title: 'Privacy Policy',
      backPage: 'client-list/' + this.loggedInuser.id
    };
    this.dataService.setHeaderTitle(obj);
    const divHeight = document.getElementById('contentDiv').offsetHeight;
        if (divHeight > 730) {
      this.focusInFlag = true;
      this.privacyPolicy = true;
    }
  }
  goToAddPage() {
    if (this.privacyPolicy === true) {
      this.router.navigate(['/client-registration/-1']);
    } else {
      this.dataService.presentAlert('Please agree to Premium Care Privacy Policy');
    }
  }
  checkScroll(event) {
    if (event.target.offsetHeight + event.target.scrollTop >= event.target.scrollHeight) {
      this.focusInFlag = true;
      this.privacyPolicy = true;
    }
  }
}
