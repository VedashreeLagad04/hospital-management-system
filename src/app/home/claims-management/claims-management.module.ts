import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ClaimsManagementPageRoutingModule } from './claims-management-routing.module';

import { ClaimsManagementPage } from './claims-management.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ClaimsManagementPageRoutingModule
  ],
  declarations: [ClaimsManagementPage]
})
export class ClaimsManagementPageModule {}
