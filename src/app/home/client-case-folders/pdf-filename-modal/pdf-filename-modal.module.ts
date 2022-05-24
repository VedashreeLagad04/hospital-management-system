import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PdfFilenameModalPageRoutingModule } from './pdf-filename-modal-routing.module';

import { PdfFilenameModalPage } from './pdf-filename-modal.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PdfFilenameModalPageRoutingModule,
  ],
  declarations: [],
})
export class PdfFilenameModalPageModule {}
