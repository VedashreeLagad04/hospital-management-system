import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ExportInfoPageRoutingModule } from './export-info-routing.module';

import { ExportInfoPage } from './export-info.page';
import { ExportInsuranceDocsModalPage } from './export-insurance-docs-modal/export-insurance-docs-modal.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ExportInfoPageRoutingModule,
  ],
  declarations: [ExportInfoPage, ExportInsuranceDocsModalPage],
  entryComponents: [ExportInsuranceDocsModalPage],
})
export class ExportInfoPageModule {}
