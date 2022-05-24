import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CaseApprovalPageRoutingModule } from './case-approval-routing.module';

import { CaseApprovalPage } from './case-approval.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CaseApprovalPageRoutingModule,
  ],
  declarations: [CaseApprovalPage]
})
export class CaseApprovalPageModule { }
