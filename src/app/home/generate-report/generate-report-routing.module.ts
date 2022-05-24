import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { GenerateReportPage } from './generate-report.page';

const routes: Routes = [
  {
    path: '',
    component: GenerateReportPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class GenerateReportPageRoutingModule {}
