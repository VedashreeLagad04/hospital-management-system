import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CaseSubmissionPageRoutingModule } from './case-submission-routing.module';

import { CaseSubmissionPage } from './case-submission.page';
import { PreviewModalPageModule } from './preview-modal/preview-modal.module';
// import { PreviewModalPage } from './preview-modal/preview-modal.page';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { NgxDocViewerModule } from 'ngx-doc-viewer';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CaseSubmissionPageRoutingModule,
    PreviewModalPageModule,
    PdfViewerModule,
    NgxDocViewerModule,
  ],
  declarations: [CaseSubmissionPage],
  entryComponents: [],
})
export class CaseSubmissionPageModule {}

