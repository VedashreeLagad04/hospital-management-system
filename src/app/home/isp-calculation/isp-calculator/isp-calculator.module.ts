import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { IspCalculatorPageRoutingModule } from './isp-calculator-routing.module';

import { IspCalculatorPage } from './isp-calculator.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
  ],
})
export class IspCalculatorPageModule {}
