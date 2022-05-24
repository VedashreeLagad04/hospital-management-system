/* eslint-disable max-len */
import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { Storage } from '@ionic/storage';
import { environment } from 'src/environments/environment';
import { AppDataService } from './app-data.service';
import { FirebaseService } from './firebase.service';
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  public token: any;
  // ? for auto-logout
  // minutesUntilAutoLogout = 2 * 60 * 1000;            // 1 min
  minutesUntilAutoLogout = 24 * 60 * 60 * 1000;  // 12 hours in ms (hours converted to milliseconds) // ? changed to 24 hr on 31 mar, 2022 (trello card)
  intervalInMinutes = 1;      // in mins
  checkInterval = this.intervalInMinutes * 60 * 1000;  // in ms
  storeKey = 'lastAction';
  intervalId;
  isUserLoggedIn = false;
  constructor(private router: Router, public afs: AngularFirestore,
    private angularFireAuth: AngularFireAuth, private dataService: AppDataService,
    private firebase: FirebaseService, private storage: Storage) {
      this.interval();
     }
  public signIn(email: string, password: string) {
    this.dataService.presentOnlyLoader().then((loader) => {
      loader.present();
      this.angularFireAuth.signInWithEmailAndPassword(email, password).then(
        (resp) => {
          // this.getToken();
          let user;
          this.firebase.getUserDetails(resp.user.uid).subscribe(async (result) => {
            if (result) {
              user = result.data();
              user.id = resp.user.uid;
              if (user.type !== 'superAdmin' && user.type !== 'client') {
                if (user.currentStatus === 'active') {
                  await this.getToken();
                  // this.storage.set('userdata', JSON.stringify(user)).then(() => {
                  this.isUserLoggedIn = true;
                  this.dataService.setUserData(user);
                  // this.storage.set(this.storeKey, Date.now().toString()).then(() => {
                  if (environment.isWeb) {
                    sessionStorage.setItem(this.storeKey, Date.now().toString());
                  } else {
                    localStorage.setItem(this.storeKey, Date.now().toString());
                  }
                  this.interval();
                  // });
                  // this.dataService.dismiss();
                  // this.router.navigate(['user-home/' + user.id]);
                  // });
                  loader.dismiss();
                  this.router.navigate(['user-home/' + user.id]);
                } else {
                  loader.dismiss();
                  this.dataService.presentAlert('Sorry! Your account is suspended');
                }
              } else {
                loader.dismiss();
                this.dataService.presentAlert('Unauthorized Access!');
              }
            }
          }, (err) => {
            loader.dismiss();
            this.dataService.presentAlert('Something went wrong, try reloading the app!');
          });
        },
      ).catch(
        (error) => {
          if (error.code === 'auth/user-not-found') {
            loader.dismiss();
            this.dataService.presentAlert('Email address is not registered!');
          } else if (error.code === 'auth/wrong-password') {
            loader.dismiss();
            this.dataService.presentAlert('Password is incorrect');
          } else if (error.code === 'auth/user-disabled') {
            loader.dismiss();
            this.dataService.presentAlert('Unauthorized Access!');
          } else if (error.code === 'auth/invalid-email') {
            loader.dismiss();
            this.dataService.presentAlert('Please enter valid email address');
          }
        },
      );
    });
  }
  public getToken() {
    return new Promise((resolve) => {
      this.angularFireAuth.currentUser.then((resp) => {
        this.token = resp.refreshToken;
        // this.storage.set('authToken', this.token);
        if (environment.isWeb) {
          sessionStorage.setItem('authToken', JSON.stringify(this.token));
        } else {
          localStorage.setItem('authToken', JSON.stringify(this.token));
        }
        resolve(true);
      });
    });
  }
  public setLoginToken(token) {
    this.token = token;
  }
  public isAuthenticated() {
    if (environment.isWeb) {
      // ? comment below line for ipad version; uncomment for website version
      this.token = JSON.parse(sessionStorage.getItem('authToken'));
    }
    //
    // if (!this.token) {
    //   this.storage.get('authToken').then((userData) => {
    //     this.token = userData;
    //
    //   });
    // }
    //
    return this.token != null;
  }
  public logout() {
    // this.angularFireAuth.user.subscribe((user) => {// ? removed to fix 'missing permissions' error when login -> logout -> login (without refreshing)
    // ? above function gets current user
    // const loggedInUser = this.dataService.getUserData();
    // if (user.email === loggedInUser.email) {
    this.angularFireAuth.signOut().then(() => {
    });
    // this.angularFireAuth.
    this.token = null;
    this.isUserLoggedIn = false;
    // this.storage.remove('authToken');
    // this.storage.remove(this.storeKey);
    clearInterval(this.intervalId);
    this.dataService.clearUserData(true);
    // }
    // });
  }
  public interval() {
    this.intervalId = setInterval(() => {
      this.checkForAutoLogout();
    }, this.checkInterval);
  }
  public checkForAutoLogout() {
    // this.storage.get(this.storeKey).then((data) => {
    let data: any;
    if (environment.isWeb) {
      data = sessionStorage.getItem(this.storeKey);
    } else {
      data = localStorage.getItem(this.storeKey);
    }
    // eslint-disable-next-line radix
    const lastActionTime = parseInt(data);
    const now = Date.now();
    const timeLeft = lastActionTime + this.minutesUntilAutoLogout;
    const timeDiff = timeLeft - now;
    const isTimeout = timeDiff < 0;
    // const timeDiff = now - lastActionTime;
    // const isTimeout = timeDiff > this.minutesUntilAutoLogout;
    if (isTimeout) {
      this.dataService.presentAlert('You have been logged out!');
      this.logout();
      this.router.navigate(['/sign-in']);
    }    // });
  }
}
