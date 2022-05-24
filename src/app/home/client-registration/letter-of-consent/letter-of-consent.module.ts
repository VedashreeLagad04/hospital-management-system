import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { LetterOfConsentPageRoutingModule } from './letter-of-consent-routing.module';

import { LetterOfConsentPage } from './letter-of-consent.page';
// import { ClientRegistrationTermsModalPage } from '../client-registration-terms-modal/client-registration-terms-modal.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    LetterOfConsentPageRoutingModule
  ],
  declarations: [],
  // entryComponents: [ClientRegistrationTermsModalPage]
})
export class LetterOfConsentPageModule { }
