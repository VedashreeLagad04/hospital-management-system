import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ClientCaseAppointmentAddPage } from './client-case-appointment-add.page';

const routes: Routes = [
  {
    path: '',
    component: ClientCaseAppointmentAddPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ClientCaseAppointmentAddPageRoutingModule {}
