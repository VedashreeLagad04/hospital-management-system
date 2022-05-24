import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { AppDataService } from 'src/app/services/app-data.service';
@Component({
  selector: 'app-resubmission-modal',
  templateUrl: './resubmission-modal.page.html',
  styleUrls: ['./resubmission-modal.page.scss'],
})
export class ResubmissionModalPage implements OnInit {
  @Input() public newCaseResubmission: any;
  public mode = 'save';
  constructor(private modalCtrl: ModalController, private dataService: AppDataService) { }
  public ngOnInit() {
  }
  public caseResubmit(comments) {
    const date = new Date();
    const today = this.dataService.formatDateAndMonth(date);
    this.newCaseResubmission.date = today.split('/')[0];
    this.newCaseResubmission.comments = comments;
    // this.dismiss(this.newCaseResubmission);
    this.modalCtrl.dismiss(this.newCaseResubmission, 'save');
  }
  public dismiss(caseResubmission) {
    this.modalCtrl.dismiss(caseResubmission, 'cancel');
  }
}
