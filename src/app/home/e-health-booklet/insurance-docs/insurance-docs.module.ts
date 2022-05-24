import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { InsuranceDocsPageRoutingModule } from './insurance-docs-routing.module';

import { PdfViewerModule } from 'ng2-pdf-viewer';
import { Ng2SearchPipeModule } from 'ng2-search-filter';
import { NgxDocViewerModule } from 'ngx-doc-viewer';
import { FileOpenerModalComponent } from './file-opener-modal/file-opener-modal.component';
import { InsuranceDocsPage } from './insurance-docs.page';
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    InsuranceDocsPageRoutingModule,
    PdfViewerModule,
    Ng2SearchPipeModule,
    NgxDocViewerModule,
  ],
  declarations: [InsuranceDocsPage, FileOpenerModalComponent],
  entryComponents: [FileOpenerModalComponent],
})
export class InsuranceDocsPageModule { }
