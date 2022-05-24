import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CalculationModalPageRoutingModule } from './calculation-modal-routing.module';

import { CalculationModalPage } from './calculation-modal.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CalculationModalPageRoutingModule,
  ],
  declarations: [],
})
export class CalculationModalPageModule {}
