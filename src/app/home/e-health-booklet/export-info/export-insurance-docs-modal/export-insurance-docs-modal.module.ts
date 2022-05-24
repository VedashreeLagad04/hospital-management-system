import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ExportInsuranceDocsModalPageRoutingModule } from './export-insurance-docs-modal-routing.module';

// import { ExportInsuranceDocsModalPage } from './export-insurance-docs-modal.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ExportInsuranceDocsModalPageRoutingModule,
  ],
  // declarations: [ExportInsuranceDocsModalPage],
})
export class ExportInsuranceDocsModalPageModule {}
