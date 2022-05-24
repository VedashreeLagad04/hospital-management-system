import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CaseUpdateStatusPageRoutingModule } from './case-update-status-routing.module';

import { CaseUpdateStatusPage } from './case-update-status.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CaseUpdateStatusPageRoutingModule,
  ],
  declarations: [],
})
export class CaseUpdateStatusPageModule { }
