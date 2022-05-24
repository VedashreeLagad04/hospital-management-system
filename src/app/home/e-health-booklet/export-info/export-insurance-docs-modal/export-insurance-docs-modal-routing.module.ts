import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ExportInsuranceDocsModalPage } from './export-insurance-docs-modal.page';

const routes: Routes = [
  {
    path: '',
    component: ExportInsuranceDocsModalPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ExportInsuranceDocsModalPageRoutingModule {}
