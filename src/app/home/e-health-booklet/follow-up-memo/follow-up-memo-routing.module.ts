import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { FollowUpMemoPage } from './follow-up-memo.page';

const routes: Routes = [
  {
    path: '',
    component: FollowUpMemoPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FollowUpMemoPageRoutingModule {}
