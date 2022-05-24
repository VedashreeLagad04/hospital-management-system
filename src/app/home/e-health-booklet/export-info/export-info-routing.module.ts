import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ExportInfoPage } from './export-info.page';

const routes: Routes = [
  {
    path: '',
    component: ExportInfoPage,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ExportInfoPageRoutingModule {}
