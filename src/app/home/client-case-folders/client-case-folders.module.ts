import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ClientCaseFoldersPageRoutingModule } from './client-case-folders-routing.module';

import { PdfViewerModule } from 'ng2-pdf-viewer';
import { Ng2SearchPipeModule } from 'ng2-search-filter';
import { NgxDocViewerModule } from 'ngx-doc-viewer';
import { ClientCaseFoldersPage } from './client-case-folders.page';
import { PdfFilenameModalPage } from './pdf-filename-modal/pdf-filename-modal.page';
import { BreadcrumbsModule } from '../breadcrumbs/breadcrumbs.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ClientCaseFoldersPageRoutingModule,
    PdfViewerModule,
    Ng2SearchPipeModule,
    NgxDocViewerModule,
    BreadcrumbsModule
  ],
  declarations: [ClientCaseFoldersPage, PdfFilenameModalPage],
  entryComponents: [PdfFilenameModalPage]
})
export class ClientCaseFoldersPageModule {}
