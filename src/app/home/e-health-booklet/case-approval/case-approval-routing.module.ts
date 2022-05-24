import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CaseApprovalPage } from './case-approval.page';

const routes: Routes = [
  {
    path: '',
    component: CaseApprovalPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CaseApprovalPageRoutingModule {}
