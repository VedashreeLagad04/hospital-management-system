import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LetterOfEngagementPage } from './letter-of-engagement.page';

const routes: Routes = [
  {
    path: '',
    component: LetterOfEngagementPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LetterOfEngagementPageRoutingModule {}
