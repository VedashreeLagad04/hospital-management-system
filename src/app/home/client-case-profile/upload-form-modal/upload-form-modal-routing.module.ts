import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { UploadFormModalPage } from './upload-form-modal.page';

const routes: Routes = [
  {
    path: '',
    component: UploadFormModalPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class UploadFormModalPageRoutingModule {}
