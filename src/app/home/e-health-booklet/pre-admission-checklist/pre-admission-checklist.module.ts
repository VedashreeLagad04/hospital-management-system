import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PreAdmissionChecklistPageRoutingModule } from './pre-admission-checklist-routing.module';

import { PreAdmissionChecklistPage } from './pre-admission-checklist.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PreAdmissionChecklistPageRoutingModule
  ],
  declarations: [PreAdmissionChecklistPage]
})
export class PreAdmissionChecklistPageModule {}
