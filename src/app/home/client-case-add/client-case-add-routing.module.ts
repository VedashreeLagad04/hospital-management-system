import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ClientCaseAddPage } from './client-case-add.page';

const routes: Routes = [
  {
    path: '',
    component: ClientCaseAddPage,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ClientCaseAddPageRoutingModule { }
