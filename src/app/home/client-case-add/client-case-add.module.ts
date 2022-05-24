import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ClientCaseAddPageRoutingModule } from './client-case-add-routing.module';

import { ClientCaseAddPage } from './client-case-add.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ClientCaseAddPageRoutingModule
  ],
  declarations: [ClientCaseAddPage]
})
export class ClientCaseAddPageModule {}
