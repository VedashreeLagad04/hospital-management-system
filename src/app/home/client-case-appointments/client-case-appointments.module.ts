import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ClientCaseAppointmentsPageRoutingModule } from './client-case-appointments-routing.module';

import { ClientCaseAppointmentsPage } from './client-case-appointments.page';
import { CreateMemoModalPage } from './create-memo-modal/create-memo-modal.page';
import { BreadcrumbsModule } from '../breadcrumbs/breadcrumbs.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    BreadcrumbsModule,
    ClientCaseAppointmentsPageRoutingModule
  ],
  declarations: [ClientCaseAppointmentsPage, CreateMemoModalPage],
  entryComponents: [CreateMemoModalPage],
})
export class ClientCaseAppointmentsPageModule { }
