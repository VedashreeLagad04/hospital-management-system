import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { AppDataService } from './app-data.service';
import { AuthService } from './auth.service';
import { FirebaseService } from './firebase.service';
@Injectable({
  providedIn: 'root',
})
export class RouteGuardService implements CanActivate {
  constructor(private authService: AuthService, private router: Router,
    private firebase: FirebaseService,
    private dataService: AppDataService) { }
    public canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    let allow;
    if (this.authService.isAuthenticated()) {
      const user = this.dataService.getUserData();
      if (user.currentStatus === 'suspend') {
        allow = false;
        this.router.navigateByUrl('/sign-in');
      } else {
        allow = true;
      }
    } else {
      if (this.authService.token === null) {
        this.router.navigateByUrl('/sign-in');
        // this.dataService.presentAlert('Please login first');
      }
      allow = false;
    }
    return allow;
  }
}
