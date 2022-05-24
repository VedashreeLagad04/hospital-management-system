import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BreadcrumbsComponent } from './breadcrumbs.component';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';



@NgModule({
  declarations: [BreadcrumbsComponent],
  imports: [
    CommonModule,
    IonicModule,
    RouterModule
  ],
  exports: [BreadcrumbsComponent]
})
export class BreadcrumbsModule { }
