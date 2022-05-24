import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { IspCalculationPageRoutingModule } from './isp-calculation-routing.module';

import { IspCalculationPage } from './isp-calculation.page';
import { IspCalculatorPage } from './isp-calculator/isp-calculator.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    IspCalculationPageRoutingModule,
  ],
  declarations: [IspCalculationPage, IspCalculatorPage],
  entryComponents: [IspCalculatorPage],
})
export class IspCalculationPageModule {}
