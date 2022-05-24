import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ClientInformationPage } from './client-information.page';

const routes: Routes = [
  {
    path: '',
    component: ClientInformationPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ClientInformationPageRoutingModule {}
