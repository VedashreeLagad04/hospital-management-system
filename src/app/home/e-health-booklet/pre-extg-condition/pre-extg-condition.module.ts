import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PreExtgConditionPageRoutingModule } from './pre-extg-condition-routing.module';

import { PreExtgConditionPage } from './pre-extg-condition.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PreExtgConditionPageRoutingModule
  ],
  declarations: [PreExtgConditionPage]
})
export class PreExtgConditionPageModule {}
