import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PreviewClientInfoPage } from './preview-client-info.page';

const routes: Routes = [
  {
    path: '',
    component: PreviewClientInfoPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PreviewClientInfoPageRoutingModule {}
