import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CreateMemoModalPageRoutingModule } from './create-memo-modal-routing.module';

import { CreateMemoModalPage } from './create-memo-modal.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CreateMemoModalPageRoutingModule
  ],
  declarations: []
})
export class CreateMemoModalPageModule {}
