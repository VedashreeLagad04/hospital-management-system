import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { EditDocumentFileNamesPage } from './edit-document-file-names.page';

const routes: Routes = [
  {
    path: '',
    component: EditDocumentFileNamesPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EditDocumentFileNamesPageRoutingModule {}
