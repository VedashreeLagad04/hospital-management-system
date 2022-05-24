import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PersonalParticularPage } from './personal-particular.page';

const routes: Routes = [
  {
    path: '',
    component: PersonalParticularPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PersonalParticularPageRoutingModule {}
