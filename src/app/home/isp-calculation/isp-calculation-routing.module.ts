import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { IspCalculationPage } from './isp-calculation.page';

const routes: Routes = [
  {
    path: '',
    component: IspCalculationPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class IspCalculationPageRoutingModule {}
