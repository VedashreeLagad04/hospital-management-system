import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ClientProfilePageRoutingModule } from './client-profile-routing.module';

import { ClientProfilePage } from './client-profile.page';
import { AssignedConsultantsModalPageModule } from './assigned-consultants-modal/assigned-consultants-modal.module';
import { AssignedConsultantsModalPage } from './assigned-consultants-modal/assigned-consultants-modal.page';
import { BreadcrumbsModule } from '../breadcrumbs/breadcrumbs.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ClientProfilePageRoutingModule,
    BreadcrumbsModule,
    AssignedConsultantsModalPageModule
  ],
  declarations: [ClientProfilePage, AssignedConsultantsModalPage],
  entryComponents: [AssignedConsultantsModalPage]
})
export class ClientProfilePageModule {}
