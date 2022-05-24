import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CaseManagementPageRoutingModule } from './case-management-routing.module';

import { CaseManagementPage } from './case-management.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CaseManagementPageRoutingModule
  ],
  declarations: [CaseManagementPage]
})
export class CaseManagementPageModule {}
