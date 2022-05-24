import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ClientCaseListPage } from './client-case-list.page';

const routes: Routes = [
  {
    path: '',
    component: ClientCaseListPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ClientCaseListPageRoutingModule {}
