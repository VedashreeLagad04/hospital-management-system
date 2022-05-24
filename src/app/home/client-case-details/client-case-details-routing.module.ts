import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ClientCaseDetailsPage } from './client-case-details.page';

const routes: Routes = [
  {
    path: '',
    component: ClientCaseDetailsPage,
    children: [
      {
        path: 'case',
        loadChildren: () => import('./case/case.module').then(m => m.CasePageModule)
      },
      {
        path: 'policy',
        loadChildren: () => import('./policy/policy.module').then(m => m.PolicyPageModule)
      },
      {
        path: 'claims',
        loadChildren: () => import('./claims/claims.module').then(m => m.ClaimsPageModule)
      },
      {
        path: 'revenue',
        loadChildren: () => import('./revenue/revenue.module').then(m => m.RevenuePageModule)
      },
      {
        path: 'export-info',
        loadChildren: () => import('./export-info/export-info.module').then(m => m.ExportInfoPageModule)
      }
    ]
  },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ClientCaseDetailsPageRoutingModule { }
