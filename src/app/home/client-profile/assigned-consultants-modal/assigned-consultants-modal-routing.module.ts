import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AssignedConsultantsModalPage } from './assigned-consultants-modal.page';

const routes: Routes = [
  {
    path: '',
    component: AssignedConsultantsModalPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AssignedConsultantsModalPageRoutingModule {}
