import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { RegistrationPolicyPageRoutingModule } from './registration-policy-routing.module';

import { RegistrationPolicyPage } from './registration-policy.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RegistrationPolicyPageRoutingModule
  ],
  declarations: [RegistrationPolicyPage]
})
export class RegistrationPolicyPageModule {}
