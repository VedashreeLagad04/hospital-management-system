import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ClientCaseListPageRoutingModule } from './client-case-list-routing.module';

import { ClientCaseListPage } from './client-case-list.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ClientCaseListPageRoutingModule
  ],
  declarations: [ClientCaseListPage]
})
export class ClientCaseListPageModule {}
