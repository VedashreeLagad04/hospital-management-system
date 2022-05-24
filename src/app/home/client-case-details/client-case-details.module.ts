import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ClientCaseDetailsPageRoutingModule } from './client-case-details-routing.module';

import { ClientCaseDetailsPage } from './client-case-details.page';
import { EditDocumentFileNamesPage } from '../edit-document-file-names/edit-document-file-names.page';
import { BreadcrumbsModule } from '../breadcrumbs/breadcrumbs.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    BreadcrumbsModule,
    ClientCaseDetailsPageRoutingModule
  ],
  // declarations: [ClientCaseDetailsPage],
  declarations: [ClientCaseDetailsPage, EditDocumentFileNamesPage],
  entryComponents: [EditDocumentFileNamesPage]
})
export class ClientCaseDetailsPageModule {}
