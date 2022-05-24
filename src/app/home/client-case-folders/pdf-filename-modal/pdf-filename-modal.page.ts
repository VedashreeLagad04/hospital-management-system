import { Component, OnInit } from '@angular/core';
import { ModalController, NavParams } from '@ionic/angular';
import { Observable, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';
import { InsuranceDocsService } from 'src/app/services/insurance-docs.service';
@Component({
  selector: 'app-pdf-filename-modal',
  templateUrl: './pdf-filename-modal.page.html',
  styleUrls: ['./pdf-filename-modal.page.scss'],
})
export class PdfFilenameModalPage implements OnInit {
  public pdfFilenameUpdate = new Subject<any>();
  public pdfFilename: string;
  public existingFiles: any = [];
  public pdfNameExist = false;
  public isBlank = false;
  constructor(private modalController: ModalController,
              private navParams: NavParams,
              private insuranceDocsService: InsuranceDocsService) { }
  public ngOnInit() {
    this.existingFiles = this.navParams.get('existingFiles');
    this.pdfFilenameUpdate.pipe(
      debounceTime(3000),
      distinctUntilChanged())
      .subscribe((event: any) => {
        for (const file of this.existingFiles) {
          const fileExtension = file.fileName.split(/[. ]+/).pop();
          const filename = file.fileName.split('.' + fileExtension);
          if (this.pdfFilename.toLowerCase() === filename[0].toLowerCase()) {
            if (!(this.pdfNameExist)) {
              this.insuranceDocsService.presentAlert('Filename already exists');
            }
          }
        }
        if (this.pdfFilename === '') {
          if (!(this.isBlank)) {
            this.insuranceDocsService.presentAlert('Filename cannot be empty');
          }
        }
      });
  }
  public validateFileName() {
    for (const file of this.existingFiles) {
      const fileExtension = file.fileName.split(/[. ]+/).pop();
      const filename = file.fileName.split('.' + fileExtension);
      if (this.pdfFilename.toLowerCase() === filename[0].toLowerCase()) {
        this.pdfNameExist = true;
        this.insuranceDocsService.presentAlert('Filename already exists');
        return false;
      }
    }
    if (this.pdfFilename === '') {
      this.isBlank = true;
      this.insuranceDocsService.presentAlert('Filename cannot be empty');
      return false;
    }
    this.isBlank = false;
    this.pdfNameExist = false;
    return true;
  }
  public async closeFileModal() {
    if (this.validateFileName()) {
      this.modalController.dismiss(this.pdfFilename, 'success');
    }
  }
  public closeModal() {
    this.modalController.dismiss('', 'close');
  }
}
