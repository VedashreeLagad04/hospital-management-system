import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PreviewClientInfoPageRoutingModule } from './preview-client-info-routing.module';

import { PreviewClientInfoPage } from './preview-client-info.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PreviewClientInfoPageRoutingModule
  ],
  declarations: [PreviewClientInfoPage]
})
export class PreviewClientInfoPageModule {}
