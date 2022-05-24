import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DischargeDocsChecklistPageRoutingModule } from './discharge-docs-checklist-routing.module';

import { PdfViewerModule } from 'ng2-pdf-viewer';
import { Ng2SearchPipeModule } from 'ng2-search-filter';
import { NgxDocViewerModule } from 'ngx-doc-viewer';
import { DischargeDocsChecklistPage } from './discharge-docs-checklist.page';
import { BreadcrumbsModule } from '../../breadcrumbs/breadcrumbs.module';
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DischargeDocsChecklistPageRoutingModule,
    PdfViewerModule,
    Ng2SearchPipeModule,
    NgxDocViewerModule,
    BreadcrumbsModule
  ],
  declarations: [DischargeDocsChecklistPage],
})
export class DischargeDocsChecklistPageModule {}
