import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ClientProfilePage } from './client-profile.page';

const routes: Routes = [
  {
    path: '',
    component: ClientProfilePage
  },
  {
    path: 'client-information',
    loadChildren: () => import('./client-information/client-information.module').then( m => m.ClientInformationPageModule)
  },
  {
    path: 'personal-particular',
    loadChildren: () => import('./personal-particular/personal-particular.module').then( m => m.PersonalParticularPageModule)
  }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ClientProfilePageRoutingModule {}
