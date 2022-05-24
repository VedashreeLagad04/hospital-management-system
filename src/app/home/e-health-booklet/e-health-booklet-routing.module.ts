import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { EHealthBookletPage } from './e-health-booklet.page';

const routes: Routes = [
  {
    path: '',
    component: EHealthBookletPage,
    children: [
      {
        path: 'profile/:id',
        loadChildren: () => import('./profile/profile.module').then(m => m.ProfilePageModule)
      },
      {
        path: 'case/:id',
        loadChildren: () => import('./case/case.module').then(m => m.CasePageModule)
      },
      {
        path: 'active-policies/:id',
        loadChildren: () => import('./active-policies/active-policies.module').then(m => m.ActivePoliciesPageModule)
      },
      {
        path: 'insurance-docs/:id',
        loadChildren: () => import('./insurance-docs/insurance-docs.module').then(m => m.InsuranceDocsPageModule)
      },
      {
        path: 'medical-history/:id',
        loadChildren: () => import('./pre-extg-condition/pre-extg-condition.module').then(m => m.PreExtgConditionPageModule)
      },
      {
        path: 'travel-declaration/:id',
        loadChildren: () => import('./travel-declaration/travel-declaration.module').then(m => m.TravelDeclarationPageModule)
      },
      {
        path: 'pre-admission-checklist/:id',
        loadChildren: () => import('./pre-admission-checklist/pre-admission-checklist.module').then(m => m.PreAdmissionChecklistPageModule)
      },
      {
        path: 'preview/:id',
        loadChildren: () => import('./preview/preview.module').then(m => m.PreviewPageModule)
      },
      {
        path: 'case-submission/:id',
        loadChildren: () => import('./case-submission/case-submission.module').then(m => m.CaseSubmissionPageModule)
      },
      {
        path: 'case-approval/:id',
        loadChildren: () => import('./case-approval/case-approval.module').then(m => m.CaseApprovalPageModule)
      },
      {
        path: 'approval-preview/:id',
        loadChildren: () => import('./approval-preview/approval-preview.module').then(m => m.ApprovalPreviewPageModule)
      },
      {
        path: 'administration/:id',
        loadChildren: () => import('./administration/administration.module').then(m => m.AdministrationPageModule)
      },
      {
        path: 'medical-condition/:tab/:id',
        loadChildren: () => import('./medical-condition/medical-condition.module').then(m => m.MedicalConditionPageModule)
      },
      {
        path: 'consultation-memo/:id',
        loadChildren: () => import('./follow-up-memo/follow-up-memo.module').then(m => m.FollowUpMemoPageModule)
      }, {
        path: 'status-resubmission/:id',
        loadChildren: () => import('./status-resubmission/status-resubmission.module').then(m => m.StatusResubmissionPageModule)
      },
      {
        path: 'export-info/:id',
        loadChildren: () => import('./export-info/export-info.module').then(m => m.ExportInfoPageModule)
      },
      {
        path: 'letter-of-consent/:id',
        loadChildren: () => import('./letter-of-consent/letter-of-consent.module').then(m => m.LetterOfConsentPageModule)
      },
    ]
  },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EHealthBookletPageRoutingModule { }
