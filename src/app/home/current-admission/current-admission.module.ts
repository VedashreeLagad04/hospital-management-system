import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CurrentAdmissionPageRoutingModule } from './current-admission-routing.module';

import { CurrentAdmissionPage } from './current-admission.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CurrentAdmissionPageRoutingModule
  ],
  declarations: [CurrentAdmissionPage]
})
export class CurrentAdmissionPageModule {}
