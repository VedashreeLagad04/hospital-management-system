import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DischargeDocsChecklistPage } from './discharge-docs-checklist.page';

const routes: Routes = [
  {
    path: '',
    component: DischargeDocsChecklistPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DischargeDocsChecklistPageRoutingModule {}
