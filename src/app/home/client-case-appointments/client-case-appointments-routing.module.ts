import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ClientCaseAppointmentsPage } from './client-case-appointments.page';

const routes: Routes = [
  {
    path: '',
    component: ClientCaseAppointmentsPage
  },
  {
    path: 'create-memo-modal',
    loadChildren: () => import('./create-memo-modal/create-memo-modal.module').then( m => m.CreateMemoModalPageModule)
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ClientCaseAppointmentsPageRoutingModule {}
