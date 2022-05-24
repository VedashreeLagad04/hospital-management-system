import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TravelDeclarationPage } from './travel-declaration.page';

const routes: Routes = [
  {
    path: '',
    component: TravelDeclarationPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TravelDeclarationPageRoutingModule {}
