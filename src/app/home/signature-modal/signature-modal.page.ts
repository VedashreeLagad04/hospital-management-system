import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { SignaturePad } from 'angular2-signaturepad/signature-pad';
@Component({
  selector: 'app-signature-modal',
  templateUrl: './signature-modal.page.html',
  styleUrls: ['./signature-modal.page.scss'],
})
export class SignatureModalPage implements OnInit {
  @Input()
  public signature;
  public horizontalLines = new Array(17);
  public isDrawing = true;
  @ViewChild('sigpad', { static: false }) public signaturePad: SignaturePad;
  // tslint:disable-next-line: ban-types
  public signaturePadOptions: Object = {
    minWidth: 1,
    canvasWidth: 500,
    canvasHeight: 250,
    penColor: '#000000',
    dotSize: 0.5,
    background: '#fff'
  };
  constructor(private modalCtrl: ModalController) { }
  public ionViewDidEnter() {
    this.signaturePad.set('minWidth', 1);
    this.signaturePad.set('canvasWidth', document.getElementById('sign-pad-wrap').offsetWidth);
    this.signaturePad.set('canvasHeight', document.getElementById('sign-pad-wrap').offsetHeight);
    this.signaturePad.clear();
  }
  public ngOnInit() {
  }
  public drawComplete() {
    setTimeout(() => {
      this.isDrawing = false;
    }, 500);
  }
  public drawStart() {
    this.isDrawing = true;
  }
  public clearPad() {
    this.signaturePad.clear();
    this.signature = '';
    this.isDrawing = true;
  }
  public closeModal() {
    if (this.signature) {
      this.modalCtrl.dismiss(this.signature, 'cancel');
    } else {
      this.modalCtrl.dismiss(undefined, 'cancel');
    }
  }
  public saveSignature() {
    this.signature = this.signaturePad.toDataURL('image/png', 0.5);
    this.modalCtrl.dismiss(this.signature, 'success');
  }
}
