import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ResubmissionModalPageModule } from './resubmission-modal/resubmission-modal.module';
import { StatusResubmissionPageRoutingModule } from './status-resubmission-routing.module';
import { StatusResubmissionPage } from './status-resubmission.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    StatusResubmissionPageRoutingModule,
    ResubmissionModalPageModule,
  ],
  declarations: [StatusResubmissionPage],
})
export class StatusResubmissionPageModule {}
