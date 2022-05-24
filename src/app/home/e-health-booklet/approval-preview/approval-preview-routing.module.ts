import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ApprovalPreviewPage } from './approval-preview.page';

const routes: Routes = [
  {
    path: '',
    component: ApprovalPreviewPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ApprovalPreviewPageRoutingModule {}
