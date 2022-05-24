import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { GenerateReportPageRoutingModule } from './generate-report-routing.module';

import { GenerateReportPage } from './generate-report.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    GenerateReportPageRoutingModule
  ],
  declarations: [GenerateReportPage]
})
export class GenerateReportPageModule {}
