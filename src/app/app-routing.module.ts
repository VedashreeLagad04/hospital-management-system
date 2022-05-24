/* eslint-disable max-len */
import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { RouteGuardService } from './services/route-guard.service';

const routes: Routes = [
  {
    path: 'home',
    loadChildren: () => import('./home/home.module').then((m) => m.HomePageModule),
  },
  {
    path: 'insurance-calculator',
    canActivate: [RouteGuardService],
    loadChildren: () => import('./home/insurance-calculator/insurance-calculator.module').then((m) => m.InsuranceCalculatorPageModule),
  },
  {
    path: '',
    redirectTo: 'sign-in',
    pathMatch: 'full',
  },
  {
    path: 'user-home/:id',
    canActivate: [RouteGuardService],
    loadChildren: () => import('./home/user-home/user-home.module').then((m) => m.UserHomePageModule),
  },
  {
    path: 'client-list/:id',
    canActivate: [RouteGuardService],
    loadChildren: () => import('./home/client-list/client-list.module').then((m) => m.ClientListPageModule),
  },
  {
    path: 'client-registration/:id',
    canActivate: [RouteGuardService],
    loadChildren: () => import('./home/client-registration/client-registration.module').then((m) => m.ClientRegistrationPageModule),
  },
  {
    path: 'sign-in',
    loadChildren: () => import('./home/sign-in/sign-in.module').then((m) => m.SignInPageModule),
  },
  {
    path: 'client-profile/:id',
    canActivate: [RouteGuardService],
    loadChildren: () => import('./home/client-profile/client-profile.module').then((m) => m.ClientProfilePageModule),
  },
  {
    path: 'client-case-add/:clientId/:caseId',
    canActivate: [RouteGuardService],
    loadChildren: () => import('./home/client-case-add/client-case-add.module').then((m) => m.ClientCaseAddPageModule),
  },
  {
    path: 'client-case-list/:id',
    canActivate: [RouteGuardService],
    loadChildren: () => import('./home/client-case-list/client-case-list.module').then((m) => m.ClientCaseListPageModule),
  },
  {
    path: 'client-case-details',
    canActivate: [RouteGuardService],
    loadChildren: () => import('./home/client-case-details/client-case-details.module').then((m) => m.ClientCaseDetailsPageModule),
  },
  {
    path: 'client-case-profile',
    canActivate: [RouteGuardService],
    loadChildren: () => import('./home/client-case-profile/client-case-profile.module').then((m) => m.ClientCaseProfilePageModule),
  },
  {
    path: 'client-case-appointments/:id',
    canActivate: [RouteGuardService],
    loadChildren: () => import('./home/client-case-appointments/client-case-appointments.module').then((m) => m.ClientCaseAppointmentsPageModule),
  },
  {
    path: 'client-case-appointment-add/:mode/:id',
    // tslint:disable-next-line: max-line-length
    canActivate: [RouteGuardService],
    loadChildren: () => import('./home/client-case-appointment-add/client-case-appointment-add.module').then((m) => m.ClientCaseAppointmentAddPageModule),
  },
  {
    path: 'client-case-folders',
    canActivate: [RouteGuardService],
    loadChildren: () => import('./home/client-case-folders/client-case-folders.module').then((m) => m.ClientCaseFoldersPageModule),
  },
  {
    path: 'current-admission',
    canActivate: [RouteGuardService],
    loadChildren: () => import('./home/current-admission/current-admission.module').then((m) => m.CurrentAdmissionPageModule),
  },
  {
    path: 'invoices',
    canActivate: [RouteGuardService],
    loadChildren: () => import('./home/invoices/invoices.module').then((m) => m.InvoicesPageModule),
  },
  {
    path: 'isp-calculation',
    canActivate: [RouteGuardService],
    loadChildren: () => import('./home/isp-calculation/isp-calculation.module').then((m) => m.IspCalculationPageModule),
  },
  {
    path: 'registration-policy',
    canActivate: [RouteGuardService],
    loadChildren: () => import('./home/client-registration/registration-policy/registration-policy.module').then((m) => m.RegistrationPolicyPageModule),
  },
  {
    path: 'letter-of-engagement/:id',
    canActivate: [RouteGuardService],
    loadChildren: () => import('./home/client-registration/letter-of-engagement/letter-of-engagement.module').then((m) => m.LetterOfEngagementPageModule),
  },
  {
    path: 'letter-of-consent/:type',
    canActivate: [RouteGuardService],
    loadChildren: () => import('./home/client-registration/letter-of-consent/letter-of-consent.module').then((m) => m.LetterOfConsentPageModule),
  },
  {
    path: 'e-health-booklet',
    canActivate: [RouteGuardService],
    loadChildren: () => import('./home/e-health-booklet/e-health-booklet.module').then((m) => m.EHealthBookletPageModule),
  },
  {
    path: 'claims-management',
    canActivate: [RouteGuardService],
    loadChildren: () => import('./home/claims-management/claims-management.module').then((m) => m.ClaimsManagementPageModule)
  },
  {
    path: 'case-management',
    canActivate: [RouteGuardService],
    loadChildren: () => import('./home/case-management/case-management.module').then((m) => m.CaseManagementPageModule)
  },
  {
    path: 'generate-report',
    canActivate: [RouteGuardService],
    loadChildren: () => import('./home/generate-report/generate-report.module').then((m) => m.GenerateReportPageModule)
  },
  {
    path: 'preview-client-info',
    canActivate: [RouteGuardService],
    loadChildren: () => import('./home/client-registration/preview-client-info/preview-client-info.module').then(m => m.PreviewClientInfoPageModule)
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules, scrollPositionRestoration: 'enabled' })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
