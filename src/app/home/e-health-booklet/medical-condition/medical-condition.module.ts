import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MedicalConditionPageRoutingModule } from './medical-condition-routing.module';
import { CalculationModalPageRoutingModule } from './calculation-modal/calculation-modal-routing.module';
import { CalculationModalPage } from './calculation-modal/calculation-modal.page';
import { MedicalConditionPage } from './medical-condition.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MedicalConditionPageRoutingModule,
    CalculationModalPageRoutingModule,
  ],
  declarations: [MedicalConditionPage, CalculationModalPage]
})
export class MedicalConditionPageModule {}
