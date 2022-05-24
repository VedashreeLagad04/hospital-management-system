import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ActivePoliciesPage } from './active-policies.page';

const routes: Routes = [
  {
    path: '',
    component: ActivePoliciesPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ActivePoliciesPageRoutingModule {}
