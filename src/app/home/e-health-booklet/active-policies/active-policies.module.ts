import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ActivePoliciesPageRoutingModule } from './active-policies-routing.module';

import { ActivePoliciesPage } from './active-policies.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ActivePoliciesPageRoutingModule
  ],
  declarations: [ActivePoliciesPage]
})
export class ActivePoliciesPageModule {}
