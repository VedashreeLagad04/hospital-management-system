import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ResubmissionModalPage } from './resubmission-modal.page';

const routes: Routes = [
  {
    path: '',
    component: ResubmissionModalPage,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ResubmissionModalPageRoutingModule {}
