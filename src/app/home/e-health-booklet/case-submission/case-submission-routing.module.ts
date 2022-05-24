import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CaseSubmissionPage } from './case-submission.page';

const routes: Routes = [
  {
    path: '',
    component: CaseSubmissionPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CaseSubmissionPageRoutingModule {}
