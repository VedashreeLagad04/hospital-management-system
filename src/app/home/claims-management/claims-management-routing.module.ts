import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ClaimsManagementPage } from './claims-management.page';

const routes: Routes = [
  {
    path: '',
    component: ClaimsManagementPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ClaimsManagementPageRoutingModule {}
