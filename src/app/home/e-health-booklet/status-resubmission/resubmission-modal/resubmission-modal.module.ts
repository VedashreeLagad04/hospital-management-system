import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ResubmissionModalPageRoutingModule } from './resubmission-modal-routing.module';

import { ResubmissionModalPage } from './resubmission-modal.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ResubmissionModalPageRoutingModule,
  ],
  declarations: [ResubmissionModalPage],
  entryComponents: [ResubmissionModalPage],

})
export class ResubmissionModalPageModule {}
