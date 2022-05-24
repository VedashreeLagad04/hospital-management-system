import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Storage } from '@ionic/storage';
import { AppDataService } from 'src/app/services/app-data.service';
import { AuthService } from 'src/app/services/auth.service';
import { FirebaseService } from 'src/app/services/firebase.service';
import { environment } from 'src/environments/environment';
@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.page.html',
  styleUrls: ['./sign-in.page.scss'],
})
export class SignInPage implements OnInit {
  public fieldTextType = true;
  public email = '';
  public password = '';
  public emailPresent = false;
  public emailError = '';
  public passwordError = '';
  public passwordPresent: boolean;
  public loggedInuser: any;
  constructor(private router: Router, private firebase: FirebaseService, public dataService: AppDataService,
    private storage: Storage, private authService: AuthService) { }
  public ngOnInit() {
  }
  public ionViewDidEnter() {
    this.dataService.presentOnlyLoader().then((loader) => {
      loader.present();
      this.email = '';
      this.password = '';
      this.fieldTextType = true;
      // ? publish that it is the sign-in page
      const obj = {
        title: 'sign-in',
        backPage: '',
      };
      this.dataService.setHeaderTitle(obj);
      // ? get 'userdata' from session and not ionic storage because issue occurs when
      // ? user is logged in with different credentials on different tabs; the latest login details is reflected on remaining tabs
      // this.storage.get('userdata').then((user) => {
      const user = this.dataService.getUserData();
      if (user) {
        // this.loggedInuser = JSON.parse(user);
        this.loggedInuser = user;
        if (this.loggedInuser && this.loggedInuser.email) {
          this.email = this.loggedInuser.email;
          // this.storage.get('authToken').then((userData) => {
          // const userData = JSON.parse(sessionStorage.getItem('authToken'));
          let userToken;
          if (environment.isWeb) {
            userToken = JSON.parse(sessionStorage.getItem('authToken'));
          } else {
            userToken = JSON.parse(localStorage.getItem('authToken'));
          }
          this.authService.setLoginToken(userToken);
          this.authService.interval();
          // sessionStorage.setItem('userdata', JSON.stringify(user));    // ? why set again
          this.dataService.dismiss();
          this.router.navigate(['user-home/' + this.loggedInuser.id]);
          // });
        } else {
          this.dataService.dismiss();
        }
      } else {
        this.dataService.clearUserData(true);
        this.dataService.dismiss();
      }
      // });
    });
  }
  public login() {
    if (this.email && this.email.length !== 0) {
      // this.dataService.present().then((a) => {
      //   a.present();
      // this.validateEmail();
      this.authService.signIn(this.email, this.password);
      // setTimeout(() => {
      //   
      //   if (this.emailPresent) {
      //     if (this.password && this.password.length !== 0) {
      //       this.validatePassword();
      //     } else {
      //       this.dataService.dismiss();
      //       this.dataService.presentAlert('Please enter password to proceed!');
      //     }
      //     if (this.passwordPresent === true) {
      //       this.loginFunction();
      //       this.dataService.dismiss();
      //     } else {
      //       this.dataService.dismiss();
      //       // this.dataService.presentAlert('Please check password you entered!');
      //     }
      //   } else {
      //     this.dataService.dismiss();
      //     this.dataService.presentAlert('Please enter valid username to proceed!');
      //   }
      // }, 2000);
      // });
    } else {
      this.dataService.presentAlert('Please enter email and password to proceed!');
    }
  }
  public validateEmail() {
    if (this.email === '' || this.email.length === 0) {
      this.emailError = 'Please enter email address!';
      this.emailPresent = false;
    } else {
      const regexp = new RegExp('[a-zA-Z0-9_\\.\\+-]+@[a-zA-Z0-9-]+\\.[a-zA-Z0-9-\\.]+');
      const pattern = regexp.test(this.email);
      if (pattern) {
        this.email = this.email.toLowerCase();
        // this.firebase.isAlreadyPresent('email', this.email).subscribe(res => {
        //   if (res.size !== 0) {
        this.emailError = '';
        this.emailPresent = true;
        //     // a.dismiss();
        //   } else {
        //     this.emailPresent = false;
        //     this.emailError = 'Email address is not registered in system!!!';
        //     // a.dismiss();
        //   }
        // });
        // });
      } else {
        this.emailError = 'Email address is incorrect..!!';
        this.emailPresent = false;
      }
    }
  }
  public isEmailPresent() {
  }
  public validatePassword() {
    if (this.password === '' || this.email.length === 0) {
      this.passwordPresent = false;
      this.passwordError = 'Please enter password';
    } else {
      this.passwordPresent = true;
      this.passwordError = '';
    }
  }
  public loginFunction() {
    let user: any = {};
    this.firebase.getUserByEmail(this.email).subscribe(((data) => {
      user = data.docs[0].data();
      user.id = data.docs[0].id;
      user.password = this.dataService.decryptData(user.password);
      if (user.password === this.password) {
        this.dataService.setUserData(user);
        if (user.type !== 'client' || user.type === 'doctor') {
          this.storage.set('userdata', JSON.stringify(user)).then(() => {
            this.dataService.dismiss();
            this.router.navigate(['user-home/' + user.id]);
          });
        } else {
          this.dataService.dismiss();
          this.dataService.presentAlertMessage('Not Authorized!', 'Sorry! You are not authorized to login into system');
        }
      } else {
        this.dataService.dismiss();
        this.dataService.presentAlertMessage('Incorrect Password!', 'Please check password you entered');
      }
    }), (err) => {
      this.dataService.dismiss();
      this.dataService.presentAlert('Something went wrong!!');
    });
  }
  public togglePassword() {
    this.fieldTextType = !this.fieldTextType;
  }
}
