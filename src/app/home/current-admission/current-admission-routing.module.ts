import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CurrentAdmissionPage } from './current-admission.page';

const routes: Routes = [
  {
    path: '',
    component: CurrentAdmissionPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CurrentAdmissionPageRoutingModule {}
