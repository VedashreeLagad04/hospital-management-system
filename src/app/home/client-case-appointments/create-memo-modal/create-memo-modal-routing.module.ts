import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CreateMemoModalPage } from './create-memo-modal.page';

const routes: Routes = [
  {
    path: '',
    component: CreateMemoModalPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CreateMemoModalPageRoutingModule {}
