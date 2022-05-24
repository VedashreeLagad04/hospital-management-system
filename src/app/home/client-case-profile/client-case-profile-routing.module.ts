import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ClientCaseProfilePage } from './client-case-profile.page';

const routes: Routes = [
  {
    path: '',
    component: ClientCaseProfilePage
  },
  {
    path: 'case-update-status',
    loadChildren: () => import('./case-update-status/case-update-status.module').then(m => m.CaseUpdateStatusPageModule),
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ClientCaseProfilePageRoutingModule { }
