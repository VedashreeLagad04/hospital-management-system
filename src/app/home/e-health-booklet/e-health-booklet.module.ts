import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { EHealthBookletPageRoutingModule } from './e-health-booklet-routing.module';

import { SignatureModalPage } from '../signature-modal/signature-modal.page';
import { EHealthBookletPage } from './e-health-booklet.page';
import { ResubmissionModalPage } from './status-resubmission/resubmission-modal/resubmission-modal.page';
import { PreviewModalPage } from './case-submission/preview-modal/preview-modal.page';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { NgxDocViewerModule } from 'ngx-doc-viewer';
import { BreadcrumbsModule } from '../breadcrumbs/breadcrumbs.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    EHealthBookletPageRoutingModule,
    PdfViewerModule,
    NgxDocViewerModule,
    BreadcrumbsModule
  ],
  declarations: [EHealthBookletPage, PreviewModalPage],
  entryComponents: [PreviewModalPage],
})
export class EHealthBookletPageModule { }
