import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { InsuranceDocsPage } from './insurance-docs.page';

const routes: Routes = [
  {
    path: '',
    component: InsuranceDocsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class InsuranceDocsPageRoutingModule {}
