import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ClientRegistrationPage } from './client-registration.page';

const routes: Routes = [
  {
    path: '',
    component: ClientRegistrationPage,
    children: [
      {
        path: 'client-registration-terms-modal',
        loadChildren: () => import('./client-registration-terms-modal/client-registration-terms-modal.module').then(m => m.ClientRegistrationTermsModalPageModule)
      },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ClientRegistrationPageRoutingModule { }
