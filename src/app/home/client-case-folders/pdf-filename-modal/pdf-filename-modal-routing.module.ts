import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PdfFilenameModalPage } from './pdf-filename-modal.page';

const routes: Routes = [
  {
    path: '',
    component: PdfFilenameModalPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PdfFilenameModalPageRoutingModule {}
