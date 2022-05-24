import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CaseUpdateStatusPage } from './case-update-status.page';

const routes: Routes = [
  {
    path: '',
    component: CaseUpdateStatusPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CaseUpdateStatusPageRoutingModule {}
