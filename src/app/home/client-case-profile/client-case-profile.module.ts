import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { BreadcrumbsModule } from '../breadcrumbs/breadcrumbs.module';
import { ClientCaseProfilePageRoutingModule } from './client-case-profile-routing.module';
import { ClientCaseProfilePage } from './client-case-profile.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    BreadcrumbsModule,
    ClientCaseProfilePageRoutingModule,
  ],
  declarations: [ClientCaseProfilePage],
  entryComponents: [],
})
export class ClientCaseProfilePageModule { }
