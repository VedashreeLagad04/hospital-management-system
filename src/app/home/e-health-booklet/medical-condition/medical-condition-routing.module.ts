import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MedicalConditionPage } from './medical-condition.page';

const routes: Routes = [
  {
    path: '',
    component: MedicalConditionPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MedicalConditionPageRoutingModule {}
