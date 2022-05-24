import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { FollowUpMemoPageRoutingModule } from './follow-up-memo-routing.module';

import { FollowUpMemoPage } from './follow-up-memo.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    FollowUpMemoPageRoutingModule
  ],
  declarations: [FollowUpMemoPage]
})
export class FollowUpMemoPageModule {}

// tslint:disable-next-line: class-name
export class memo {

}
