import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ClaimsPageRoutingModule } from './claims-routing.module';

import { ClaimsPage } from './claims.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ClaimsPageRoutingModule
  ],
  declarations: [ClaimsPage]
})
export class ClaimsPageModule {}
