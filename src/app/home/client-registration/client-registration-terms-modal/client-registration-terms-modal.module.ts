import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ClientRegistrationTermsModalPageRoutingModule } from './client-registration-terms-modal-routing.module';

import { ClientRegistrationTermsModalPage } from './client-registration-terms-modal.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ClientRegistrationTermsModalPageRoutingModule
  ],
  declarations: [],
  entryComponents: [ClientRegistrationTermsModalPage]
})
export class ClientRegistrationTermsModalPageModule { }
