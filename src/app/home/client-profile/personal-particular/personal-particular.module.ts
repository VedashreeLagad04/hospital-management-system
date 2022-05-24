import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PersonalParticularPageRoutingModule } from './personal-particular-routing.module';

import { PersonalParticularPage } from './personal-particular.page';
import { Ng2SearchPipeModule } from 'ng2-search-filter';
import { PdfViewerModule } from 'ng2-pdf-viewer';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PersonalParticularPageRoutingModule,
    PdfViewerModule,
    Ng2SearchPipeModule,
  ],
  declarations: [PersonalParticularPage]
})
export class PersonalParticularPageModule {}
