import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PolicyPageRoutingModule } from './policy-routing.module';

import { PolicyPage } from './policy.page';
// import { DomChangeDirective } from 'src/app/directive/dom-change.directive';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PolicyPageRoutingModule
  ],
  declarations: [PolicyPage]
})
export class PolicyPageModule { }
