import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { IspCalculatorPage } from './isp-calculator.page';

const routes: Routes = [
  {
    path: '',
    component: IspCalculatorPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class IspCalculatorPageRoutingModule {}
