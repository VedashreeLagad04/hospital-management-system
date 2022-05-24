import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ExportInfoPageRoutingModule } from './export-info-routing.module';

import { ExportInfoPage } from './export-info.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ExportInfoPageRoutingModule
  ],
  declarations: [ExportInfoPage]
})
export class ExportInfoPageModule {}
