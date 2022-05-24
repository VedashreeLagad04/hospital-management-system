import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { InsuranceCalculatorPageRoutingModule } from './insurance-calculator-routing.module';

import { InsuranceCalculatorPage } from './insurance-calculator.page';
import { CalculatorPage } from './calculator/calculator.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    InsuranceCalculatorPageRoutingModule
  ],
  declarations: [InsuranceCalculatorPage,CalculatorPage],
  entryComponents: [CalculatorPage]
})
export class InsuranceCalculatorPageModule {}
