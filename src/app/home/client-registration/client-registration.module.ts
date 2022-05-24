import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ClientRegistrationPageRoutingModule } from './client-registration-routing.module';

import { ClientRegistrationPage } from './client-registration.page';
import { LetterOfConsentPage } from './letter-of-consent/letter-of-consent.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ClientRegistrationPageRoutingModule,
  ],
  declarations: [ClientRegistrationPage, LetterOfConsentPage],
  entryComponents: [LetterOfConsentPage,]
})
export class ClientRegistrationPageModule { }
