import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SignatureModalPage } from './signature-modal.page';

const routes: Routes = [
  {
    path: '',
    component: SignatureModalPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SignatureModalPageRoutingModule {}
