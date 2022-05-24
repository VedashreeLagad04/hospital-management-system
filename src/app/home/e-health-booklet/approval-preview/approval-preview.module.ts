import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ApprovalPreviewPageRoutingModule } from './approval-preview-routing.module';

import { ApprovalPreviewPage } from './approval-preview.page';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { Ng2SearchPipeModule } from 'ng2-search-filter';
import { NgxDocViewerModule } from 'ngx-doc-viewer';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ApprovalPreviewPageRoutingModule,
    PdfViewerModule,
    Ng2SearchPipeModule,
    NgxDocViewerModule,
  ],
  declarations: [ApprovalPreviewPage]
})
export class ApprovalPreviewPageModule {}
