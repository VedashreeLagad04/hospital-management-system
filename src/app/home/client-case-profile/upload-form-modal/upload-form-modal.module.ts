import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { UploadFormModalPageRoutingModule } from './upload-form-modal-routing.module';

import { UploadFormModalPage } from './upload-form-modal.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    UploadFormModalPageRoutingModule
  ],
  declarations: [],
  entryComponents: [],

})
export class UploadFormModalPageModule { }
