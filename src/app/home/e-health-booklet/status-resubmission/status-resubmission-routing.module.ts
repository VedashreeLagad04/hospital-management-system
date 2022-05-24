import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { StatusResubmissionPage } from './status-resubmission.page';

const routes: Routes = [
  {
    path: '',
    component: StatusResubmissionPage,
  },
  {
    path: 'resubmission-modal',
    loadChildren: () => import('./resubmission-modal/resubmission-modal.module').then( (m) => m.ResubmissionModalPageModule),
  },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class StatusResubmissionPageRoutingModule {}
