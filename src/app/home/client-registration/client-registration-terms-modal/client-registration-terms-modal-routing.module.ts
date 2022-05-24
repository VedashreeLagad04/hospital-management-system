import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ClientRegistrationTermsModalPage } from './client-registration-terms-modal.page';

const routes: Routes = [
  {
    path: '',
    component: ClientRegistrationTermsModalPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ClientRegistrationTermsModalPageRoutingModule {}
