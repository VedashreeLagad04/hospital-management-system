import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ClientInformationPageRoutingModule } from './client-information-routing.module';

import { ClientInformationPage } from './client-information.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ClientInformationPageRoutingModule
  ],
  declarations: [ClientInformationPage]
})
export class ClientInformationPageModule {}
