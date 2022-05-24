import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { CalculationModalPage } from './calculation-modal.page';

const routes: Routes = [
  {
    path: '',
    component: CalculationModalPage,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CalculationModalPageRoutingModule {}
