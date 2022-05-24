import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { ModalController } from '@ionic/angular';
@Component({
  selector: 'app-calculation-modal',
  templateUrl: './calculation-modal.page.html',
  styleUrls: ['./calculation-modal.page.scss'],
})
export class CalculationModalPage implements OnInit {
  constructor(private modalCtrl: ModalController) { }
  public ngOnInit() { }
  public closeModal() {
    this.modalCtrl.dismiss();
  }
}
