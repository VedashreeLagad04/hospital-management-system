import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PreAdmissionChecklistPage } from './pre-admission-checklist.page';

const routes: Routes = [
  {
    path: '',
    component: PreAdmissionChecklistPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PreAdmissionChecklistPageRoutingModule {}
