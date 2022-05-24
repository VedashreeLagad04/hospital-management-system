import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { InsuranceCalculatorPage } from './insurance-calculator.page';

const routes: Routes = [
  {
    path: '',
    component: InsuranceCalculatorPage
  },
  {
    path: 'calculator',
    loadChildren: () => import('./calculator/calculator.module').then( m => m.CalculatorPageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class InsuranceCalculatorPageRoutingModule {}
