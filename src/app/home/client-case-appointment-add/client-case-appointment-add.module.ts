import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ClientCaseAppointmentAddPageRoutingModule } from './client-case-appointment-add-routing.module';

import { CaseUpdateStatusPage } from '../client-case-profile/case-update-status/case-update-status.page';
import { ClientCaseAppointmentAddPage } from './client-case-appointment-add.page';
import { BreadcrumbsModule } from '../breadcrumbs/breadcrumbs.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    BreadcrumbsModule,
    ClientCaseAppointmentAddPageRoutingModule,
  ],
  declarations: [ClientCaseAppointmentAddPage],
  entryComponents: [],
})
export class ClientCaseAppointmentAddPageModule { }
