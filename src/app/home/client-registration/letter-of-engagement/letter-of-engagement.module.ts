import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { LetterOfEngagementPageRoutingModule } from './letter-of-engagement-routing.module';

import { LetterOfEngagementPage } from './letter-of-engagement.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    LetterOfEngagementPageRoutingModule,
  ],
  declarations: [LetterOfEngagementPage],
  // entryComponents: [ClientRegistrationTermsModalPage]
})
export class LetterOfEngagementPageModule { }
