import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TravelDeclarationPageRoutingModule } from './travel-declaration-routing.module';

import { TravelDeclarationPage } from './travel-declaration.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TravelDeclarationPageRoutingModule
  ],
  declarations: [TravelDeclarationPage]
})
export class TravelDeclarationPageModule {}
