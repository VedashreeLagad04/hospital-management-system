import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PreExtgConditionPage } from './pre-extg-condition.page';

const routes: Routes = [
  {
    path: '',
    component: PreExtgConditionPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PreExtgConditionPageRoutingModule {}
