import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CaseManagementPage } from './case-management.page';

const routes: Routes = [
  {
    path: '',
    component: CaseManagementPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CaseManagementPageRoutingModule {}
